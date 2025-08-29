@echo off
echo 🚀 Démarrage de MAYO TV en mode fichiers statiques...
echo.

cd /d "%~dp0"

REM Vérifier que Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé ou n'est pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Lancer le serveur statique
node start-mayo-static.js

pause