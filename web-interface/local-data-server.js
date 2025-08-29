#!/usr/bin/env node

/**
 * Serveur de données local pour MAYO TV
 * Sert les métadonnées depuis temp/data/ pour de meilleures performances
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3002;
const DATA_DIR = '../temp/data';

// Configuration CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// Cache en mémoire pour les performances
const dataCache = new Map();
const cacheExpiry = 5 * 60 * 1000; // 5 minutes

/**
 * Charge un fichier JSON avec cache
 */
async function loadJsonFile(filename) {
  const cacheKey = filename;
  const now = Date.now();
  
  // Vérifier le cache
  if (dataCache.has(cacheKey)) {
    const { data, timestamp } = dataCache.get(cacheKey);
    if (now - timestamp < cacheExpiry) {
      return data;
    }
  }
  
  // Charger depuis le fichier
  try {
    const filePath = path.join(__dirname, DATA_DIR, filename);
    const rawData = await fs.promises.readFile(filePath, 'utf8');
    const data = JSON.parse(rawData);
    
    // Mettre en cache
    dataCache.set(cacheKey, { data, timestamp: now });
    
    return data;
  } catch (error) {
    console.error(`Erreur lors du chargement de ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Traite les données pour l'interface MAYO TV
 */
async function processDataForMayoTV() {
  try {
    console.log('🔄 Traitement des données...');
    
    // Charger toutes les données nécessaires
    const [channels, countries, categories, languages, feeds, streams, logos] = await Promise.all([
      loadJsonFile('channels.json'),
      loadJsonFile('countries.json'),
      loadJsonFile('categories.json'),
      loadJsonFile('languages.json'),
      loadJsonFile('feeds.json'),
      loadJsonFile('streams.json'),
      loadJsonFile('logos.json')
    ]);

    console.log(`📊 Données chargées: ${channels.length} chaînes, ${countries.length} pays`);
    console.log(`🔄 Traitement des flux: ${streams.length} total, ${streams.filter(s => s.channel !== null).length} liés, ${streams.filter(s => s.channel === null).length} orphelins`);

    // Créer les mappings pour de meilleures performances
    const channelsMap = new Map(channels.map(ch => [ch.id, ch]));
    const countriesMap = new Map(countries.map(c => [c.code, c]));
    const categoriesMap = new Map(categories.map(cat => [cat.id, cat]));
    const feedsMap = new Map();
    const streamsMap = new Map();
    const logosMap = new Map();
    
    // Grouper les feeds par channel_id
    feeds.forEach(feed => {
      if (feed.channel_id && !feedsMap.has(feed.channel_id)) {
        feedsMap.set(feed.channel_id, []);
      }
      if (feed.channel_id) {
        feedsMap.get(feed.channel_id).push(feed);
      }
    });

    // Grouper les streams par channel
    streams.forEach(stream => {
      if (stream.channel && !streamsMap.has(stream.channel)) {
        streamsMap.set(stream.channel, []);
      }
      if (stream.channel) {
        streamsMap.get(stream.channel).push(stream);
      }
    });

    // Compter les flux orphelins sans traitement de récupération
    const orphanStreams = streams.filter(stream => stream.channel === null && stream.title);

    // Grouper les logos par channel (pas channel_id dans ce fichier)
    logos.forEach(logo => {
      if (!logosMap.has(logo.channel)) {
        logosMap.set(logo.channel, []);
      }
      logosMap.get(logo.channel).push(logo);
    });

    /**
     * Obtient le meilleur logo pour une chaîne
     */
    function getBestLogo(channelId) {
      const channelLogos = logosMap.get(channelId) || [];
      if (channelLogos.length === 0) {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZTBlMGUwIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI4MCIgZm9udC1mYW1pbHk9IkludGVyLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Mb2dvPC90ZXh0Pgo8L3N2Zz4K';
      }
      
      // Trier les logos par préférence (priorité : feed principal > format > taille)
      const sortedLogos = channelLogos.sort((a, b) => {
        // Priorité au feed principal
        const aIsMaster = a.feed && feedsMap.get(channelId)?.find(f => f.id === a.feed)?.is_master;
        const bIsMaster = b.feed && feedsMap.get(channelId)?.find(f => f.id === b.feed)?.is_master;
        
        if (aIsMaster && !bIsMaster) return -1;
        if (!aIsMaster && bIsMaster) return 1;
        
        // Priorité aux formats vectoriels
        const formatPriority = { 'svg': 0, 'png': 1, 'jpg': 2, 'jpeg': 2, 'webp': 3, 'gif': 4 };
        const aFormat = (a.url.split('.').pop() || '').toLowerCase();
        const bFormat = (b.url.split('.').pop() || '').toLowerCase();
        
        const aPriority = formatPriority[aFormat] || 5;
        const bPriority = formatPriority[bFormat] || 5;
        
        if (aPriority !== bPriority) return aPriority - bPriority;
        
        // Priorité à la taille optimale (proche de 150x150)
        const aScore = Math.abs((a.width || 150) - 150) + Math.abs((a.height || 150) - 150);
        const bScore = Math.abs((b.width || 150) - 150) + Math.abs((b.height || 150) - 150);
        
        return aScore - bScore;
      });
      
      return sortedLogos[0].url;
    }

    /**
     * Obtient le nom enrichi avec la qualité
     */
    function getEnrichedChannelName(channel) {
      const channelStreams = streamsMap.get(channel.id) || [];
      
      if (channelStreams.length === 0) {
        return channel.name;
      }
      
      // Trouver le stream avec la meilleure qualité
      const bestStream = channelStreams.reduce((best, current) => {
        const currentHeight = parseInt(current.height) || 0;
        const bestHeight = parseInt(best.height) || 0;
        return currentHeight > bestHeight ? current : best;
      }, channelStreams[0]);
      
      // Extraire la qualité du nom ou de la résolution
      let quality = '';
      const height = parseInt(bestStream.height) || 0;
      
      if (height >= 2160) {
        quality = '4K';
      } else if (height >= 1440) {
        quality = '1440p';
      } else if (height >= 1080) {
        quality = '1080p';
      } else if (height >= 720) {
        quality = '720p';
      } else if (height >= 480) {
        quality = '480p';
      } else if (height >= 360) {
        quality = '360p';
      }
      
      // Si pas de qualité détectée, chercher dans le nom du stream
      if (!quality && bestStream.name) {
        const qualityMatch = bestStream.name.match(/\((\d+p|HD|FHD|4K)\)/i);
        if (qualityMatch) {
          quality = qualityMatch[1];
        }
      }
      
      return quality ? `${channel.name} (${quality})` : channel.name;
    }

    // Organiser les chaînes par pays (seulement celles avec des flux)
    const channelsByCountry = {};
    
    channels.forEach(channel => {
      // Ne traiter que les chaînes qui ont des flux
      const channelStreams = streamsMap.get(channel.id) || [];
      if (channelStreams.length === 0) {
        return; // Ignorer les chaînes sans flux
      }
      
      const country = countriesMap.get(channel.country);
      if (!country) return;
      
      const countryName = country.name;
      if (!channelsByCountry[countryName]) {
        channelsByCountry[countryName] = [];
      }
      
      // Enrichir les données de la chaîne
      const enrichedChannel = {
        id: channel.id,
        name: getEnrichedChannelName(channel),
        group: countryName,
        country: channel.country,
        logo: getBestLogo(channel.id),
        website: channel.website || '',
        categories: channel.categories || [],
        feeds: feedsMap.get(channel.id) || [],
        streams: channelStreams,
        isNSFW: channel.is_nsfw || false
      };
      
      channelsByCountry[countryName].push(enrichedChannel);
    });

    // Organiser par catégories (seulement les chaînes avec des flux)
    const channelsByCategory = {};
    
    channels.forEach(channel => {
      // Ne traiter que les chaînes qui ont des flux
      const channelStreams = streamsMap.get(channel.id) || [];
      if (channelStreams.length === 0) {
        return; // Ignorer les chaînes sans flux
      }
      
      if (!channel.categories || channel.categories.length === 0) {
        if (!channelsByCategory['Non classé']) {
          channelsByCategory['Non classé'] = [];
        }
        channelsByCategory['Non classé'].push({
          id: channel.id,
          name: getEnrichedChannelName(channel),
          group: 'Non classé',
          country: channel.country,
          logo: getBestLogo(channel.id),
          feeds: feedsMap.get(channel.id) || [],
          streams: channelStreams
        });
        return;
      }
      
      channel.categories.forEach(categoryId => {
        const category = categoriesMap.get(categoryId);
        const categoryName = category ? category.name : 'Non classé';
        
        if (!channelsByCategory[categoryName]) {
          channelsByCategory[categoryName] = [];
        }
        
        channelsByCategory[categoryName].push({
          id: channel.id,
          name: getEnrichedChannelName(channel),
          group: categoryName,
          country: channel.country,
          logo: getBestLogo(channel.id),
          feeds: feedsMap.get(channel.id) || [],
          streams: channelStreams
        });
      });
    });

    return {
      channelsByCountry,
      channelsByCategory,
      countries: countries.sort((a, b) => a.name.localeCompare(b.name)),
      categories: categories.sort((a, b) => a.name.localeCompare(b.name)),
      stats: {
        totalChannels: channels.length,
        channelsWithStreams: channels.filter(channel => (streamsMap.get(channel.id) || []).length > 0).length,
        totalCountries: countries.length,
        totalCategories: categories.length,
        totalLogos: logos.length,
        totalStreams: streams.length,
        linkedStreams: streams.filter(s => s.channel !== null).length,
        orphanStreams: orphanStreams.length,
        lastUpdated: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('❌ Erreur lors du traitement des données:', error);
    throw error;
  }
}

/**
 * Gestionnaire de requêtes HTTP
 */
const server = http.createServer(async (req, res) => {
  // Headers CORS
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });
  
  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  try {
    switch (url.pathname) {
      case '/api/data':
        const playlistType = url.searchParams.get('type') || 'country';
        console.log(`📡 Requête API: type=${playlistType}`);
        
        const data = await processDataForMayoTV();
        
        let response;
        switch (playlistType) {
          case 'country':
            response = data.channelsByCountry;
            break;
          case 'category':
            response = data.channelsByCategory;
            break;
          default:
            response = data.channelsByCountry;
        }
        
        res.writeHead(200);
        res.end(JSON.stringify(response));
        break;
        
      case '/api/stats':
        console.log('📊 Requête stats');
        const statsData = await processDataForMayoTV();
        res.writeHead(200);
        res.end(JSON.stringify(statsData.stats));
        break;
        
      case '/api/countries':
        console.log('🌍 Requête pays');
        const countriesData = await loadJsonFile('countries.json');
        res.writeHead(200);
        res.end(JSON.stringify(countriesData));
        break;
        
      default:
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Endpoint non trouvé' }));
    }
    
  } catch (error) {
    console.error('❌ Erreur serveur:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
});

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`🚀 Serveur de données local démarré sur http://localhost:${PORT}`);
  console.log(`📁 Données servies depuis: ${path.resolve(__dirname, DATA_DIR)}`);
  console.log(`🔗 Endpoints disponibles:`);
  console.log(`   • http://localhost:${PORT}/api/data?type=country`);
  console.log(`   • http://localhost:${PORT}/api/data?type=category`);
  console.log(`   • http://localhost:${PORT}/api/stats`);
  console.log(`   • http://localhost:${PORT}/api/countries`);
});

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non gérée:', error);
});

process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du serveur...');
  process.exit(0);
});