@echo off
echo 🚀 Démarrage de MAYO TV...
echo.

echo 📊 Démarrage du serveur de données (port 3002)...
start "MAYO TV Data Server" cmd /k "cd /d %~dp0 && node local-data-server.js"

timeout /t 3 /nobreak > nul

echo 🌐 Démarrage du serveur web (port 3003)...
start "MAYO TV Web Server" cmd /k "cd /d %~dp0 && node start-mayo-local.js"

timeout /t 2 /nobreak > nul

echo.
echo ✅ MAYO TV est en cours de démarrage !
echo 🌐 Interface web : http://localhost:3003
echo 📊 Serveur de données : http://localhost:3002
echo.
echo 👋 Fermez cette fenêtre quand vous aurez terminé.
pause