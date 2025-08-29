# MAYO TV - Interface Web IPTV

## Vue d'ensemble

MAYO TV est une interface web moderne et responsive pour la lecture de chaînes IPTV, intégrée dans l'écosystème iptv-org. Elle permet aux utilisateurs de visualiser et de lire les chaînes IPTV directement via un navigateur web, sans nécessiter d'installation logicielle.

## Fonctionnalités principales

- 🎬 **Lecteur HLS intégré** - Support natif des flux HLS avec HLS.js
- 📱 **Design responsive** - Interface optimisée mobile-first
- 🌐 **Multi-playlists** - Support des playlists par pays, catégorie, langue et région
- ⚡ **Performance optimisée** - Lazy loading, mise en cache, pagination
- 🎨 **Interface moderne** - Design inspiré des apps TV populaires avec Tailwind CSS
- ♿ **Accessibilité** - Navigation clavier, attributs ARIA, contraste élevé
- 💾 **Cache intelligent** - Sauvegarde locale des préférences et playlists

## Architecture technique

### Stack technologique
- **Frontend** : HTML5, CSS3 (Tailwind CSS), JavaScript ES6+
- **Lecteur vidéo** : HLS.js pour la compatibilité cross-browser
- **Typographie** : Inter (Google Fonts)
- **API** : Playlists M3U générées par iptv-org
- **Déploiement** : GitHub Pages

### Structure des fichiers

```
web-interface/
├── index.html                 # Interface principale
├── assets/
│   ├── css/
│   │   └── mayo-tv.css       # Styles personnalisés
│   ├── js/
│   │   ├── mayo-tv.js        # Application principale
│   │   ├── playlist-parser.js # Parseur M3U
│   │   └── hls-player.js     # Lecteur HLS
│   └── icons/
│       └── logo.svg          # Logo de l'application
├── config/
│   └── endpoints.js          # Configuration des URLs
├── manifest.json             # Manifest PWA
└── README.md                 # Documentation
```

## Installation et utilisation

### Développement local

1. **Cloner le repository**
   ```bash
   git clone https://github.com/iptv-org/iptv.git
   cd iptv
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Générer l'interface web**
   ```bash
   npm run web-interface:generate
   ```

4. **Servir localement** (optionnel)
   ```bash
   # Avec Python
   python -m http.server 8000 --directory web-interface
   
   # Avec Node.js
   npx serve web-interface
   ```

### Déploiement en production

L'interface web est automatiquement générée et déployée avec les playlists :

```bash
npm run update  # Génère tout (playlists + interface web)
npm run deploy  # Déploie sur GitHub Pages
```

## Configuration

### URLs des playlists

L'interface supporte 4 types de playlists :

```javascript
PLAYLIST_URLS: {
  country: 'https://iptv-org.github.io/iptv/index.country.m3u',
  category: 'https://iptv-org.github.io/iptv/index.category.m3u', 
  language: 'https://iptv-org.github.io/iptv/index.language.m3u',
  region: 'https://iptv-org.github.io/iptv/index.region.m3u'
}
```

### Personnalisation

Pour personnaliser l'interface, modifiez :

- `config/endpoints.js` - URLs et configuration
- `assets/css/mayo-tv.css` - Styles et couleurs  
- `assets/js/mayo-tv.js` - Logique de l'application

## API et intégration

### Événements du lecteur

L'interface émet des événements personnalisés :

```javascript
// Écouter les événements
mayoTvApp.hlsPlayer.on('streamloaded', (data) => {
  console.log('Flux chargé:', data);
});

mayoTvApp.hlsPlayer.on('streamerror', (error) => {
  console.error('Erreur de flux:', error);
});
```

### Configuration avancée

```javascript
// Personnaliser la configuration HLS
window.MAYO_CONFIG.HLS_CONFIG.maxBufferLength = 60;

// Modifier les limites de performance  
window.MAYO_CONFIG.PERFORMANCE.LAZY_LOAD_THRESHOLD = 50;

// Activer le mode debug
window.MAYO_CONFIG.DEV.DEBUG = true;
```

## Compatibilité navigateurs

- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+  
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Navigateurs mobiles iOS/Android

## Performance

### Optimisations implémentées

- **Lazy loading** des logos de chaînes
- **Pagination** pour les grandes listes de chaînes
- **Cache localStorage** des playlists (1h en production)
- **Minification** du code en production
- **Preload** sélectif des ressources critiques

### Métriques cibles

- Temps de chargement initial : < 3s
- Navigation entre catégories : < 500ms
- Démarrage vidéo : < 5s
- Rendu de la grille : < 1s

## Accessibilité

L'interface respecte les standards WCAG 2.1 :

- Navigation complète au clavier
- Attributs ARIA appropriés
- Contraste de couleurs suffisant
- Textes alternatifs pour les images
- Support des lecteurs d'écran

## Sécurité

- Protection contre XSS avec échappement HTML
- URLs validées et nettoyées
- Pas de stockage de données sensibles
- Utilisation de HTTPS exclusivement

## Développement

### Scripts disponibles

```bash
npm run web-interface:generate  # Génère l'interface
npm run test                   # Lance les tests
npm run lint                   # Vérifie la syntaxe
```

### Tests

```bash
# Tests spécifiques à l'interface web
npm test -- web-interface

# Tests d'intégration complets
npm run test
```

### Contribution

1. Fork le repository
2. Créer une branche feature (`git checkout -b feature/amelioration`)
3. Commiter les changements (`git commit -am 'Ajouter une fonctionnalité'`)
4. Pusher la branche (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

## Support et contact

- 🐛 **Issues** : [GitHub Issues](https://github.com/iptv-org/iptv/issues)
- 💬 **Discussions** : [GitHub Discussions](https://github.com/iptv-org/iptv/discussions)
- 📧 **Email** : Voir le profil iptv-org

## License

MIT License - Voir le fichier [LICENSE](../LICENSE) pour plus de détails.

---

**MAYO TV** - Une interface web moderne pour l'écosystème iptv-org ❤️