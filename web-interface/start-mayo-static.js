#!/usr/bin/env node

/**
 * Script de démarrage simplifié pour MAYO TV avec fichiers statiques
 * Lance uniquement un serveur web statique - pas de serveur Node.js pour les données
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage de MAYO TV en mode fichiers statiques...\n');

// Vérifier que les données sont copiées
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  console.log('📋 Copie des données JSON...');
  require('./copy-data.js');
  console.log('');
}

// Créer le serveur web statique
const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? '/index.html' : req.url);
  const extname = path.extname(filePath).toLowerCase();
  
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon'
  };
  
  const contentType = contentTypes[extname] || 'text/plain; charset=utf-8';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(`
          <h1>404 - Fichier non trouvé</h1>
          <p>Chemin: ${filePath}</p>
          <p><a href="/">Retour à l'accueil</a></p>
        `);
      } else {
        res.writeHead(500, { 
          'Content-Type': 'text/plain; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        res.end('Erreur serveur: ' + err.code);
      }
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': extname === '.json' ? 'no-cache' : 'public, max-age=3600'
      });
      res.end(content);
    }
  });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log('🎉 MAYO TV est prêt en mode statique !');
  console.log(`🌐 Interface web: http://localhost:${PORT}`);
  console.log('\n✨ Avantages du mode statique:');
  console.log('   • Pas de serveur Node.js requis pour les données');
  console.log('   • Fichiers JSON servis directement');
  console.log('   • Déploiement simplifié');
  console.log('   • Compatible avec tout serveur web statique');
  console.log('\n📊 Données utilisées:');
  console.log('   • Source: temp/data/ (copiées vers web-interface/data/)');
  console.log('   • Format: Fichiers JSON statiques');
  console.log('   • Logos: Fichiers locaux + génération SVG');
  console.log('\n👋 Appuyez sur Ctrl+C pour arrêter');
});

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté');
    process.exit(0);
  });
});

// Gestion des erreurs
server.on('error', (err) => {
  console.error('❌ Erreur serveur:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`   Le port ${PORT} est déjà utilisé. Essayez un autre port avec:`);
    console.error(`   PORT=3005 node start-mayo-static.js`);
  }
});

process.on('uncaughtException', (err) => {
  console.error('❌ Erreur non gérée:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée:', reason);
  process.exit(1);
});