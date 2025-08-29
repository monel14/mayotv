// Configuration des endpoints API MAYO TV
window.MAYO_CONFIG = {
  // URLs des playlists iptv-org
  PLAYLIST_URLS: {
    country: 'https://iptv-org.github.io/iptv/index.country.m3u',
    category: 'https://iptv-org.github.io/iptv/index.category.m3u',
    language: 'https://iptv-org.github.io/iptv/index.language.m3u',
    region: 'https://iptv-org.github.io/iptv/index.region.m3u'
  },

  // Configuration des données statiques locales
  STATIC_DATA: {
    enabled: true, // Utilise les fichiers JSON statiques
    baseUrl: './data', // Répertoire des fichiers JSON
    files: {
      channels: 'channels.json',
      countries: 'countries.json',
      categories: 'categories.json',
      languages: 'languages.json',
      streams: 'streams.json',
      logos: 'logos.json',
      feeds: 'feeds.json'
    }
  },

  // Configuration du serveur local de données
  LOCAL_DATA_SERVER: {
    enabled: false, // Désactivé pour utiliser les fichiers statiques
    baseUrl: '/temp/data',
    endpoints: {
      playlists: '/playlists.json',
      channels: '/channels.json',
      streams: '/streams.json',
      countries: '/countries.json',
      categories: '/categories.json',
      languages: '/languages.json'
    }
  },

  // Proxy CORS pour contourner les restrictions
  CORS_PROXY: 'https://corsproxy.io/?',

  // Configuration de l'application
  APP: {
    TITLE: 'MAYO TV',
    THEME_COLOR: '#5490a8',
    VERSION: '1.0.0',
    DESCRIPTION: 'Interface web moderne pour lecteur IPTV'
  },

  // Limites et contraintes
  LIMITS: {
    MAX_CHANNELS_PER_CATEGORY: 500,  // Augmenté de 100 à 500
    MAX_CATEGORIES: 200,             // Augmenté de 50 à 200 (tous les pays)
    CACHE_DURATION: 1000 * 60 * 30, // 30 minutes
    REQUEST_TIMEOUT: 10000, // 10 secondes
    ENABLE_UNLIMITED_LOADING: true   // Nouvelle option pour charger tous les pays
  },

  // Configuration du lecteur HLS
  HLS_CONFIG: {
    enableWorker: true,
    lowLatencyMode: false,
    backBufferLength: 90,
    maxBufferLength: 30,
    maxMaxBufferLength: 600,
    maxBufferSize: 60 * 1000 * 1000, // 60MB
    maxBufferHole: 0.5,
    highBufferWatchdogPeriod: 2,
    nudgeOffset: 0.1,
    nudgeMaxRetry: 3,
    maxFragLookUpTolerance: 0.25,
    enableSoftwareAES: true,
    manifestLoadingTimeOut: 10000,
    manifestLoadingMaxRetry: 1,
    fragLoadingTimeOut: 20000,
    fragLoadingMaxRetry: 6,
    startFragPrefetch: false,
    testBandwidth: true
  },

  // Messages et textes de l'interface
  MESSAGES: {
    LOADING: 'Chargement de la playlist...',
    ERROR_FETCH: 'Impossible de charger la playlist.',
    ERROR_PARSE: 'Erreur lors de l\'analyse de la playlist.',
    ERROR_STREAM: 'Impossible de lire cette chaîne.',
    ERROR_BROWSER: 'Votre navigateur ne supporte pas la lecture HLS.',
    ERROR_CORS: 'Accès bloqué par les politiques CORS. Ce flux peut avoir des restrictions.',
    ERROR_NETWORK: 'Erreur réseau. Vérifiez votre connexion internet.',
    ERROR_TIMEOUT: 'Connexion trop lente. Le flux met trop de temps à répondre.',
    ERROR_404: 'Flux introuvable. Ce flux n\'est peut-être plus disponible.',
    NO_CHANNELS: 'Aucune chaîne trouvée dans cette catégorie.',
    NO_CATEGORIES: 'Aucune catégorie trouvée.',
    FLUX_UNAVAILABLE: 'Ce flux n\'est temporairement pas disponible. Essayez plus tard.',
    TAILWIND_WARNING: 'Mode développement détecté - Les avertissements Tailwind sont normaux.'
  },

  // Configuration du cache local
  CACHE: {
    PREFIX: 'mayo_tv_',
    KEYS: {
      PLAYLISTS: 'playlists',
      PREFERENCES: 'preferences',
      LAST_CATEGORY: 'last_category',
      LAST_PLAYLIST_TYPE: 'last_playlist_type'
    }
  },

  // Configuration des performances
  PERFORMANCE: {
    LAZY_LOAD_THRESHOLD: 20, // Nombre de chaînes avant lazy loading
    IMAGE_LAZY_LOAD: true,
    DEBOUNCE_SEARCH: 300, // ms
    CHUNK_SIZE: 50, // Nombre d'éléments à traiter par chunk
    IMAGE_TIMEOUT: 5000, // Timeout pour le chargement des images (5s)
    MAX_RETRIES_IMAGES: 2 // Nombre max de tentatives pour les images
  },

  // URLs de fallback pour les logos et gestion des domaines problématiques
  FALLBACK: {
    LOGO: 'assets/images/logos/logo.png', // Logo local par défaut
    // Domaines connus pour être problématiques (timeouts fréquents)
    PROBLEMATIC_DOMAINS: [
      'imgur.com',
      'i.imgur.com',
      'imgbox.com',
      'postimg.cc',
      'imageban.ru'
    ],
    // Logo générique local pour les chaînes
    GENERIC_LOGO_LOCAL: 'assets/images/logos/logo.png',
    // Alternative générique pour les logos SVG
    GENERIC_LOGO_SVG: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%235490a8'/%3E%3Ctext x='50' y='55' font-family='Arial,sans-serif' font-size='20' fill='white' text-anchor='middle' font-weight='bold'%3ETV%3C/text%3E%3C/svg%3E`
  },

  // Configuration de développement
  DEV: {
    DEBUG: false,
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    MOCK_DATA: false
  },

  // Analytics et suivi (optionnel)
  ANALYTICS: {
    ENABLED: false,
    TRACK_EVENTS: [
      'category_view',
      'channel_click',
      'stream_play',
      'stream_error',
      'app_load'
    ]
  }
};

// Fonction utilitaire pour obtenir l'URL complète avec proxy
window.MAYO_CONFIG.getPlaylistUrl = function(type) {
  const baseUrl = this.PLAYLIST_URLS[type];
  return baseUrl ? `${this.CORS_PROXY}${encodeURIComponent(baseUrl)}` : null;
};

// Fonction pour obtenir l'URL des données statiques (NOUVEAU)
window.MAYO_CONFIG.getStaticDataUrl = function(type) {
  if (this.STATIC_DATA.enabled) {
    const filename = this.STATIC_DATA.files[type] || `${type}.json`;
    return `${this.STATIC_DATA.baseUrl}/${filename}`;
  }
  // Fallback vers l'ancien système
  return this.getLocalDataUrl(type);
};

// Fonction pour charger des données statiques
window.MAYO_CONFIG.loadStaticData = async function(type) {
  if (window.StaticDataProcessor) {
    return await window.StaticDataProcessor.loadDataByType(type);
  }
  
  // Fallback: chargement direct du fichier
  try {
    const url = this.getStaticDataUrl(type);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors du chargement de ${type}:`, error);
    throw error;
  }
};

// Fonction pour obtenir l'URL des données locales (NOUVEAU)
window.MAYO_CONFIG.getLocalDataUrl = function(type) {
  // Utilisation des fichiers statiques dans /temp/data
  if (!this.LOCAL_DATA_SERVER.enabled) {
    // Fichiers statiques locaux
    return `${this.LOCAL_DATA_SERVER.baseUrl}/${type}.json`;
  }
  // Fallback vers l’ancien serveur local si activé
  const endpoint = this.LOCAL_DATA_SERVER.endpoints[type] || this.LOCAL_DATA_SERVER.endpoints.data;
  return `${this.LOCAL_DATA_SERVER.baseUrl}${endpoint}`;
};

// Fonction pour vérifier si le serveur local est disponible
window.MAYO_CONFIG.checkLocalServer = async function() {
  if (!this.LOCAL_DATA_SERVER.enabled) return false;
  
  try {
    const response = await fetch(`${this.LOCAL_DATA_SERVER.baseUrl}/api/stats`, {
      timeout: 2000
    });
    return response.ok;
  } catch (error) {
    console.warn('Serveur local indisponible, utilisation des URLs publiques');
    return false;
  }
};

// Fonction pour vérifier si une URL de logo est problématique
window.MAYO_CONFIG.isProblematicLogo = function(logoUrl) {
  if (!logoUrl || typeof logoUrl !== 'string') return true;
  
  // Vérifier si l'URL contient un domaine problématique
  return this.FALLBACK.PROBLEMATIC_DOMAINS.some(domain => 
    logoUrl.toLowerCase().includes(domain.toLowerCase())
  );
};

// Fonction pour obtenir un logo fiable
window.MAYO_CONFIG.getReliableLogo = function(logoUrl, channelName = '') {
  // Si logo problématique, retourner le logo local
  if (this.isProblematicLogo(logoUrl)) {
    return this.FALLBACK.GENERIC_LOGO_LOCAL;
  }
  
  // Si pas de logo, utiliser le logo local ou générer un logo avec les initiales
  if (!logoUrl) {
    // Priorité au logo local, sinon générer avec initiales
    if (channelName) {
      const initials = channelName.substring(0, 2).toUpperCase() || 'TV';
      return this.generateLogoWithInitials(initials);
    } else {
      return this.FALLBACK.GENERIC_LOGO_LOCAL;
    }
  }
  
  return logoUrl;
};

// Fonction pour générer un logo SVG avec des initiales
window.MAYO_CONFIG.generateLogoWithInitials = function(initials) {
  const colors = ['#5490a8', '#4a8ca0', '#3e7489', '#6ba3b8', '#2d5f75', '#7ab4c7'];
  const color = colors[initials.charCodeAt(0) % colors.length];
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='${color}' rx='10'/%3E%3Ctext x='50' y='58' font-family='Arial,sans-serif' font-size='24' fill='white' text-anchor='middle' font-weight='bold'%3E${initials}%3C/text%3E%3C/svg%3E`;
};

// Fonction pour obtenir la configuration HLS adaptée
window.MAYO_CONFIG.getHlsConfig = function() {
  return {
    ...this.HLS_CONFIG,
    debug: this.DEV.DEBUG
  };
};

// Fonction pour logger en mode développement
window.MAYO_CONFIG.log = function(level, message, data) {
  if (!this.DEV.DEBUG) return;
  
  const levels = ['debug', 'info', 'warn', 'error'];
  const currentLevelIndex = levels.indexOf(this.DEV.LOG_LEVEL);
  const messageLevelIndex = levels.indexOf(level);
  
  if (messageLevelIndex >= currentLevelIndex) {
    console[level](`[MAYO TV] ${message}`, data || '');
  }
};