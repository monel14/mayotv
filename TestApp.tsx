import React from 'react';

export const TestApp = () => {
    return (
        <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f3f4f6',
            minHeight: '100vh'
        }}>
            <h1 style={{ color: '#5490a8', marginBottom: '20px' }}>
                🎬 MAYO TV - Test
            </h1>
            <p style={{ fontSize: '18px', marginBottom: '20px' }}>
                L'application fonctionne ! 🎉
            </p>
            <div style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                maxWidth: '600px',
                margin: '0 auto'
            }}>
                <h2>État du système :</h2>
                <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
                    <li>✅ React chargé</li>
                    <li>✅ DOM monté</li>
                    <li>✅ Styles appliqués</li>
                    <li>✅ Composant rendu</li>
                </ul>
            </div>
        </div>
    );
};