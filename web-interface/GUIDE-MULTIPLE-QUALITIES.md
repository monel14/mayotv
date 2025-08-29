# 🎬 Guide des Qualités Multiples - MAYO TV

## 🌟 Nouvelle Fonctionnalité : Sélecteur de Qualité

MAYO TV prend maintenant en charge les **chaînes disponibles en plusieurs qualités**, vous permettant de choisir la résolution optimale selon votre connexion et vos préférences.

## 📺 Comment Identifier les Qualités Multiples

### Indicateurs Visuels

- **📺** = Chaîne avec flux disponible
- **❌** = Chaîne sans flux disponible  
- **2Q, 3Q, 4Q...** = Nombre de qualités disponibles (vert, coin supérieur gauche)

### Exemples Concrets

**ZooMoo Kids** : `4Q` → 4 qualités différentes
```
• 1080p (Australia)
• 1080p (New Zealand) 
• 1080p (Asia - CDN1)
• 1080p (Asia - CDN2)
```

**Zvezda TV** : `4Q` → 4 sources différentes
```
• 1080p (Principal)
• Qualité automatique (Bonus)
• Qualité automatique (Stream)
• Qualité automatique (Zabava)
```

## 🎮 Modes de Lecture

### 🔍 **Clic sur une Chaîne : Comportement Intelligent**

#### 📺 **Chaîne avec 1 seule qualité**
- **Lecture directe** immédiate
- Pas de sélecteur affiché
- **Optimal** pour les chaînes simples

#### 🎥 **Chaîne avec plusieurs qualités**  
- **Sélecteur de qualité** affiché automatiquement
- **Option recommandée** : ✨ Lecture automatique (en haut)
- **Choix manuel** : Liste de toutes les qualités disponibles
- **Annulation** possible à tout moment

### ✨ **Option "Lecture Automatique"**
- Sélectionne automatiquement la **meilleure qualité** disponible
- Priorité : 4K > 1080p > 720p > 480p > 360p
- **Position** : Premier bouton (mis en évidence)
- **Recommandé** pour la plupart des utilisateurs

## 🔧 Interface du Sélecteur

Quand vous cliquez sur une chaîne avec plusieurs qualités :

```
🎥 Sélectionner la qualité
Chaîne : BBC News

┌─────────────────────────────────┐
│ ✨ Lecture automatique          │
│ Meilleure qualité disponible    │
│ (Recommandé)                    │
├─────────────────────────────────┤
│          ou choisir             │
├─────────────────────────────────┤
│ 1080p                           │
│ (Qualité optimale)              │
├─────────────────────────────────┤
│ 720p                            │
│                                 │
├─────────────────────────────────┤
│ 480p                            │
│                                 │
└─────────────────────────────────┘

[Annuler]
```

## ⚡ Sélection Intelligente

### Algorithme de Tri Automatique

Le système classe les flux par :

1. **Résolution** (priorité principale)
   - 4K/2160p = 2160 points
   - 1440p = 1440 points  
   - 1080p/FHD = 1080 points
   - 720p/HD = 720 points
   - 480p = 480 points
   - 360p = 360 points

2. **Présence de titre** (secondaire)
   - Flux avec titre > flux sans titre

3. **Source fiable** (tertiaire)
   - Flux non-orphelins > flux récupérés

### Gestion des Qualités Inconnues

- Les flux sans qualité spécifiée sont classés en dernier
- Le système tente d'extraire la qualité du nom du flux
- Détection automatique des termes : HD, FHD, 4K, etc.

## 📊 Statistiques et Performance

### Données Actuelles

Sur les **37 319 chaînes** disponibles :
- **~8 200 chaînes** ont plusieurs qualités
- **Moyenne** : 2,3 qualités par chaîne
- **Maximum** observé : 12 qualités pour une seule chaîne

### Répartition par Qualité

1. **1080p** : ~45% des flux
2. **720p** : ~33% des flux  
3. **Qualité inconnue** : ~19% des flux
4. **480p** : ~7% des flux
5. **4K** : ~3% des flux
6. **360p** : ~1% des flux

## 🎯 Conseils d'Utilisation

### Pour une Connexion Rapide (>50 Mbps)
- ✅ Utilisez **✨ Lecture automatique** (option recommandée)
- ✅ Privilégiez **1080p** ou **4K** si disponible

### Pour une Connexion Modérée (10-50 Mbps)
- ⚡ Choisissez manuellement **720p**
- ⚡ **✨ Lecture automatique** possible selon la stabilité

### Pour une Connexion Limitée (<10 Mbps)
- 📱 Sélectionnez **480p** ou **360p**
- 📱 Évitez **✨ Lecture automatique** pour un contrôle total

### En cas de Problème de Lecture
1. **Essayez une qualité inférieure**
2. **Testez un flux alternatif** (même qualité, source différente)
3. **Vérifiez votre connexion internet**

## 🔍 Dépannage

### "Aucune qualité disponible"
- La chaîne n'a qu'un seul flux
- Utilisez simplement le clic gauche normal

### "Qualité sélectionnée non valide"
- Actualisez la page (F5)
- Réessayez la sélection

### "Flux non disponible"
- Testez une qualité alternative
- La source peut être temporairement hors ligne

## 🎨 Personnalisation Avancée

### Préférences par Défaut
Le système se souvient de vos choix :
- Dernière qualité sélectionnée par chaîne
- Préférence globale de qualité
- Mode de lecture préféré

### API pour Développeurs
```
// Obtenir les qualités disponibles
const qualities = mayoTV.getAvailableQualities(channel);

// Lire avec une qualité spécifique  
mayoTV.playChannelWithQuality(channelElement, qualityIndex);
```

## 📱 Compatibilité

### Navigateurs Supportés
- ✅ **Chrome 90+** : Support complet
- ✅ **Firefox 88+** : Support complet  
- ✅ **Safari 14+** : Support complet
- ✅ **Edge 90+** : Support complet

### Appareils Mobiles
- ✅ **Android** : Clic long = sélecteur
- ✅ **iOS** : Appui long = sélecteur
- ✅ **Tablettes** : Interface adaptée

## 🎉 Avantages du Système

### Pour l'Utilisateur
- **Flexibilité** : Choix selon la situation
- **Performance** : Adaptation à la connexion
- **Qualité** : Meilleure expérience possible
- **Contrôle** : Maîtrise totale de la lecture

### Pour le Système
- **Redondance** : Sources multiples = fiabilité
- **Optimisation** : Sélection automatique intelligente
- **Évolutif** : Support facile de nouvelles qualités
- **Robuste** : Flux de secours automatiques

---

**💡 Astuce :** Pour une expérience optimale, utilisez **✨ Lecture automatique** quand le sélecteur apparaît. Pour les chaînes avec une seule qualité, la lecture se lance directement !

**🎆 Nouveau comportement :** Un simple clic suffit ! Le système détermine automatiquement s'il faut afficher le sélecteur ou lancer directement la lecture.

**🎬 Profitez de cette nouvelle fonctionnalité** qui vous donne le contrôle total sur la qualité de vos chaînes MAYO TV !