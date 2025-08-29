/**
 * MAYO TV - Module principal de l'application
 * Orchestre l'interface utilisateur et les interactions
 */

class MayoTvApp {
  constructor() {
    this.playlistParser = new PlaylistParser();
    this.hlsPlayer = new HlsPlayer();
    this.currentPlaylistType = 'country';
    this.currentCategory = null;
    this.channelsByCategory = {};
    this.currentChannels = [];
    this.searchQuery = '';
    this.searchTimeout = null;
    
    // Éléments DOM
    this.elements = {};
    
    // État de l'application
    this.state = {
      view: 'categories', // 'categories' | 'channels' | 'player'
      loading: false,
      error: null
    };
  }

  /**
   * Initialise l'application
   */
  async initialize() {
    try {
      MAYO_CONFIG.log('info', 'Initialisation de MAYO TV');
      
      // Initialiser les éléments DOM
      this.initializeElements();
      
      // Initialiser le lecteur HLS
      this.hlsPlayer.initialize(this.elements.videoPlayer);
      
      // Configurer les écouteurs d'événements
      this.setupEventListeners();
      
      // Charger les préférences utilisateur
      this.loadUserPreferences();
      
      // Charger le cache localStorage
      this.playlistParser.loadFromLocalStorage();
      
      // Charger la playlist par défaut
      await this.loadPlaylist(this.currentPlaylistType);
      
      MAYO_CONFIG.log('info', 'MAYO TV initialisé avec succès');
      
    } catch (error) {
      MAYO_CONFIG.log('error', 'Erreur lors de l\'initialisation', error);
      this.showError(MAYO_CONFIG.MESSAGES.ERROR_FETCH);
    }
  }

  /**
   * Initialise les références aux éléments DOM
   */
  initializeElements() {
    this.elements = {
      // Conteneurs principaux
      categoryView: document.getElementById('category-view'),
      channelView: document.getElementById('channel-view'),
      playerOverlay: document.getElementById('player-overlay'),
      loader: document.getElementById('loader'),
      errorMessage: document.getElementById('error-message'),
      
      // En-tête
      headerTitle: document.getElementById('header-title'),
      backButton: document.getElementById('back-button'),
      menuButton: document.getElementById('menu-button'),
      searchButton: document.getElementById('search-button'),
  searchInput: document.getElementById('search-input'),
      
      // Sélecteur de playlist
      playlistType: document.getElementById('playlist-type'),
      
      // Lecteur vidéo
      videoPlayer: document.getElementById('video-player'),
      closePlayerButton: document.getElementById('close-player-button'),
      currentChannelName: document.getElementById('current-channel-name'),
      currentChannelCategory: document.getElementById('current-channel-category'),
      
      // Textes dynamiques
      loaderText: document.getElementById('loader-text'),
      errorText: document.getElementById('error-text')
    };
  }

  /**
   * Configure les écouteurs d'événements
   */
  setupEventListeners() {
    // Navigation
    this.elements.backButton.addEventListener('click', () => this.showCategoryView());
    this.elements.menuButton.addEventListener('click', () => this.showCategoryView());
    
    // Sélecteur de playlist
    this.elements.playlistType.addEventListener('change', (e) => {
      this.loadPlaylist(e.target.value);
    });
    
    // Recherche
    this.elements.searchButton.addEventListener('click', () => this.toggleSearch());
  this.elements.searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
    
    // Lecteur vidéo
    this.elements.closePlayerButton.addEventListener('click', () => this.closePlayer());
    
    // Gestion du clavier
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    
    // Gestion des clics sur les catégories et chaînes
    this.elements.categoryView.addEventListener('click', (e) => this.handleCategoryClick(e));
    this.elements.channelView.addEventListener('click', (e) => this.handleChannelClick(e));
    
    // Événements du lecteur HLS
    this.setupPlayerEventListeners();
    
    // Gestion de la visibilité de la page
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    
    // Gestion du redimensionnement
    window.addEventListener('resize', () => this.handleResize());
  }

  /**
   * Configure les écouteurs d'événements du lecteur
   */
  setupPlayerEventListeners() {
    this.hlsPlayer.on('streamloaded', (data) => {
      this.hideLoader();
      MAYO_CONFIG.log('info', 'Flux chargé', data);
    });

    this.hlsPlayer.on('playing', () => {
      this.hideLoader();
    });

    this.hlsPlayer.on('streamerror', (data) => {
      this.hideLoader();
      
      // Créer un message d'erreur plus informatif
      let errorMessage = MAYO_CONFIG.MESSAGES.ERROR_STREAM;
      
      if (data.message) {
        if (data.message.includes('CORS')) {
          errorMessage = 'Accès bloqué par la politique CORS. Certains flux peuvent avoir des restrictions régionales.';
        } else if (data.message.includes('404') || data.message.includes('not found')) {
          errorMessage = 'Flux introuvable (404). Ce flux n\'est peut-être plus disponible.';
        } else if (data.message.includes('timeout')) {
          errorMessage = 'Connexion trop lente. Vérifiez votre connexion internet.';
        } else if (data.message.includes('network')) {
          errorMessage = 'Erreur réseau. Impossible de se connecter au flux.';
        }
      }
      
      this.showError(errorMessage);
      this.showNotification(errorMessage, 'error', 6000);
      MAYO_CONFIG.log('error', 'Erreur de flux', data);
    });

    this.hlsPlayer.on('buffering', (buffering) => {
      if (buffering) {
        this.showLoader('Mise en mémoire tampon...');
      } else {
        this.hideLoader();
      }
    });
  }

  /**
   * Charge une playlist
   * @param {string} playlistType - Type de playlist
   */
  async loadPlaylist(playlistType) {
    try {
      this.showLoader(MAYO_CONFIG.MESSAGES.LOADING);
      this.currentPlaylistType = playlistType;
      
      this.channelsByCategory = await this.playlistParser.loadPlaylist(playlistType);
      
      if (!this.channelsByCategory || Object.keys(this.channelsByCategory).length === 0) {
        throw new Error(MAYO_CONFIG.MESSAGES.NO_CATEGORIES);
      }
      
      this.showCategoryView();
      this.saveUserPreferences();
      
      // Afficher une notification informative sur les logos et les flux
      setTimeout(() => {
        this.showNotification(
          '📺 Informations importantes: Certains flux IPTV peuvent avoir des restrictions régionales ou CORS. Les logos indisponibles utilisent des alternatives colorées.',
          'info',
          8000
        );
      }, 2000);
      
    } catch (error) {
      MAYO_CONFIG.log('error', 'Erreur lors du chargement de la playlist', error);
      this.showError(error.message || MAYO_CONFIG.MESSAGES.ERROR_FETCH);
    } finally {
      this.hideLoader();
    }
  }

  /**
   * Affiche la vue des catégories
   */
  showCategoryView() {
    this.state.view = 'categories';
    this.currentCategory = null;
    
    // Mettre à jour l'interface
    this.elements.categoryView.classList.remove('hidden');
    this.elements.channelView.classList.add('hidden');
    this.elements.headerTitle.textContent = MAYO_CONFIG.APP.TITLE;
    this.elements.backButton.classList.add('hidden');
    this.elements.menuButton.classList.remove('hidden');
    
    // Générer les catégories
    this.renderCategories();
  }

  /**
   * Affiche la vue des chaînes pour une catégorie
   * @param {string} category - Nom de la catégorie
   */
  showChannelView(category) {
    this.state.view = 'channels';
    this.currentCategory = category;
    this.currentChannels = this.channelsByCategory[category] || [];
    
    // Mettre à jour l'interface
    this.elements.categoryView.classList.add('hidden');
    this.elements.channelView.classList.remove('hidden');
    this.elements.headerTitle.textContent = category;
    this.elements.backButton.classList.remove('hidden');
    this.elements.menuButton.classList.add('hidden');
    
    // Générer les chaînes
    this.renderChannels();
  }

  /**
   * Génère et affiche les catégories
   */
  renderCategories() {
    const categories = Object.keys(this.channelsByCategory).sort();
    
    if (categories.length === 0) {
      this.elements.categoryView.innerHTML = `
        <div class="text-center text-gray-500 p-8">
          <p>${MAYO_CONFIG.MESSAGES.NO_CATEGORIES}</p>
        </div>
      `;
      return;
    }
    
    const categoriesHtml = categories.map(category => {
      const channelCount = this.channelsByCategory[category].length;
      return `
        <button class="category-item bg-mayo-blue text-white font-bold py-4 px-4 rounded-lg border-2 border-mayo-blue-dark text-center block w-full mb-3 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-mayo-blue focus:ring-opacity-50" 
                data-category="${this.escapeHtml(category)}" 
                aria-label="Catégorie ${category}, ${channelCount} chaînes">
          <div class="text-lg">${this.escapeHtml(category.toUpperCase())}</div>
          <div class="text-sm opacity-90">${channelCount} chaîne${channelCount > 1 ? 's' : ''}</div>
        </button>
      `;
    }).join('');
    
    this.elements.categoryView.innerHTML = categoriesHtml;
  }

  /**
   * Génère et affiche les chaînes avec lazy loading
   */
  renderChannels() {
    if (this.currentChannels.length === 0) {
      this.elements.channelView.innerHTML = `
        <div class="col-span-3 text-center text-gray-500 p-8">
          <p>${MAYO_CONFIG.MESSAGES.NO_CHANNELS}</p>
        </div>
      `;
      return;
    }
    
    // Utiliser le lazy loading si trop de chaînes
    if (this.currentChannels.length > MAYO_CONFIG.PERFORMANCE.LAZY_LOAD_THRESHOLD) {
      this.renderChannelsLazy();
    } else {
      this.renderChannelsAll();
    }
  }

  /**
   * Génère toutes les chaînes d'un coup
   */
  renderChannelsAll() {
    const channelsHtml = this.currentChannels.map(channel => 
      this.createChannelHtml(channel)
    ).join('');
    
    this.elements.channelView.innerHTML = channelsHtml;
    
    // Charger les images avec lazy loading
    if (MAYO_CONFIG.PERFORMANCE.IMAGE_LAZY_LOAD) {
      this.setupImageLazyLoading();
    }
  }

  /**
   * Génère les chaînes avec lazy loading
   */
  renderChannelsLazy() {
    const chunkSize = MAYO_CONFIG.PERFORMANCE.CHUNK_SIZE;
    let currentIndex = 0;
    
    // Afficher le premier chunk
    const firstChunk = this.currentChannels.slice(0, chunkSize);
    this.elements.channelView.innerHTML = firstChunk.map(channel => 
      this.createChannelHtml(channel)
    ).join('');
    
    currentIndex = chunkSize;
    
    // Créer un observateur d'intersection pour le lazy loading
    if ('IntersectionObserver' in window && currentIndex < this.currentChannels.length) {
      const loadMoreElement = document.createElement('div');
      loadMoreElement.className = 'col-span-3 p-4 text-center';
      loadMoreElement.innerHTML = '<div class="loading-skeleton h-4 w-32 mx-auto rounded"></div>';
      this.elements.channelView.appendChild(loadMoreElement);
      
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && currentIndex < this.currentChannels.length) {
          const nextChunk = this.currentChannels.slice(currentIndex, currentIndex + chunkSize);
          const newHtml = nextChunk.map(channel => this.createChannelHtml(channel)).join('');
          
          loadMoreElement.insertAdjacentHTML('beforebegin', newHtml);
          currentIndex += chunkSize;
          
          if (currentIndex >= this.currentChannels.length) {
            loadMoreElement.remove();
            observer.disconnect();
          }
        }
      });
      
      observer.observe(loadMoreElement);
    }
    
    // Charger les images avec lazy loading
    if (MAYO_CONFIG.PERFORMANCE.IMAGE_LAZY_LOAD) {
      this.setupImageLazyLoading();
    }
  }

  /**
   * Obtient la meilleure URL de flux pour une chaîne
   * @param {Object} channel - Données de la chaîne
   * @returns {string} URL du meilleur flux disponible
   */
  getBestStreamUrl(channel) {
    // Vérifier si la chaîne a des streams
    if (!channel.streams || channel.streams.length === 0) {
      MAYO_CONFIG.log('warn', `Aucun flux disponible pour ${channel.name}`);
      return '';
    }
    
    // Trier les streams par qualité (meilleure qualité en premier)
    const sortedStreams = channel.streams.sort((a, b) => {
      const heightA = parseInt(a.height) || this.getQualityValue(a.quality) || 0;
      const heightB = parseInt(b.height) || this.getQualityValue(b.quality) || 0;
      
      // Priorité par hauteur (qualité)
      if (heightA !== heightB) {
        return heightB - heightA; // Décroissant
      }
      
      // Si même qualité, priorité aux streams avec titre
      if (a.title && !b.title) return -1;
      if (!a.title && b.title) return 1;
      
      return 0;
    });
    
    // Retourner l'URL du meilleur stream
    const bestStream = sortedStreams[0];
    MAYO_CONFIG.log('info', `Flux sélectionné pour ${channel.name}: ${bestStream.title || 'Sans titre'} (${bestStream.quality || 'Qualité inconnue'})`);
    
    return bestStream.url || '';
  }

  /**
   * Convertit une qualité textuelle en valeur numérique pour le tri
   * @param {string} quality - Qualité (ex: "1080p", "720p", "HD")
   * @returns {number} Valeur numérique pour le tri
   */
  getQualityValue(quality) {
    if (!quality) return 0;
    
    const qualityStr = quality.toLowerCase();
    
    // Correspondances par résolution
    if (qualityStr.includes('4k') || qualityStr.includes('2160p')) return 2160;
    if (qualityStr.includes('1440p')) return 1440;
    if (qualityStr.includes('1080p') || qualityStr.includes('fhd')) return 1080;
    if (qualityStr.includes('720p') || qualityStr.includes('hd')) return 720;
    if (qualityStr.includes('576p')) return 576;
    if (qualityStr.includes('480p')) return 480;
    if (qualityStr.includes('360p')) return 360;
    if (qualityStr.includes('240p')) return 240;
    
    return 0;
  }

  /**
   * Obtient tous les flux disponibles pour une chaîne, groupés par qualité
   * @param {Object} channel - Données de la chaîne
   * @returns {Array} Liste des flux groupés par qualité
   */
  getAvailableQualities(channel) {
    if (!channel.streams || channel.streams.length === 0) {
      return [];
    }
    
    // Grouper les streams par qualité
    const qualityGroups = {};
    
    channel.streams.forEach(stream => {
      const quality = stream.quality || 'Qualité inconnue';
      if (!qualityGroups[quality]) {
        qualityGroups[quality] = [];
      }
      qualityGroups[quality].push(stream);
    });
    
    // Convertir en array et trier par qualité
    return Object.entries(qualityGroups)
      .map(([quality, streams]) => ({
        quality,
        count: streams.length,
        streams,
        bestStream: streams.sort((a, b) => {
          // Priorité aux flux avec titre
          if (a.title && !b.title) return -1;
          if (!a.title && b.title) return 1;
          return 0;
        })[0]
      }))
      .sort((a, b) => {
        const valueA = this.getQualityValue(a.quality);
        const valueB = this.getQualityValue(b.quality);
        return valueB - valueA; // Meilleure qualité en premier
      });
  }

  /**
   * Crée le HTML pour une chaîne
   * @param {Object} channel - Données de la chaîne
   * @returns {string} HTML de la chaîne
   */
  createChannelHtml(channel) {
    const channelId = this.escapeHtml(channel.id || '');
    const channelName = this.escapeHtml(channel.name);
    const channelCategory = this.escapeHtml(this.currentCategory || '');
    
    // Obtenir la meilleure URL de flux pour cette chaîne
    const channelUrl = this.escapeHtml(this.getBestStreamUrl(channel));
    
    // Obtenir les qualités disponibles
    const qualities = this.getAvailableQualities(channel);
    const qualityCount = qualities.length;
    const hasMultipleQualities = qualityCount > 1;
    
    // Créer un ID unique pour la chaîne (DÉPLACÉ ICI)
    const uniqueId = `channel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // NOUVEAU: Déterminer le type de logo à utiliser selon vos préférences
    let logoHtml = '';
    const placeholder = channel.name.substring(0, 2).toUpperCase() || 'TV';
    
    // Priorité aux logos locaux selon vos préférences
    if (channel.logo && !MAYO_CONFIG.isProblematicLogo(channel.logo)) {
      // Logo fiable - utiliser img avec fallback
      const channelLogo = this.escapeHtml(channel.logo);
      logoHtml = `
        <img src="${channelLogo}" 
             alt="Logo ${channelName}" 
             class="channel-logo max-w-full max-h-full object-contain"
             loading="lazy"
             style="max-width: 70px; max-height: 50px;"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
             data-channel-id="${uniqueId}">
        <div class="logo-fallback hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-mayo-blue to-mayo-blue-dark text-white rounded font-bold text-lg" style="display: none;">
          ${placeholder}
        </div>`;
    } else {
      // Logo problématique ou absent - utiliser directement le logo local/généré
      const reliableLogo = MAYO_CONFIG.getReliableLogo(channel.logo, channel.name);
      
      if (reliableLogo.startsWith('data:image/svg+xml')) {
        // Logo SVG généré - l'afficher directement
        const svgContent = reliableLogo.includes(',') ? 
          decodeURIComponent(reliableLogo.split(',')[1]) : 
          reliableLogo.replace('data:image/svg+xml,', '');
        logoHtml = `<div class="logo-generated w-full h-full flex items-center justify-center">${svgContent}</div>`;
      } else if (reliableLogo.includes('assets/images/logos/')) {
        // Logo local - utiliser img sans fallback problématique
        logoHtml = `
          <img src="${reliableLogo}" 
               alt="Logo ${channelName}" 
               class="channel-logo max-w-full max-h-full object-contain"
               style="max-width: 70px; max-height: 50px;"
               data-channel-id="${uniqueId}">`;
      } else {
        // Fallback vers initiales colorées
        logoHtml = `
          <div class="logo-fallback w-full h-full flex items-center justify-center bg-gradient-to-br from-mayo-blue to-mayo-blue-dark text-white rounded font-bold text-lg">
            ${placeholder}
          </div>`;
      }
    }
    
    // Indiquer si la chaîne a un flux disponible
    const hasStream = channelUrl && channelUrl.length > 0;
    const disabledClass = hasStream ? '' : 'opacity-60 cursor-not-allowed';
    const streamIndicator = hasStream ? '📺' : '❌';
    
    // Créer l'indicateur de qualités multiples
    const qualityIndicator = hasMultipleQualities ? 
      `<div class="absolute top-1 left-1 text-xs bg-green-600 text-white px-1 rounded" title="${qualityCount} qualités disponibles">
        ${qualityCount}Q
      </div>` : '';
    
    // Liste des qualités pour l'attribut data
    const qualitiesData = JSON.stringify(qualities.map(q => q.quality)).replace(/"/g, '&quot;');
    
    return `
      <div class="channel-item bg-white border border-blue-300 rounded-lg p-2 flex flex-col items-center justify-start text-center cursor-pointer transition transform hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-mayo-blue focus:ring-opacity-50 ${disabledClass}" 
           data-url="${channelUrl}"
           data-channel-id="${channelId}"
           data-channel-name="${channelName}"
           data-channel-category="${channelCategory}"
           data-has-stream="${hasStream}"
           data-qualities="${qualitiesData}"
           data-quality-count="${qualityCount}"
           tabindex="0"
           role="button"
           aria-label="Chaîne ${channel.name} ${hasStream ? '- Flux disponible' : '- Aucun flux disponible'} ${hasMultipleQualities ? `(${qualityCount} qualités)` : ''}">
        <div class="w-full h-20 flex items-center justify-center mb-2 relative">
          ${logoHtml}
          <!-- Indicateur de qualités multiples -->
          ${qualityIndicator}
          <!-- Indicateur de disponibilité du flux -->
          <div class="absolute top-1 right-1 text-xs bg-black bg-opacity-60 text-white px-1 rounded" title="${hasStream ? 'Flux disponible' : 'Aucun flux disponible'}">
            ${streamIndicator}
          </div>
        </div>
        <span class="text-black text-xs font-semibold h-10 flex items-center leading-tight px-1 text-center">${channelName}</span>
      </div>
    `;
  }

  /**
   * Configure le lazy loading des images avec gestion d'erreur améliorée
   */
  setupImageLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const container = img.closest('.channel-item');
            
            // Marquer comme en cours de chargement
            container?.classList.add('loading');
            
            // Configurer un timeout pour l'image
            const timeout = setTimeout(() => {
              this.handleImageTimeout(img);
            }, MAYO_CONFIG.PERFORMANCE.IMAGE_TIMEOUT);
            
            // Gestionnaire de succès
            const handleSuccess = () => {
              clearTimeout(timeout);
              container?.classList.remove('loading');
              img.style.opacity = '1';
            };
            
            // Gestionnaire d'erreur
            const handleError = () => {
              clearTimeout(timeout);
              this.handleImageError(img);
            };
            
            img.addEventListener('load', handleSuccess, { once: true });
            img.addEventListener('error', handleError, { once: true });
            
            img.classList.remove('loading');
            observer.unobserve(img);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '50px'
      });

      // Observer toutes les images de chaînes
      document.querySelectorAll('.channel-logo').forEach(img => {
        img.classList.add('loading');
        imageObserver.observe(img);
      });
    }
  }
  
  /**
   * Gestion du timeout d'une image
   * @param {HTMLImageElement} img - Élément image
   */
  handleImageTimeout(img) {
    MAYO_CONFIG.log('warn', `Timeout pour le logo: ${img.src}`);
    this.handleImageError(img);
  }
  
  /**
   * Gestion des erreurs d'images
   * @param {HTMLImageElement} img - Élément image
   */
  handleImageError(img) {
    const container = img.closest('.channel-item');
    const fallbackDiv = img.nextElementSibling;
    
    if (container) {
      container.classList.remove('loading');
    }
    
    // Essayer d'abord le logo local avant le fallback SVG
    if (!img.hasAttribute('data-fallback-tried')) {
      img.setAttribute('data-fallback-tried', 'true');
      img.src = MAYO_CONFIG.FALLBACK.GENERIC_LOGO_LOCAL;
      return;
    }
    
    // Masquer l'image et afficher le fallback SVG
    img.style.display = 'none';
    if (fallbackDiv) {
      fallbackDiv.style.display = 'flex';
      fallbackDiv.classList.add('logo-fallback');
    }
  }
  
  /**
   * Affiche une notification à l'utilisateur
   * @param {string} message - Message à afficher
   * @param {string} type - Type de notification ('info', 'warning', 'error', 'success')
   * @param {number} duration - Durée d'affichage en ms (0 = permanent)
   */
  showNotification(message, type = 'info', duration = 5000) {
    // Supprimer les anciennes notifications
    const existing = document.querySelector('.mayo-notification');
    if (existing) {
      existing.remove();
    }
    
    const colors = {
      info: 'bg-blue-100 border-blue-400 text-blue-700',
      warning: 'bg-orange-100 border-orange-400 text-orange-700',
      error: 'bg-red-100 border-red-400 text-red-700',
      success: 'bg-green-100 border-green-400 text-green-700'
    };
    
    const icons = {
      info: 'ℹ️',
      warning: '⚠️', 
      error: '❌',
      success: '✅'
    };
    
    const notification = document.createElement('div');
    notification.className = `mayo-notification fixed top-20 left-1/2 transform -translate-x-1/2 ${colors[type]} px-4 py-3 rounded-lg border z-50 max-w-sm mx-4 notification`;
    notification.style.zIndex = '9999';
    
    notification.innerHTML = `
      <div class="flex items-center">
        <span class="text-lg mr-3">${icons[type]}</span>
        <div class="flex-1">
          <p class="text-sm font-medium">${this.escapeHtml(message)}</p>
        </div>
        <button class="ml-3 text-lg font-bold hover:opacity-70" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Supprimer automatiquement après la durée spécifiée
    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentElement) {
          notification.style.animation = 'fadeOut 0.3s ease-out';
          setTimeout(() => notification.remove(), 300);
        }
      }, duration);
    }
  }

  /**
   * Gère les clics sur les catégories
   * @param {Event} event - Événement de clic
   */
  handleCategoryClick(event) {
    const categoryItem = event.target.closest('.category-item');
    if (categoryItem) {
      const category = categoryItem.dataset.category;
      this.showChannelView(category);
    }
  }

  /**
   * Gère les clics sur les chaînes
   * @param {Event} event - Événement de clic
   */
  handleChannelClick(event) {
    const channelItem = event.target.closest('.channel-item');
    if (channelItem) {
      // Vérifier si la chaîne a un flux disponible
      const hasStream = channelItem.dataset.hasStream === 'true';
      
      if (!hasStream) {
        this.showNotification(
          `La chaîne "${channelItem.dataset.channelName}" n'a pas de flux disponible pour le moment.`,
          'warning',
          4000
        );
        return;
      }
      
      // Vérifier le nombre de qualités disponibles
      const qualityCount = parseInt(channelItem.dataset.qualityCount) || 0;
      
      // Si plusieurs qualités, afficher le sélecteur
      if (qualityCount > 1) {
        event.preventDefault();
        this.showQualitySelector(channelItem);
        return;
      }
      
      // Si une seule qualité, lecture directe
      const channelData = {
        url: channelItem.dataset.url,
        name: channelItem.dataset.channelName,
        category: channelItem.dataset.channelCategory,
        id: channelItem.dataset.channelId
      };
      
      // Vérifier que l'URL est valide
      if (!channelData.url || channelData.url.trim() === '') {
        this.showNotification(
          `Impossible de lire la chaîne "${channelData.name}" : URL de flux manquante.`,
          'error',
          4000
        );
        return;
      }
      
      this.playChannel(channelData);
    }
  }

  /**
   * Affiche le sélecteur de qualité pour une chaîne
   * @param {HTMLElement} channelItem - Élément de la chaîne
   */
  showQualitySelector(channelItem) {
    const channelName = channelItem.dataset.channelName;
    const qualityCount = parseInt(channelItem.dataset.qualityCount) || 0;
    
    if (qualityCount <= 1) {
      this.showNotification(
        `"${channelName}" n'a qu'une seule qualité disponible.`,
        'info',
        3000
      );
      return;
    }
    
    // Récupérer les qualités depuis les données
    let qualities;
    try {
      qualities = JSON.parse(channelItem.dataset.qualities.replace(/&quot;/g, '"'));
    } catch (error) {
      console.error('Erreur lors du parsing des qualités:', error);
      return;
    }
    
    // Créer le modal de sélection
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4 text-gray-900">🎥 Sélectionner la qualité</h3>
        <p class="text-sm text-gray-600 mb-4">Chaîne : <strong>${channelName}</strong></p>
        <div class="space-y-2 mb-6">
          <!-- Option lecture automatique en premier -->
          <button class="auto-select-btn w-full text-left p-3 rounded-lg border-2 border-mayo-blue bg-mayo-blue bg-opacity-10 hover:bg-opacity-20 transition-colors">
            <div class="font-medium text-mayo-blue">✨ Lecture automatique</div>
            <div class="text-sm text-gray-600">Meilleure qualité disponible (Recommandé)</div>
          </button>
          <!-- Séparateur -->
          <div class="text-center text-xs text-gray-400 py-1">ou choisir manuellement</div>
          <!-- Liste des qualités -->
          ${qualities.map((quality, index) => `
            <button class="quality-option w-full text-left p-3 rounded-lg border border-gray-200 hover:border-mayo-blue hover:bg-blue-50 transition-colors" data-quality-index="${index}">
              <div class="font-medium text-gray-900">${quality}</div>
              <div class="text-sm text-gray-500">${index === 0 ? '(Qualité optimale)' : ''}</div>
            </button>
          `).join('')}
        </div>
        <div class="flex justify-end space-x-3">
          <button class="cancel-btn px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Annuler</button>
        </div>
      </div>
    `;
    
    // Gestionnaires d'événements
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('cancel-btn')) {
        modal.remove();
      }
      
      if (e.target.classList.contains('auto-select-btn')) {
        modal.remove();
        // Lancer la lecture avec la qualité automatique
        const channelData = {
          url: channelItem.dataset.url,
          name: channelItem.dataset.channelName,
          category: channelItem.dataset.channelCategory,
          id: channelItem.dataset.channelId
        };
        this.playChannel(channelData);
      }
      
      if (e.target.classList.contains('quality-option')) {
        const qualityIndex = parseInt(e.target.dataset.qualityIndex);
        modal.remove();
        this.playChannelWithQuality(channelItem, qualityIndex);
      }
    });
    
    document.body.appendChild(modal);
    
    // Focus sur le premier élément
    setTimeout(() => {
      const firstOption = modal.querySelector('.quality-option');
      if (firstOption) firstOption.focus();
    }, 100);
  }

  /**
   * Lance la lecture d'une chaîne avec une qualité spécifique
   * @param {HTMLElement} channelItem - Élément de la chaîne
   * @param {number} qualityIndex - Index de la qualité sélectionnée
   */
  async playChannelWithQuality(channelItem, qualityIndex) {
    const channelId = channelItem.dataset.channelId;
    const channelName = channelItem.dataset.channelName;
    
    // Trouver la chaîne dans les données actuelles
    const channel = this.currentChannels.find(ch => ch.id === channelId);
    if (!channel) {
      this.showNotification('Chaîne introuvable dans les données actuelles.', 'error', 4000);
      return;
    }
    
    // Obtenir les qualités disponibles
    const qualities = this.getAvailableQualities(channel);
    if (qualityIndex >= qualities.length) {
      this.showNotification('Qualité sélectionnée non valide.', 'error', 4000);
      return;
    }
    
    const selectedQuality = qualities[qualityIndex];
    const streamUrl = selectedQuality.bestStream.url;
    
    const channelData = {
      url: streamUrl,
      name: `${channelName} (${selectedQuality.quality})`,
      category: channelItem.dataset.channelCategory,
      id: channelId,
      selectedQuality: selectedQuality.quality
    };
    
    this.showNotification(
      `Lancement en ${selectedQuality.quality}...`,
      'info',
      2000
    );
    
    await this.playChannel(channelData);
  }

  /**
   * Lance la lecture d'une chaîne
   * @param {Object} channelData - Données de la chaîne
   */
  async playChannel(channelData) {
    try {
      MAYO_CONFIG.log('info', `Tentative de lecture: ${channelData.name} - ${channelData.url}`);
      
      // Vérifier l'URL
      if (!channelData.url || channelData.url.trim() === '') {
        throw new Error('URL de flux manquante ou invalide');
      }
      
      this.showLoader(`Chargement de ${channelData.name}...`);
      this.showPlayer();
      
      // Mettre à jour les informations de la chaîne
      this.elements.currentChannelName.textContent = channelData.name;
      this.elements.currentChannelCategory.textContent = channelData.category;
      
      // Afficher une notification de chargement
      this.showNotification(
        `Lancement de "${channelData.name}"... Cela peut prendre quelques secondes.`,
        'info',
        3000
      );
      
      // Charger et lire le flux
      await this.hlsPlayer.loadStream(channelData.url, channelData);
      
      MAYO_CONFIG.log('info', `Lecture démarrée avec succès: ${channelData.name}`);
      
      // Notification de succès
      this.showNotification(
        `"${channelData.name}" est maintenant en cours de lecture !`,
        'success',
        2000
      );
      
    } catch (error) {
      MAYO_CONFIG.log('error', 'Erreur lors de la lecture', error);
      
      // Messages d'erreur spécifiques
      let errorMessage = `Impossible de lire "${channelData.name}".`;
      
      if (error.message.includes('support')) {
        errorMessage += ' Votre navigateur ne supporte pas ce type de flux.';
      } else if (error.message.includes('timeout') || error.message.includes('network')) {
        errorMessage += ' Problème de connectivité réseau.';
      } else if (error.message.includes('404') || error.message.includes('not found')) {
        errorMessage += ' Le flux n\'est plus disponible.';
      } else {
        errorMessage += ' Veuillez réessayer plus tard.';
      }
      
      this.showError(errorMessage);
      this.showNotification(errorMessage, 'error', 5000);
      this.closePlayer();
    } finally {
      this.hideLoader();
    }
  }

  /**
   * Affiche le lecteur vidéo
   */
  showPlayer() {
    this.state.view = 'player';
    this.elements.playerOverlay.classList.remove('hidden');
    this.elements.playerOverlay.classList.add('flex', 'player-overlay-enter');
  }

  /**
   * Ferme le lecteur vidéo
   */
  closePlayer() {
    this.state.view = this.currentCategory ? 'channels' : 'categories';
    this.hlsPlayer.stop();
    this.elements.playerOverlay.classList.add('hidden');
    this.elements.playerOverlay.classList.remove('flex', 'player-overlay-enter');
  }

  /**
   * Affiche l'indicateur de chargement
   * @param {string} message - Message de chargement
   */
  showLoader(message = MAYO_CONFIG.MESSAGES.LOADING) {
    this.state.loading = true;
    this.elements.loaderText.textContent = message;
    this.elements.loader.style.display = 'flex';
  }

  /**
   * Masque l'indicateur de chargement
   */
  hideLoader() {
    this.state.loading = false;
    this.elements.loader.style.display = 'none';
  }

  /**
   * Affiche un message d'erreur
   * @param {string} message - Message d'erreur
   */
  showError(message) {
    this.state.error = message;
    this.elements.errorText.textContent = message;
    this.elements.errorMessage.classList.remove('hidden');
    
    // Masquer automatiquement après 5 secondes
    setTimeout(() => {
      this.hideError();
    }, 5000);
  }

  /**
   * Masque le message d'erreur
   */
  hideError() {
    this.state.error = null;
    this.elements.errorMessage.classList.add('hidden');
  }

  /**
   * Gère les événements clavier
   * @param {KeyboardEvent} event - Événement clavier
   */
  handleKeyboard(event) {
    switch (event.key) {
      case 'Escape':
        if (this.state.view === 'player') {
          this.closePlayer();
        } else if (this.state.view === 'channels') {
          this.showCategoryView();
        }
        break;
      
      case 'Enter':
      case ' ':
        if (event.target.classList.contains('category-item') || 
            event.target.classList.contains('channel-item')) {
          event.target.click();
          event.preventDefault();
        }
        break;
    }
  }

  /**
   * Gère les changements de visibilité de la page
   */
  handleVisibilityChange() {
    if (document.hidden && this.hlsPlayer.isPlaying) {
      // Optionnel: pause automatique quand la page n'est pas visible
      // this.hlsPlayer.pause();
    }
  }

  /**
   * Gère le redimensionnement de la fenêtre
   */
  handleResize() {
    // Recalculer la grille si nécessaire
    if (this.state.view === 'channels') {
      // Optionnel: ajuster la grille selon la taille
    }
  }

  /**
   * Alterne la fonction de recherche
   */
  toggleSearch() {
    const input = this.elements.searchInput;
    if (input.classList.contains('hidden')) {
      input.classList.remove('hidden');
      input.focus();
    } else {
      input.classList.add('hidden');
      input.value = '';
      this.searchQuery = '';
      this.renderChannels(this.currentChannels);
    }
  }

  /**
   * Gère la saisie dans le champ de recherche
   */
  handleSearchInput(e) {
    const query = e.target.value.trim().toLowerCase();
    this.searchQuery = query;
    if (!query) {
      this.renderChannels(this.currentChannels);
      return;
    }
    // Filtrer les chaînes selon le nom
    const filtered = this.currentChannels.filter(channel => {
      return channel.name && channel.name.toLowerCase().includes(query);
    });
    this.renderChannels(filtered);
  }

  /**
   * Sauvegarde les préférences utilisateur
   */
  saveUserPreferences() {
    try {
      const preferences = {
        playlistType: this.currentPlaylistType,
        lastCategory: this.currentCategory,
        timestamp: Date.now()
      };
      localStorage.setItem(
        `${MAYO_CONFIG.CACHE.PREFIX}${MAYO_CONFIG.CACHE.KEYS.PREFERENCES}`,
        JSON.stringify(preferences)
      );
    } catch (error) {
      MAYO_CONFIG.log('warn', 'Impossible de sauvegarder les préférences', error);
    }
  }

  /**
   * Charge les préférences utilisateur
   */
  loadUserPreferences() {
    try {
      const saved = localStorage.getItem(
        `${MAYO_CONFIG.CACHE.PREFIX}${MAYO_CONFIG.CACHE.KEYS.PREFERENCES}`
      );
      if (saved) {
        const preferences = JSON.parse(saved);
        this.currentPlaylistType = preferences.playlistType || 'country';
        this.elements.playlistType.value = this.currentPlaylistType;
      }
    } catch (error) {
      MAYO_CONFIG.log('warn', 'Impossible de charger les préférences', error);
    }
  }

  /**
   * Échappe le HTML pour éviter les injections XSS
   * @param {string} text - Texte à échapper
   * @returns {string} Texte échappé
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Nettoie les ressources de l'application
   */
  destroy() {
    this.hlsPlayer.destroy();
    this.playlistParser.clearCache();
    MAYO_CONFIG.log('info', 'Application MAYO TV détruite');
  }
}

// Initialisation automatique de l'application
document.addEventListener('DOMContentLoaded', () => {
  window.mayoTvApp = new MayoTvApp();
  window.mayoTvApp.initialize();
});

// Export global
window.MayoTvApp = MayoTvApp;