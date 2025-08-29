#!/usr/bin/env node

/**
 * Script de démarrage pour MAYO TV avec serveur local de données
 * Démarre simultanément le serveur de données et l'interface web
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage de MAYO TV avec serveur local optimisé...\n');

// Démarrer le serveur de données local
console.log('📊 Démarrage du serveur de données local...');
const dataServer = spawn('node', ['local-data-server.js'], {
  cwd: path.join(__dirname),
  stdio: 'inherit',
  env: { ...process.env, PORT: '3004' }
});

// Attendre un peu que le serveur de données démarre
setTimeout(() => {
  console.log('\n🌐 Démarrage du serveur web...');
  
  // Démarrer le serveur web pour l'interface
  const webServer = spawn('node', ['-e', `
    const http = require('http');
    const fs = require('fs');
    const path = require('path');
    
    const server = http.createServer((req, res) => {
      // Gérer les requêtes vers le serveur de données
      if (req.url.startsWith('/api/')) {
        res.writeHead(302, { 'Location': 'http://localhost:3004' + req.url });
        res.end();
        return;
      }
      
      const filePath = path.join(__dirname, req.url === '/' ? '/index.html' : req.url);
      const extname = path.extname(filePath).toLowerCase();
      
      const contentTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.ico': 'image/x-icon',
        '.json': 'application/json; charset=utf-8'
      };
      
      const contentType = contentTypes[extname] || 'text/plain; charset=utf-8';
      
      fs.readFile(filePath, (err, content) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.writeHead(404, { 
              'Content-Type': 'text/html; charset=utf-8',
              'Access-Control-Allow-Origin': '*'
            });
            res.end('<h1>404 - Fichier non trouvé</h1><p>Chemin: ' + filePath + '</p>');
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
            'Cache-Control': 'no-cache'
          });
          res.end(content);
        }
      });
    });
    
    const PORT = 3003;
    server.listen(PORT, () => {
      console.log('🎉 MAYO TV est prêt !');
      console.log('🌐 Interface web: http://localhost:3003');
      console.log('📊 Serveur de données: http://localhost:3004');
      console.log('\\n✨ Avantages du mode local:');
      console.log('   • Chargement ultra-rapide des données');
      console.log('   • Accès à tous les pays et chaînes');
      console.log('   • Pas de limitations artificielles');
      console.log('   • Fonctionnement hors-ligne');
      console.log('\\n👋 Appuyez sur Ctrl+C pour arrêter');
    });
  `], {
    cwd: path.join(__dirname),
    stdio: 'inherit'
  });

  // Gestion de l'arrêt propre
  process.on('SIGINT', () => {
    console.log('\\n👋 Arrêt en cours...');
    dataServer.kill();
    webServer.kill();
    process.exit(0);
  });

  // Gestion des erreurs
  dataServer.on('error', (err) => {
    console.error('❌ Erreur serveur de données:', err.message);
  });

  webServer.on('error', (err) => {
    console.error('❌ Erreur serveur web:', err.message);
  });

}, 2000);