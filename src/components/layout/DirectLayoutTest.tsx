import React, { useState } from 'react';
import { DirectLayout, type View } from './DirectLayout';

export const DirectLayoutTest: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('home');

    return (
        <DirectLayout
            currentView={currentView}
            onViewChange={setCurrentView}
        >
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-4">Test Direct du Layout</h1>
                <p className="text-gray-600 mb-4">Vue actuelle: {currentView}</p>
                
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-semibold mb-2">Test du Toggle</h2>
                    <p className="mb-4">
                        Cliquez sur le bouton hamburger dans le header. 
                        Vous devriez voir l'indicateur "Sidebar Visible" changer en haut à droite.
                    </p>
                    <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
                        <p className="text-sm">
                            <strong>Debug:</strong> Un indicateur visuel en haut à droite montre l'état de la sidebar.
                            Ouvrez aussi la console (F12) pour voir les logs détaillés.
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-2">Contenu de test</h2>
                    <p>Ce contenu devrait se déplacer quand la sidebar apparaît/disparaît.</p>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded">
                            <h3 className="font-semibold">Test 1</h3>
                            <p>Contenu de test pour vérifier le layout</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded">
                            <h3 className="font-semibold">Test 2</h3>
                            <p>Plus de contenu pour tester le responsive</p>
                        </div>
                    </div>
                </div>
            </div>
        </DirectLayout>
    );
};