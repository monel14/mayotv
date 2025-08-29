# Logo MAYO TV

## Description
Ce dossier contient le logo officiel de MAYO TV utilisé dans l'interface web.

## Fichiers
- `logo.png` - Logo principal MAYO TV (fourni par l'utilisateur)
- `mayo-tv-logo.svg` - Logo SVG alternatif 
- `mayo-tv-alt.svg` - Logo de fallback pour les chaînes

## Utilisation

### Logo Principal
Le logo `logo.png` est utilisé dans :
- L'en-tête de l'application (index.html)
- Comme fallback pour les chaînes sans logo
- Configuration dans `config/endpoints.js`

### Configuration
```javascript
FALLBACK: {
  LOGO: 'assets/images/logos/logo.png',
  GENERIC_LOGO_LOCAL: 'assets/images/logos/logo.png'
}
```

### Styles CSS
Le logo bénéficie d'effets visuels définis dans `assets/css/mayo-tv.css` :
- Ombre portée (drop-shadow)
- Animation au survol (scale + ombre)
- Transition fluide

## Format
- **Type** : PNG
- **Utilisation** : Logo principal et fallback
- **Optimisé** : Pour affichage web responsive