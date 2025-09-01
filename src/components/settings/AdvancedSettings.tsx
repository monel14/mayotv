import React, { useState } from 'react';
import { cacheManager } from '../../services/cacheManager';
import { stateManager, useAppState } from '../../services/stateManager';
import { performanceMetrics, memoryMonitor } from '../../services/performanceOptimizer';
import { notificationManager } from '../../services/notificationManager';

export const AdvancedSettings: React.FC = () => {
    const appState = useAppState();
    const [activeTab, setActiveTab] = useState<'cache' | 'performance' | 'data' | 'debug'>('cache');
    const [cacheStats, setCacheStats] = useState(cacheManager.getDetailedStats());

    const refreshCacheStats = () => {
        setCacheStats(cacheManager.getDetailedStats());
    };

    const clearCache = () => {
        cacheManager.clear();
        refreshCacheStats();
        notificationManager.success('Cache vidé', 'Toutes les données en cache ont été supprimées');
    };

    const exportAppData = () => {
        const data = {
            state: stateManager.exportState(),
            cache: cacheStats,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mayo-tv-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        notificationManager.success('Export réussi', 'Les données ont été exportées');
    };

    const resetAppData = () => {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
            cacheManager.clear();
            stateManager.resetUIState();
            localStorage.clear();
            notificationManager.success('Données réinitialisées', 'L\'application a été remise à zéro');
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDuration = (ms: number): string => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };

    const tabs = [
        { id: 'cache', name: 'Cache', icon: '💾' },
        { id: 'performance', name: 'Performance', icon: '⚡' },
        { id: 'data', name: 'Données', icon: '📊' },
        { id: 'debug', name: 'Debug', icon: '🐛' }
    ];

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <span>⚙️</span>
                    <span>Paramètres avancés</span>
                </h2>
                <p className="text-gray-600 mt-1">
                    Configuration technique et outils de diagnostic
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="p-6">
                {/* Cache Tab */}
                {activeTab === 'cache' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {cacheStats.totalEntries}
                                </div>
                                <div className="text-sm text-blue-800">Entrées en cache</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {formatBytes(cacheStats.totalSize)}
                                </div>
                                <div className="text-sm text-green-800">Taille du cache</div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {cacheStats.hitRate.toFixed(1)}%
                                </div>
                                <div className="text-sm text-purple-800">Taux de réussite</div>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={refreshCacheStats}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                                Actualiser
                            </button>
                            <button
                                onClick={clearCache}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                                Vider le cache
                            </button>
                        </div>

                        {/* Cache Entries */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Entrées du cache</h3>
                            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                                {cacheStats.entries.length > 0 ? (
                                    <div className="divide-y divide-gray-200">
                                        {cacheStats.entries.slice(0, 20).map((entry, index) => (
                                            <div key={index} className="p-3 flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 truncate">
                                                        {entry.key}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatBytes(entry.size)} • {entry.hits} hits • {formatDuration(entry.age)} ago
                                                    </div>
                                                </div>
                                                <div className={`px-2 py-1 text-xs rounded ${
                                                    entry.expired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {entry.expired ? 'Expiré' : 'Valide'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <div className="text-4xl mb-2">💾</div>
                                        <p>Aucune entrée en cache</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Performance Tab */}
                {activeTab === 'performance' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {appState.performance.fps}
                                </div>
                                <div className="text-sm text-yellow-800">FPS moyen</div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">
                                    {formatBytes(appState.performance.memoryUsage)}
                                </div>
                                <div className="text-sm text-red-800">Mémoire utilisée</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Métriques de performance</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <pre className="text-xs text-gray-700 overflow-x-auto">
                                    {JSON.stringify(performanceMetrics.getAllMetrics(), null, 2)}
                                </pre>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => performanceMetrics.clearMetrics()}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Réinitialiser métriques
                            </button>
                        </div>
                    </div>
                )}

                {/* Data Tab */}
                {activeTab === 'data' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Gestion des données</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Favoris</h4>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {appState.preferences.favoriteChannels.length} chaînes favorites
                                    </p>
                                    <button className="text-sm text-blue-600 hover:text-blue-800">
                                        Gérer les favoris
                                    </button>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Historique</h4>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {appState.preferences.recentChannels.length} chaînes récentes
                                    </p>
                                    <button className="text-sm text-blue-600 hover:text-blue-800">
                                        Vider l'historique
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={exportAppData}
                                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Exporter les données</span>
                            </button>
                            <button
                                onClick={resetAppData}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Réinitialiser tout</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Debug Tab */}
                {activeTab === 'debug' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">État de l'application</h3>
                            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                <pre className="text-xs text-gray-700">
                                    {JSON.stringify(appState, null, 2)}
                                </pre>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Actions de debug</h3>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => console.log('App State:', appState)}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                >
                                    Log State
                                </button>
                                <button
                                    onClick={() => console.log('Cache Stats:', cacheStats)}
                                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                                >
                                    Log Cache
                                </button>
                                <button
                                    onClick={() => {
                                        notificationManager.info('Test', 'Notification de test');
                                    }}
                                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                                >
                                    Test Notification
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <div className="text-yellow-500 text-lg">⚠️</div>
                                <div>
                                    <h4 className="font-semibold text-yellow-900 mb-1">Mode Debug</h4>
                                    <p className="text-sm text-yellow-800">
                                        Ces outils sont destinés au développement et au diagnostic. 
                                        Utilisez-les avec précaution en production.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};