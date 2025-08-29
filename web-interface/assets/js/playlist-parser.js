/**
 * MAYO TV - Module d'analyse des playlists M3U
 * Gère le chargement, l'analyse et la structuration des données de playlists
 */

class PlaylistParser {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.currentAbortController = null;
  }

  /**
   * Charge et analyse une playlist depuis les données statiques
   * @param {string} playlistType - Type de playlist (country, category, language, region)
   * @returns {Promise<Object>} Données structurées par catégories
   */
  async loadPlaylist(playlistType) {
    try {
      MAYO_CONFIG.log('info', `Chargement des données statiques: ${playlistType}`);
      
      // Vérifier le cache
      const cachedData = this.getCachedData(playlistType);
      if (cachedData) {
        MAYO_CONFIG.log('info', `Données récupérées du cache pour: ${playlistType}`);
        return cachedData;
      }

      // Annuler la requête précédente si elle existe
      if (this.currentAbortController) {
        this.currentAbortController.abort();
      }

      // Créer un nouveau contrôleur d'annulation
      this.currentAbortController = new AbortController();

      // Utiliser les données statiques
      if (MAYO_CONFIG.STATIC_DATA && MAYO_CONFIG.STATIC_DATA.enabled) {
        MAYO_CONFIG.log('info', 'Utilisation des données statiques');
        return await this.loadFromStaticData(playlistType);
      } else {
        MAYO_CONFIG.log('info', 'Fallback vers le serveur local');
        return await this.loadFromLocalServer(playlistType);
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        MAYO_CONFIG.log('info', 'Requête annulée');
        return null;
      }
      
      MAYO_CONFIG.log('error', 'Erreur lors du chargement des données', error);
      throw error;
    }
  }

  /**
   * Charge les données depuis les fichiers statiques
   * @param {string} playlistType - Type de playlist
   * @returns {Promise<Object>} Données structurées
   */
  async loadFromStaticData(playlistType) {
    try {
      if (window.StaticDataProcessor) {
        const data = await window.StaticDataProcessor.loadDataByType(playlistType);
        
        // Mettre en cache
        this.setCachedData(playlistType, data);
        
        MAYO_CONFIG.log('info', `Données statiques chargées: ${Object.keys(data).length} catégories`);
        
        return data;
      } else {
        throw new Error('StaticDataProcessor non disponible');
      }
    } catch (error) {
      MAYO_CONFIG.log('error', 'Erreur lors du chargement des données statiques', error);
      throw error;
    }
  }

  /**
   * Charge les données depuis le serveur local (OBLIGATOIRE)
   * @param {string} playlistType - Type de playlist
   * @returns {Promise<Object>} Données structurées
   */
  async loadFromLocalServer(playlistType) {
    const url = MAYO_CONFIG.getLocalDataUrl(playlistType);
    
    const response = await fetch(url, {
      signal: this.currentAbortController.signal,
      timeout: MAYO_CONFIG.LIMITS.REQUEST_TIMEOUT
    });

    if (!response.ok) {
      throw new Error(`Serveur local non accessible: ${response.status} - Veuillez démarrer le serveur local avec 'node local-data-server.js'`);
    }

    const data = await response.json();
    
    // Mettre en cache
    this.setCachedData(playlistType, data);
    
    MAYO_CONFIG.log('info', `Données locales chargées: ${Object.keys(data).length} catégories`);
    
    return data;
  }

  /**
   * Charge les données depuis les URLs publiques (méthode existante renommée)
   * @param {string} playlistType - Type de playlist
   * @returns {Promise<Object>} Données structurées
   */
  async loadFromPublicUrl(playlistType) {
    // Obtenir l'URL de la playlist
    const playlistUrl = MAYO_CONFIG.getPlaylistUrl(playlistType);
    if (!playlistUrl) {
      throw new Error(`Type de playlist non supporté: ${playlistType}`);
    }

    // Charger la playlist
    const response = await fetch(playlistUrl, {
      signal: this.currentAbortController.signal,
      timeout: MAYO_CONFIG.LIMITS.REQUEST_TIMEOUT
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }

    const m3uText = await response.text();
    
    // Analyser la playlist
    const parsedData = this.parseM3uContent(m3uText);
    
    // Mettre en cache
    this.setCachedData(playlistType, parsedData);
    
    MAYO_CONFIG.log('info', `Playlist publique analysée: ${Object.keys(parsedData).length} catégories`);
    
    return parsedData;
  }

  /**
   * Analyse le contenu M3U et structure les données
   * @param {string} m3uText - Contenu brut de la playlist M3U
   * @returns {Object} Données structurées par catégories
   */
  parseM3uContent(m3uText) {
    const lines = m3uText.split('\n');
    const channelsByCategory = {};
    let currentChannel = {};
    let totalChannels = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('#EXTINF:')) {
        // Analyser la ligne d'information de la chaîne
        currentChannel = this.parseExtinfLine(line);
        
      } else if (line && !line.startsWith('#') && currentChannel.name) {
        // URL de la chaîne
        currentChannel.url = line;
        currentChannel.id = this.generateChannelId(currentChannel);
        
        // Ajouter à la catégorie appropriée
        if (currentChannel.group) {
          if (!channelsByCategory[currentChannel.group]) {
            channelsByCategory[currentChannel.group] = [];
          }
          
          // Limiter le nombre de chaînes par catégorie (si les limites sont activées)
          const maxChannels = MAYO_CONFIG.LIMITS.ENABLE_UNLIMITED_LOADING ? 
            Infinity : MAYO_CONFIG.LIMITS.MAX_CHANNELS_PER_CATEGORY;
          
          if (channelsByCategory[currentChannel.group].length < maxChannels) {
            channelsByCategory[currentChannel.group].push({...currentChannel});
            totalChannels++;
          }
        }
        
        // Réinitialiser pour la prochaine chaîne
        currentChannel = {};
      }
    }

    // Trier les catégories et leurs chaînes
    const sortedCategories = {};
    const maxCategories = MAYO_CONFIG.LIMITS.ENABLE_UNLIMITED_LOADING ? 
      Object.keys(channelsByCategory).length : MAYO_CONFIG.LIMITS.MAX_CATEGORIES;
    
    Object.keys(channelsByCategory)
      .sort()
      .slice(0, maxCategories)
      .forEach(category => {
        sortedCategories[category] = channelsByCategory[category]
          .sort((a, b) => a.name.localeCompare(b.name));
      });

    MAYO_CONFIG.log('debug', `Analysé ${totalChannels} chaînes dans ${Object.keys(sortedCategories).length} catégories`);
    
    return sortedCategories;
  }

  /**
   * Analyse une ligne #EXTINF pour extraire les métadonnées
   * @param {string} line - Ligne #EXTINF
   * @returns {Object} Métadonnées de la chaîne
   */
  parseExtinfLine(line) {
    // Extraire le nom de la chaîne
    const nameMatch = line.split(',');
    const name = nameMatch.length > 1 ? nameMatch.slice(1).join(',').trim() : 'Chaîne inconnue';

    // Extraire les attributs
    const attributes = this.extractAttributes(line);

    return {
      name: this.sanitizeChannelName(name),
      group: attributes.groupTitle || 'Non classé',
      logo: attributes.tvgLogo || MAYO_CONFIG.FALLBACK.LOGO,
      country: attributes.tvgCountry || '',
      language: attributes.tvgLanguage || '',
      url: '',
      id: ''
    };
  }

  /**
   * Extrait les attributs d'une ligne M3U
   * @param {string} line - Ligne M3U
   * @returns {Object} Attributs extraits
   */
  extractAttributes(line) {
    const attributes = {};
    
    // Patterns pour extraire les attributs
    const patterns = {
      groupTitle: /group-title="([^"]*)"/,
      tvgLogo: /tvg-logo="([^"]*)"/,
      tvgCountry: /tvg-country="([^"]*)"/,
      tvgLanguage: /tvg-language="([^"]*)"/,
      tvgId: /tvg-id="([^"]*)"/,
      tvgName: /tvg-name="([^"]*)"/
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = line.match(pattern);
      if (match) {
        attributes[key] = match[1].trim();
      }
    }

    return attributes;
  }

  /**
   * Nettoie et normalise le nom d'une chaîne
   * @param {string} name - Nom brut de la chaîne
   * @returns {string} Nom nettoyé
   */
  sanitizeChannelName(name) {
    return name
      .replace(/^\s*\|\s*/, '') // Supprimer les pipes au début
      .replace(/\s*\|\s*$/, '') // Supprimer les pipes à la fin
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim();
  }

  /**
   * Génère un ID unique pour une chaîne
   * @param {Object} channel - Données de la chaîne
   * @returns {string} ID unique
   */
  generateChannelId(channel) {
    const text = `${channel.name}_${channel.group}_${channel.url}`;
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir en 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Récupère les données du cache si elles sont valides
   * @param {string} playlistType - Type de playlist
   * @returns {Object|null} Données mises en cache ou null
   */
  getCachedData(playlistType) {
    const now = Date.now();
    const expiry = this.cacheExpiry.get(playlistType);
    
    if (expiry && now < expiry) {
      return this.cache.get(playlistType);
    }
    
    // Nettoyer le cache expiré
    this.cache.delete(playlistType);
    this.cacheExpiry.delete(playlistType);
    
    return null;
  }

  /**
   * Met en cache les données avec expiration
   * @param {string} playlistType - Type de playlist
   * @param {Object} data - Données à mettre en cache
   */
  setCachedData(playlistType, data) {
    const now = Date.now();
    this.cache.set(playlistType, data);
    this.cacheExpiry.set(playlistType, now + MAYO_CONFIG.LIMITS.CACHE_DURATION);
    
    // Sauvegarder dans localStorage
    try {
      const cacheData = {
        data: data,
        timestamp: now,
        expiry: now + MAYO_CONFIG.LIMITS.CACHE_DURATION
      };
      localStorage.setItem(
        `${MAYO_CONFIG.CACHE.PREFIX}${playlistType}`,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      MAYO_CONFIG.log('warn', 'Impossible de sauvegarder dans localStorage', error);
    }
  }

  /**
   * Charge les données depuis localStorage au démarrage
   */
  loadFromLocalStorage() {
    try {
      for (const type of Object.keys(MAYO_CONFIG.PLAYLIST_URLS)) {
        const cached = localStorage.getItem(`${MAYO_CONFIG.CACHE.PREFIX}${type}`);
        if (cached) {
          const cacheData = JSON.parse(cached);
          const now = Date.now();
          
          if (now < cacheData.expiry) {
            this.cache.set(type, cacheData.data);
            this.cacheExpiry.set(type, cacheData.expiry);
          } else {
            localStorage.removeItem(`${MAYO_CONFIG.CACHE.PREFIX}${type}`);
          }
        }
      }
    } catch (error) {
      MAYO_CONFIG.log('warn', 'Erreur lors du chargement du cache localStorage', error);
    }
  }

  /**
   * Vide le cache
   */
  clearCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
    
    // Nettoyer localStorage
    try {
      for (const type of Object.keys(MAYO_CONFIG.PLAYLIST_URLS)) {
        localStorage.removeItem(`${MAYO_CONFIG.CACHE.PREFIX}${type}`);
      }
    } catch (error) {
      MAYO_CONFIG.log('warn', 'Erreur lors du nettoyage du cache localStorage', error);
    }
  }

  /**
   * Recherche des chaînes par nom
   * @param {Object} channelsByCategory - Données des chaînes
   * @param {string} query - Terme de recherche
   * @returns {Array} Chaînes correspondantes
   */
  searchChannels(channelsByCategory, query) {
    const results = [];
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) return results;
    
    for (const [category, channels] of Object.entries(channelsByCategory)) {
      for (const channel of channels) {
        if (channel.name.toLowerCase().includes(searchTerm) ||
            category.toLowerCase().includes(searchTerm)) {
          results.push({
            ...channel,
            category: category
          });
        }
      }
    }
    
    return results.sort((a, b) => a.name.localeCompare(b.name));
  }
}

// Export global
window.PlaylistParser = PlaylistParser;