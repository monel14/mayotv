import React, { useState } from 'react';
import { SimpleLayout, type View } from './SimpleLayout';

export const SimpleLayoutTest: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('home');

    return (
        <SimpleLayout
            currentView={currentView}
            onViewChange={setCurrentView}
        >
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-4">Test Simple du Layout</h1>
                <p className="text-gray-600 mb-4">Vue actuelle: {currentView}</p>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-2">Instructions de test</h2>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Cliquez sur le bouton hamburger dans le header</li>
                        <li>La sidebar devrait apparaître/disparaître</li>
                        <li>Le contenu principal devrait s'ajuster automatiquement</li>
                        <li>Vérifiez la console pour les logs de debug</li>
                    </ol>
                    <div className="mt-4 p-4 bg-blue-50 rounded">
                        <p className="text-sm text-blue-800">
                            <strong>Debug:</strong> Ouvrez la console du navigateur (F12) pour voir les logs de debug.
                        </p>
                    </div>
                </div>
            </div>
        </SimpleLayout>
    );
};