/**
 * MAYO TV - Module de lecture HLS
 * Gère la lecture des flux vidéo HLS avec support avancé et gestion d'erreurs
 */

class HlsPlayer {
  constructor() {
    this.hls = null;
    this.videoElement = null;
    this.currentStream = null;
    this.isPlaying = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.eventListeners = new Map();
  }

  /**
   * Initialise le lecteur avec un élément vidéo
   * @param {HTMLVideoElement} videoElement - Élément vidéo HTML
   */
  initialize(videoElement) {
    this.videoElement = videoElement;
    this.setupVideoListeners();
    MAYO_CONFIG.log('info', 'Lecteur HLS initialisé');
  }

  /**
   * Configure les écouteurs d'événements pour l'élément vidéo
   */
  setupVideoListeners() {
    if (!this.videoElement) return;

    // Événements vidéo natifs
    this.videoElement.addEventListener('loadstart', () => {
      this.emit('loadstart');
    });

    this.videoElement.addEventListener('loadedmetadata', () => {
      this.emit('loadedmetadata');
    });

    this.videoElement.addEventListener('canplay', () => {
      this.emit('canplay');
    });

    this.videoElement.addEventListener('playing', () => {
      this.isPlaying = true;
      this.emit('playing');
    });

    this.videoElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.emit('pause');
    });

    this.videoElement.addEventListener('ended', () => {
      this.isPlaying = false;
      this.emit('ended');
    });

    this.videoElement.addEventListener('error', (event) => {
      this.handleVideoError(event);
    });

    this.videoElement.addEventListener('waiting', () => {
      this.emit('buffering', true);
    });

    this.videoElement.addEventListener('timeupdate', () => {
      this.emit('timeupdate', {
        currentTime: this.videoElement.currentTime,
        duration: this.videoElement.duration
      });
    });
  }

  /**
   * Charge et lit un flux HLS
   * @param {string} streamUrl - URL du flux HLS
   * @param {Object} channelInfo - Informations sur la chaîne
   * @returns {Promise<void>}
   */
  async loadStream(streamUrl, channelInfo = {}) {
    try {
      MAYO_CONFIG.log('info', `Chargement du flux: ${streamUrl}`);
      
      // Arrêter le flux précédent
      this.stop();
      
      // Vérifier si l'URL est accessible (désactivé temporairement pour éviter les problèmes CORS)
      // await this.checkStreamAvailability(streamUrl);
      
      this.currentStream = {
        url: streamUrl,
        channel: channelInfo,
        startTime: Date.now()
      };

      // Vérifier le support HLS
      if (!this.isHlsSupported() && !this.isNativeHlsSupported()) {
        throw new Error(MAYO_CONFIG.MESSAGES.ERROR_BROWSER);
      }

      // Utiliser HLS.js si supporté
      if (this.isHlsSupported()) {
        await this.loadWithHlsJs(streamUrl);
      } 
      // Sinon utiliser le support natif (Safari)
      else if (this.isNativeHlsSupported()) {
        await this.loadWithNativeHls(streamUrl);
      }

      this.emit('streamloaded', {
        url: streamUrl,
        channel: channelInfo
      });

    } catch (error) {
      MAYO_CONFIG.log('error', 'Erreur lors du chargement du flux', error);
      this.handleStreamError(error);
      throw error;
    }
  }

  /**
   * Vérifie si un flux est accessible
   * @param {string} streamUrl - URL du flux à vérifier
   * @returns {Promise<boolean>}
   */
  async checkStreamAvailability(streamUrl) {
    return new Promise((resolve, reject) => {
      const timeout = 5000; // 5 secondes
      const controller = new AbortController();
      
      const timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error('Flux inaccessible (timeout)'));
      }, timeout);
      
      fetch(streamUrl, {
        method: 'HEAD', // Utiliser HEAD pour économiser la bande passante
        signal: controller.signal,
        mode: 'no-cors' // Ignorer CORS pour le test de connectivité
      })
      .then(() => {
        clearTimeout(timeoutId);
        resolve(true);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          reject(new Error('Flux inaccessible (timeout)'));
        } else if (error.message.includes('CORS')) {
          // CORS n'empêche pas forcément la lecture vidéo
          MAYO_CONFIG.log('warn', 'CORS détecté mais peut fonctionner en vidéo');
          resolve(true);
        } else {
          reject(new Error(`Flux indisponible: ${error.message}`));
        }
      });
    });
  }

  /**
   * Charge un flux avec HLS.js
   * @param {string} streamUrl - URL du flux
   */
  async loadWithHlsJs(streamUrl) {
    return new Promise((resolve, reject) => {
      // Créer une nouvelle instance HLS.js
      this.hls = new Hls(MAYO_CONFIG.getHlsConfig());
      
      // Attacher au élément vidéo
      this.hls.attachMedia(this.videoElement);
      
      // Écouteurs d'événements HLS.js
      this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        MAYO_CONFIG.log('debug', 'Média attaché');
        this.hls.loadSource(streamUrl);
      });

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        MAYO_CONFIG.log('debug', 'Manifest analysé');
        this.videoElement.play()
          .then(() => {
            this.retryCount = 0;
            resolve();
          })
          .catch(error => {
            if (error.name === 'NotAllowedError') {
              // Autoplay bloqué - pas une erreur critique
              MAYO_CONFIG.log('warn', 'Autoplay bloqué par le navigateur');
              resolve();
            } else {
              reject(error);
            }
          });
      });

      this.hls.on(Hls.Events.ERROR, (event, data) => {
        this.handleHlsError(event, data, reject);
      });

      this.hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        this.emit('qualitychange', {
          level: data.level,
          width: data.width,
          height: data.height,
          bitrate: data.bitrate
        });
      });

      // Timeout de sécurité
      setTimeout(() => {
        if (!this.isPlaying) {
          reject(new Error('Timeout lors du chargement du flux'));
        }
      }, MAYO_CONFIG.LIMITS.REQUEST_TIMEOUT);
    });
  }

  /**
   * Charge un flux avec le support HLS natif
   * @param {string} streamUrl - URL du flux
   */
  async loadWithNativeHls(streamUrl) {
    return new Promise((resolve, reject) => {
      this.videoElement.src = streamUrl;
      
      const handleCanPlay = () => {
        this.videoElement.removeEventListener('canplay', handleCanPlay);
        this.videoElement.removeEventListener('error', handleError);
        
        this.videoElement.play()
          .then(() => {
            this.retryCount = 0;
            resolve();
          })
          .catch(error => {
            if (error.name === 'NotAllowedError') {
              MAYO_CONFIG.log('warn', 'Autoplay bloqué par le navigateur');
              resolve();
            } else {
              reject(error);
            }
          });
      };

      const handleError = (event) => {
        this.videoElement.removeEventListener('canplay', handleCanPlay);
        this.videoElement.removeEventListener('error', handleError);
        reject(new Error('Erreur lors du chargement du flux natif'));
      };

      this.videoElement.addEventListener('canplay', handleCanPlay);
      this.videoElement.addEventListener('error', handleError);

      // Timeout de sécurité
      setTimeout(() => {
        if (!this.isPlaying) {
          this.videoElement.removeEventListener('canplay', handleCanPlay);
          this.videoElement.removeEventListener('error', handleError);
          reject(new Error('Timeout lors du chargement du flux'));
        }
      }, MAYO_CONFIG.LIMITS.REQUEST_TIMEOUT);
    });
  }

  /**
   * Gère les erreurs HLS.js
   * @param {string} event - Type d'événement
   * @param {Object} data - Données de l'erreur
   * @param {Function} reject - Callback de rejet
   */
  handleHlsError(event, data, reject) {
    MAYO_CONFIG.log('error', 'Erreur HLS.js', data);

    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            MAYO_CONFIG.log('info', `Tentative de reconnexion ${this.retryCount}/${this.maxRetries}`);
            this.hls.startLoad();
          } else {
            reject(new Error('Erreur réseau lors de la lecture'));
          }
          break;

        case Hls.ErrorTypes.MEDIA_ERROR:
          if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            MAYO_CONFIG.log('info', `Tentative de récupération média ${this.retryCount}/${this.maxRetries}`);
            this.hls.recoverMediaError();
          } else {
            reject(new Error('Erreur média lors de la lecture'));
          }
          break;

        default:
          reject(new Error(`Erreur HLS fatale: ${data.type}`));
          break;
      }
    }

    this.emit('error', {
      type: data.type,
      details: data.details,
      fatal: data.fatal,
      retryCount: this.retryCount
    });
  }

  /**
   * Gère les erreurs de l'élément vidéo
   * @param {Event} event - Événement d'erreur
   */
  handleVideoError(event) {
    const error = this.videoElement.error;
    let message = MAYO_CONFIG.MESSAGES.ERROR_STREAM;

    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          message = 'Lecture interrompue';
          break;
        case error.MEDIA_ERR_NETWORK:
          message = 'Erreur réseau';
          break;
        case error.MEDIA_ERR_DECODE:
          message = 'Erreur de décodage';
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          message = 'Format non supporté';
          break;
        default:
          message = 'Erreur inconnue';
          break;
      }
    }

    MAYO_CONFIG.log('error', `Erreur vidéo: ${message}`, error);
    this.handleStreamError(new Error(message));
  }

  /**
   * Gère les erreurs de flux
   * @param {Error} error - Erreur
   */
  handleStreamError(error) {
    this.emit('streamerror', {
      message: error.message,
      stream: this.currentStream,
      timestamp: Date.now()
    });
  }

  /**
   * Lance la lecture
   * @returns {Promise<void>}
   */
  async play() {
    if (this.videoElement) {
      try {
        await this.videoElement.play();
        this.emit('play');
      } catch (error) {
        MAYO_CONFIG.log('error', 'Erreur lors de la lecture', error);
        throw error;
      }
    }
  }

  /**
   * Met en pause la lecture
   */
  pause() {
    if (this.videoElement) {
      this.videoElement.pause();
      this.emit('pause');
    }
  }

  /**
   * Arrête la lecture et nettoie les ressources
   */
  stop() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = '';
      this.videoElement.load();
    }

    this.isPlaying = false;
    this.currentStream = null;
    this.retryCount = 0;
    
    this.emit('stop');
  }

  /**
   * Définit le volume
   * @param {number} volume - Volume (0-1)
   */
  setVolume(volume) {
    if (this.videoElement) {
      this.videoElement.volume = Math.max(0, Math.min(1, volume));
      this.emit('volumechange', this.videoElement.volume);
    }
  }

  /**
   * Active/désactive le son
   * @param {boolean} muted - État muet
   */
  setMuted(muted) {
    if (this.videoElement) {
      this.videoElement.muted = muted;
      this.emit('mutechange', muted);
    }
  }

  /**
   * Passe en mode plein écran
   * @returns {Promise<void>}
   */
  async enterFullscreen() {
    if (this.videoElement && this.videoElement.requestFullscreen) {
      try {
        await this.videoElement.requestFullscreen();
        this.emit('fullscreenenter');
      } catch (error) {
        MAYO_CONFIG.log('error', 'Erreur plein écran', error);
        throw error;
      }
    }
  }

  /**
   * Sort du mode plein écran
   * @returns {Promise<void>}
   */
  async exitFullscreen() {
    if (document.exitFullscreen) {
      try {
        await document.exitFullscreen();
        this.emit('fullscreenexit');
      } catch (error) {
        MAYO_CONFIG.log('error', 'Erreur sortie plein écran', error);
        throw error;
      }
    }
  }

  /**
   * Vérifie le support HLS.js
   * @returns {boolean}
   */
  isHlsSupported() {
    return typeof Hls !== 'undefined' && Hls.isSupported();
  }

  /**
   * Vérifie le support HLS natif
   * @returns {boolean}
   */
  isNativeHlsSupported() {
    if (!this.videoElement) return false;
    return this.videoElement.canPlayType('application/vnd.apple.mpegurl') !== '';
  }

  /**
   * Obtient les statistiques de lecture
   * @returns {Object}
   */
  getStats() {
    const stats = {
      isPlaying: this.isPlaying,
      currentTime: this.videoElement?.currentTime || 0,
      duration: this.videoElement?.duration || 0,
      volume: this.videoElement?.volume || 0,
      muted: this.videoElement?.muted || false,
      currentStream: this.currentStream
    };

    if (this.hls) {
      stats.hlsStats = {
        levels: this.hls.levels?.length || 0,
        currentLevel: this.hls.currentLevel,
        loadLevel: this.hls.loadLevel,
        nextLoadLevel: this.hls.nextLoadLevel,
        bufferLength: this.hls.media?.buffered?.length || 0
      };
    }

    return stats;
  }

  /**
   * Ajoute un écouteur d'événement
   * @param {string} event - Nom de l'événement
   * @param {Function} callback - Fonction de rappel
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Supprime un écouteur d'événement
   * @param {string} event - Nom de l'événement
   * @param {Function} callback - Fonction de rappel
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Émet un événement
   * @param {string} event - Nom de l'événement
   * @param {*} data - Données de l'événement
   */
  emit(event, data = null) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          MAYO_CONFIG.log('error', `Erreur dans l'écouteur d'événement ${event}`, error);
        }
      });
    }
  }

  /**
   * Nettoie les ressources du lecteur
   */
  destroy() {
    this.stop();
    this.eventListeners.clear();
    this.videoElement = null;
    MAYO_CONFIG.log('info', 'Lecteur HLS détruit');
  }
}

// Export global
window.HlsPlayer = HlsPlayer;