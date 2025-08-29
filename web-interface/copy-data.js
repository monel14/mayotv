#!/usr/bin/env node

/**
 * Script de copie des données JSON depuis temp/data vers web-interface/data
 * Permet d'accéder aux données comme fichiers statiques sans serveur Node.js
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'temp', 'data');
const targetDir = path.join(__dirname, 'data');

// Fichiers JSON nécessaires pour l'interface
const dataFiles = [
  'channels.json',
  'countries.json',
  'categories.json',
  'languages.json',
  'regions.json',
  'streams.json',
  'logos.json',
  'feeds.json'
];

console.log('🔄 Copie des données JSON...');

// Créer le répertoire de destination s'il n'existe pas
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copier chaque fichier
let copiedFiles = 0;
let errorFiles = 0;

dataFiles.forEach(filename => {
  const sourcePath = path.join(sourceDir, filename);
  const targetPath = path.join(targetDir, filename);
  
  try {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ ${filename} copié`);
      copiedFiles++;
    } else {
      console.warn(`⚠️  ${filename} introuvable dans ${sourceDir}`);
      errorFiles++;
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la copie de ${filename}:`, error.message);
    errorFiles++;
  }
});

console.log(`\n📊 Résumé de la copie:`);
console.log(`   ✅ Fichiers copiés: ${copiedFiles}`);
console.log(`   ❌ Erreurs: ${errorFiles}`);

if (copiedFiles > 0) {
  console.log('\n🎉 Données prêtes ! L\'interface peut maintenant accéder aux fichiers statiques.');
} else {
  console.log('\n⚠️  Aucun fichier copié. Vérifiez le répertoire source.');
  process.exit(1);
}