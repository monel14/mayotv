import React, { useState } from 'react';
import { Layout } from './Layout';

export type View = 'home' | 'sports' | 'countries' | 'categories' | 'all-channels' | 'guide' | 'settings';

export const LayoutTest: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('home');

    return (
        <Layout
            currentView={currentView}
            onViewChange={setCurrentView}
            title="MAYO TV"
        >
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-4">Test du Layout</h1>
                <p className="text-gray-600 mb-4">Vue actuelle: {currentView}</p>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-2">Contenu de test</h2>
                    <p>Ceci est un contenu de test pour vérifier que le layout fonctionne correctement.</p>
                    <p className="mt-2">Cliquez sur le bouton hamburger dans le header pour tester le toggle de la sidebar.</p>
                </div>
            </div>
        </Layout>
    );
};