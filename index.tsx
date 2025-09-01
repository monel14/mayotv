import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './src/App';
import { TestApp } from './TestApp';

console.log('🚀 Application starting...');
console.log('React:', React);
console.log('createRoot:', createRoot);

const container = document.getElementById('root');
console.log('Container found:', container);

if (container) {
    try {
        const root = createRoot(container);
        console.log('Root created successfully');
        
        // Test avec TestApp d'abord
        const useTestApp = new URLSearchParams(window.location.search).has('test');
        
        if (useTestApp) {
            root.render(<React.StrictMode><TestApp /></React.StrictMode>);
            console.log('TestApp rendered successfully');
        } else {
            root.render(<React.StrictMode><App /></React.StrictMode>);
            console.log('App rendered successfully');
        }
    } catch (error) {
        console.error('Error rendering app:', error);
        // Fallback simple
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
                <h1>MAYO TV</h1>
                <p>Erreur de chargement: ${error.message}</p>
                <p>Vérifiez la console pour plus de détails.</p>
                <p><a href="?test" style="color: #5490a8;">Essayer le mode test</a></p>
            </div>
        `;
    }
} else {
    console.error('Root container not found!');
}
