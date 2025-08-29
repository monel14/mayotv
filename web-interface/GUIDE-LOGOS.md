# 🔧 Guide de Dépannage - Problèmes d'Affichage des Logos

## 🎯 Problème identifié

Vous voyez des erreurs similaires à celles-ci dans la console de votre navigateur :
```
GET https://i.imgur.com/nSJve1d.png net::ERR_CONNECTION_TIMED_OUT
GET https://i.imgur.com/Z5VCBgu.png net::ERR_CONNECTION_TIMED_OUT
```

## 📋 Causes possibles

### 1. **Restrictions réseau**
- Pare-feu d'entreprise bloquant imgur.com
- Filtrage DNS ou proxy
- Restrictions géographiques

### 2. **Problèmes de connectivité**
- Connexion internet instable
- Surcharge des serveurs d'images
- Timeouts réseau

### 3. **Limitations du navigateur**
- Bloqueurs de publicité trop agressifs
- Extensions de sécurité
- Paramètres de confidentialité stricts

## ✅ Solutions implémentées

MAYO TV dispose maintenant d'un système intelligent de gestion des logos :

### 🎨 **Logos de remplacement automatiques**
- **Détection intelligente** des domaines problématiques (imgur.com, etc.)
- **Génération automatique** de logos colorés avec les initiales des chaînes
- **Fallback immédiat** sans attendre les timeouts

### ⚡ **Performance optimisée**
- **Timeout réduit** pour les images (5 secondes au lieu de 30)
- **Chargement asynchrone** des logos
- **Cache intelligent** des résultats

### 🎯 **Interface améliorée**
- **Placeholders visuels** pendant le chargement
- **Indicateurs de progression** clairs
- **Messages informatifs** pour l'utilisateur

## 🚀 Comment ça fonctionne maintenant

1. **Chargement d'une chaîne** → MAYO TV vérifie si le logo provient d'un domaine problématique
2. **Si problématique** → Utilise immédiatement un logo coloré généré avec les initiales
3. **Si fiable** → Tente le chargement avec un timeout court
4. **En cas d'échec** → Bascule automatiquement vers le logo de remplacement

## 🎨 Exemples de logos de remplacement

- **CNN** → Logo rouge avec "CN"
- **BBC** → Logo violet avec "BB" 
- **ESPN** → Logo vert avec "ES"
- **France 24** → Logo orange avec "F2"

## 🔍 Outils de diagnostic

### Diagnostic automatique
Visitez : `http://localhost:3003/diagnostic-logos.html`

Ce diagnostic teste :
- ✅ Connectivité aux serveurs d'images
- ⏱️ Temps de réponse des logos
- 📊 Taux de succès du chargement

### Console développeur
Appuyez sur `F12` et consultez l'onglet Console pour voir :
- Les URLs de logos qui échouent
- Les messages de diagnostic MAYO TV
- Les statistiques de chargement

## 📱 Utilisation normale

Même avec ces problèmes de logos :
1. **Toutes les chaînes restent accessibles** 
2. **L'interface reste fonctionnelle**
3. **Les logos de remplacement sont esthétiques**
4. **Aucun impact sur la lecture vidéo**

## ⚙️ Configuration avancée

Pour les utilisateurs techniques, vous pouvez modifier dans `config/endpoints.js` :

```javascript
// Timeout des images (défaut: 5000ms)
PERFORMANCE.IMAGE_TIMEOUT: 3000

// Domaines à éviter
FALLBACK.PROBLEMATIC_DOMAINS: [
  'imgur.com',
  'votre-domaine-problematique.com'
]
```

## 🆘 Support

Si le problème persiste :
1. Vérifiez votre connexion internet
2. Désactivez temporairement votre pare-feu/antivirus
3. Essayez un autre navigateur
4. Contactez votre administrateur réseau

---
**💡 Astuce :** Les logos de remplacement de MAYO TV sont conçus pour être aussi lisibles et esthétiques que les logos originaux !