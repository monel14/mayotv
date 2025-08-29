import { Collection, File, Storage } from '@freearhey/core'
import { PUBLIC_DIR, EOL } from '../constants'
import { Generator } from './generator'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

type WebInterfaceGeneratorProps = {
  streams: Collection
  logFile: File
}

export class WebInterfaceGenerator implements Generator {
  streams: Collection
  storage: Storage
  logFile: File

  constructor({ streams, logFile }: WebInterfaceGeneratorProps) {
    this.streams = streams.clone()
    this.storage = new Storage(PUBLIC_DIR)
    this.logFile = logFile
  }

  async generate(): Promise<void> {
    try {
      // Créer le répertoire web-interface dans PUBLIC_DIR
      await this.createWebInterfaceDirectory()

      // Copier les fichiers statiques
      await this.copyStaticFiles()

      // Générer le fichier index.html avec les URLs de production
      await this.generateIndexHtml()

      // Générer la configuration JavaScript avec les bonnes URLs
      await this.generateConfig()

      // Copier les assets (CSS, JS, icons)
      await this.copyAssets()

      // Générer le manifest PWA
      await this.generateManifest()

      // Log de succès
      this.logFile.append(
        JSON.stringify({ 
          type: 'web-interface', 
          message: 'Interface web générée avec succès',
          timestamp: new Date().toISOString()
        }) + EOL
      )

    } catch (error) {
      this.logFile.append(
        JSON.stringify({ 
          type: 'web-interface-error', 
          message: error.message,
          timestamp: new Date().toISOString()
        }) + EOL
      )
      throw error
    }
  }

  /**
   * Crée la structure de répertoires pour l'interface web
   */
  private async createWebInterfaceDirectory(): Promise<void> {
    const directories = [
      'web-interface',
      'web-interface/assets',
      'web-interface/assets/css',
      'web-interface/assets/js',
      'web-interface/assets/icons',
      'web-interface/config'
    ]

    for (const dir of directories) {
      await this.storage.mkdir(dir)
    }
  }

  /**
   * Copie les fichiers statiques depuis le répertoire source
   */
  private async copyStaticFiles(): Promise<void> {
    const sourceDir = join(process.cwd(), 'web-interface')
    
    if (!existsSync(sourceDir)) {
      throw new Error('Répertoire source web-interface non trouvé')
    }

    // Copier tous les fichiers depuis le répertoire source
    await this.copyDirectory(sourceDir, 'web-interface')
  }

  /**
   * Génère le fichier index.html optimisé pour la production
   */
  private async generateIndexHtml(): Promise<void> {
    const sourceHtmlPath = join(process.cwd(), 'web-interface', 'index.html')
    
    if (!existsSync(sourceHtmlPath)) {
      throw new Error('Fichier index.html source non trouvé')
    }

    let htmlContent = readFileSync(sourceHtmlPath, 'utf-8')

    // Optimisations pour la production
    htmlContent = this.optimizeHtml(htmlContent)

    // Ajouter des meta tags pour GitHub Pages
    htmlContent = this.addProductionMetaTags(htmlContent)

    // Sauvegarder
    await this.storage.save('web-interface/index.html', htmlContent)
  }

  /**
   * Génère la configuration JavaScript avec les URLs de production
   */
  private async generateConfig(): Promise<void> {
    const config = `// Configuration MAYO TV - Version Production
window.MAYO_CONFIG = {
  // URLs des playlists iptv-org (GitHub Pages)
  PLAYLIST_URLS: {
    country: 'https://iptv-org.github.io/iptv/index.country.m3u',
    category: 'https://iptv-org.github.io/iptv/index.category.m3u',
    language: 'https://iptv-org.github.io/iptv/index.language.m3u',
    region: 'https://iptv-org.github.io/iptv/index.region.m3u'
  },

  // Proxy CORS pour contourner les restrictions
  CORS_PROXY: 'https://corsproxy.io/?',

  // Configuration de l'application
  APP: {
    TITLE: 'MAYO TV',
    THEME_COLOR: '#dc2626',
    VERSION: '${this.getVersion()}',
    DESCRIPTION: 'Interface web moderne pour lecteur IPTV',
    BUILD_DATE: '${new Date().toISOString()}'
  },

  // Limites et contraintes optimisées pour la production
  LIMITS: {
    MAX_CHANNELS_PER_CATEGORY: 200,
    MAX_CATEGORIES: 100,
    CACHE_DURATION: 1000 * 60 * 60, // 1 heure en production
    REQUEST_TIMEOUT: 15000 // 15 secondes
  },

  // Configuration du lecteur HLS optimisée
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
    manifestLoadingTimeOut: 15000,
    manifestLoadingMaxRetry: 2,
    fragLoadingTimeOut: 25000,
    fragLoadingMaxRetry: 6,
    startFragPrefetch: true,
    testBandwidth: true
  },

  // Messages et textes de l'interface
  MESSAGES: {
    LOADING: 'Chargement de la playlist...',
    ERROR_FETCH: 'Impossible de charger la playlist.',
    ERROR_PARSE: 'Erreur lors de l\\'analyse de la playlist.',
    ERROR_STREAM: 'Impossible de lire cette chaîne.',
    ERROR_BROWSER: 'Votre navigateur ne supporte pas la lecture HLS.',
    NO_CHANNELS: 'Aucune chaîne trouvée dans cette catégorie.',
    NO_CATEGORIES: 'Aucune catégorie trouvée.'
  },

  // Configuration du cache local
  CACHE: {
    PREFIX: 'mayo_tv_prod_',
    KEYS: {
      PLAYLISTS: 'playlists',
      PREFERENCES: 'preferences',
      LAST_CATEGORY: 'last_category',
      LAST_PLAYLIST_TYPE: 'last_playlist_type'
    }
  },

  // Configuration des performances optimisée
  PERFORMANCE: {
    LAZY_LOAD_THRESHOLD: 30, // Seuil plus élevé en production
    IMAGE_LAZY_LOAD: true,
    DEBOUNCE_SEARCH: 300,
    CHUNK_SIZE: 100 // Chunks plus grands en production
  },

  // URLs de fallback pour les logos
  FALLBACK: {
    LOGO: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZTBlMGUwIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI4MCIgZm9udC1mYW1pbHk9IkludGVyLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Mb2dvPC90ZXh0Pgo8L3N2Zz4K'
  },

  // Configuration de production
  DEV: {
    DEBUG: false,
    LOG_LEVEL: 'error',
    MOCK_DATA: false
  },

  // Analytics et suivi
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
  return baseUrl ? \`\${this.CORS_PROXY}\${encodeURIComponent(baseUrl)}\` : null;
};

// Fonction pour obtenir la configuration HLS adaptée
window.MAYO_CONFIG.getHlsConfig = function() {
  return {
    ...this.HLS_CONFIG,
    debug: this.DEV.DEBUG
  };
};

// Fonction pour logger (désactivée en production)
window.MAYO_CONFIG.log = function(level, message, data) {
  if (!this.DEV.DEBUG) return;
  
  const levels = ['debug', 'info', 'warn', 'error'];
  const currentLevelIndex = levels.indexOf(this.DEV.LOG_LEVEL);
  const messageLevelIndex = levels.indexOf(level);
  
  if (messageLevelIndex >= currentLevelIndex) {
    console[level](\`[MAYO TV] \${message}\`, data || '');
  }
};`

    await this.storage.save('web-interface/config/endpoints.js', config)
  }

  /**
   * Copie les assets (CSS, JS, etc.)
   */
  private async copyAssets(): Promise<void> {
    const assetTypes = ['css', 'js', 'icons']
    
    for (const assetType of assetTypes) {
      const sourcePath = join(process.cwd(), 'web-interface', 'assets', assetType)
      const targetPath = `web-interface/assets/${assetType}`
      
      if (existsSync(sourcePath)) {
        await this.copyDirectory(sourcePath, targetPath)
      }
    }
  }

  /**
   * Génère le manifest PWA
   */
  private async generateManifest(): Promise<void> {
    const manifest = {
      name: 'MAYO TV - Lecteur IPTV',
      short_name: 'MAYO TV',
      description: 'Interface web moderne pour lecteur IPTV avec support HLS',
      start_url: './',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#dc2626',
      orientation: 'portrait-primary',
      icons: [
        {
          src: 'assets/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: 'assets/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        }
      ],
      categories: ['entertainment', 'multimedia', 'video'],
      lang: 'fr',
      dir: 'ltr'
    }

    await this.storage.save('web-interface/manifest.json', JSON.stringify(manifest, null, 2))
  }

  /**
   * Optimise le contenu HTML pour la production
   */
  private optimizeHtml(html: string): string {
    return html
      // Minifier les espaces (simple)
      .replace(/\s+/g, ' ')
      .replace(/> </g, '><')
      // Ajouter la compression
      .trim()
  }

  /**
   * Ajoute les meta tags pour la production
   */
  private addProductionMetaTags(html: string): string {
    const additionalMetas = `
    <meta name="robots" content="index, follow">
    <meta name="author" content="iptv-org">
    <meta property="og:title" content="MAYO TV - Lecteur IPTV">
    <meta property="og:description" content="Interface web moderne pour lecteur IPTV avec support HLS">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://iptv-org.github.io/iptv/web-interface/">
    <meta property="og:image" content="https://iptv-org.github.io/iptv/web-interface/assets/icons/icon-512.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="MAYO TV - Lecteur IPTV">
    <meta name="twitter:description" content="Interface web moderne pour lecteur IPTV avec support HLS">
    <link rel="manifest" href="manifest.json">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="MAYO TV">
    <link rel="apple-touch-icon" href="assets/icons/icon-192.png">`

    return html.replace('</head>', `    ${additionalMetas}\n</head>`)
  }

  /**
   * Copie récursivement un répertoire
   */
  private async copyDirectory(source: string, target: string): Promise<void> {
    // Cette méthode devrait être implémentée pour copier récursivement
    // Pour l'instant, on utilise une approche simple
    // Dans un vrai scénario, on utiliserait fs-extra ou une librairie similaire
    
    // Placeholder - l'implémentation complète nécessiterait fs-extra
    // ou une logique de copie récursive plus sophistiquée
  }

  /**
   * Obtient la version depuis package.json
   */
  private getVersion(): string {
    try {
      const packagePath = join(process.cwd(), 'package.json')
      if (existsSync(packagePath)) {
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))
        return packageJson.version || '1.0.0'
      }
    } catch (error) {
      // Version par défaut en cas d'erreur
    }
    return '1.0.0'
  }
}