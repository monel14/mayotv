/**
 * Module de traitement des données statiques MAYO TV
 * Charge et traite les fichiers JSON statiques côté client
 */

class StaticDataProcessor {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Charge un fichier JSON avec cache
   */
  async loadJsonFile(filename) {
    const cacheKey = filename;
    const now = Date.now();
    
    // Vérifier le cache
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (now - timestamp < this.cacheExpiry) {
        return data;
      }
    }
    
    // Charger depuis le fichier
    try {
      const response = await fetch(`data/${filename}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Mettre en cache
      this.cache.set(cacheKey, { data, timestamp: now });
      
      return data;
    } catch (error) {
      console.error(`Erreur lors du chargement de ${filename}:`, error.message);
      throw error;
    }
  }

  /**
   * Traite les données pour l'interface MAYO TV
   */
  async processDataForMayoTV() {
    try {
      console.log('🔄 Traitement des données statiques...');
      
      // Charger toutes les données nécessaires
      const [channels, countries, categories, languages, feeds, streams, logos] = await Promise.all([
        this.loadJsonFile('channels.json'),
        this.loadJsonFile('countries.json'),
        this.loadJsonFile('categories.json'),
        this.loadJsonFile('languages.json'),
        this.loadJsonFile('feeds.json'),
        this.loadJsonFile('streams.json'),
        this.loadJsonFile('logos.json')
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

      // Grouper les logos par channel
      logos.forEach(logo => {
        if (!logosMap.has(logo.channel)) {
          logosMap.set(logo.channel, []);
        }
        logosMap.get(logo.channel).push(logo);
      });

      /**
       * Obtient le meilleur logo pour une chaîne
       */
      const getBestLogo = (channelId) => {
        const channelLogos = logosMap.get(channelId) || [];
        if (channelLogos.length === 0) {
          return MAYO_CONFIG.FALLBACK.GENERIC_LOGO_LOCAL;
        }
        
        // Trier les logos par préférence
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
          
          // Priorité à la taille optimale
          const aScore = Math.abs((a.width || 150) - 150) + Math.abs((a.height || 150) - 150);
          const bScore = Math.abs((b.width || 150) - 150) + Math.abs((b.height || 150) - 150);
          
          return aScore - bScore;
        });
        
        return sortedLogos[0].url;
      };

      /**
       * Obtient le nom enrichi avec la qualité
       */
      const getEnrichedChannelName = (channel) => {
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
        
        // Extraire la qualité
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
        
        if (!quality && bestStream.name) {
          const qualityMatch = bestStream.name.match(/\((\d+p|HD|FHD|4K)\)/i);
          if (qualityMatch) {
            quality = qualityMatch[1];
          }
        }
        
        return quality ? `${channel.name} (${quality})` : channel.name;
      };

      // Organiser par pays (seulement les chaînes avec des flux)
      const channelsByCountry = {};
      
      channels.forEach(channel => {
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
        
        channelsByCountry[countryName].push({
          id: channel.id,
          name: getEnrichedChannelName(channel),
          group: countryName,
          country: channel.country,
          logo: MAYO_CONFIG.getReliableLogo(getBestLogo(channel.id), channel.name),
          website: channel.website || '',
          categories: channel.categories || [],
          feeds: feedsMap.get(channel.id) || [],
          streams: channelStreams,
          isNSFW: channel.is_nsfw || false
        });
      });

      // Organiser par catégories
      const channelsByCategory = {};
      
      channels.forEach(channel => {
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
            logo: MAYO_CONFIG.getReliableLogo(getBestLogo(channel.id), channel.name),
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
            logo: MAYO_CONFIG.getReliableLogo(getBestLogo(channel.id), channel.name),
            feeds: feedsMap.get(channel.id) || [],
            streams: channelStreams
          });
        });
      });

      const orphanStreams = streams.filter(stream => stream.channel === null && stream.title);

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
          channelsWithLogos: channels.filter(channel => (logosMap.get(channel.id) || []).length > 0).length
        }
      };

    } catch (error) {
      console.error('❌ Erreur lors du traitement des données:', error);
      throw error;
    }
  }

  /**
   * Charge les données pour un type spécifique (country, category, etc.)
   */
  async loadDataByType(type) {
    const processedData = await this.processDataForMayoTV();
    
    switch (type) {
      case 'country':
        return processedData.channelsByCountry;
      case 'category':
        return processedData.channelsByCategory;
      case 'stats':
        return processedData.stats;
      case 'countries':
        return processedData.countries;
      default:
        throw new Error(`Type de données non supporté: ${type}`);
    }
  }
}

// Instance globale
window.StaticDataProcessor = new StaticDataProcessor();