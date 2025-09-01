import React, { useState, useEffect } from 'react';
import { keyboardService, type KeyboardShortcut } from '../../services/keyboardService';

export const KeyboardShortcuts: React.FC = () => {
    const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
    const [isEnabled, setIsEnabled] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        setShortcuts(keyboardService.getShortcuts());
        setIsEnabled(keyboardService.isShortcutEnabled());
    }, []);

    const categories = [
        { value: 'all', name: 'Tous', icon: '📋' },
        { value: 'navigation', name: 'Navigation', icon: '🧭' },
        { value: 'player', name: 'Lecteur', icon: '▶️' },
        { value: 'search', name: 'Recherche', icon: '🔍' },
        { value: 'general', name: 'Général', icon: '⚙️' }
    ];

    const filteredShortcuts = selectedCategory === 'all' 
        ? shortcuts 
        : shortcuts.filter(shortcut => shortcut.category === selectedCategory);

    const toggleShortcuts = () => {
        if (isEnabled) {
            keyboardService.disable();
        } else {
            keyboardService.enable();
        }
        setIsEnabled(!isEnabled);
    };

    const getCategoryIcon = (category: KeyboardShortcut['category']) => {
        switch (category) {
            case 'navigation': return '🧭';
            case 'player': return '▶️';
            case 'search': return '🔍';
            case 'general': return '⚙️';
            default: return '📋';
        }
    };

    const getCategoryName = (category: KeyboardShortcut['category']) => {
        switch (category) {
            case 'navigation': return 'Navigation';
            case 'player': return 'Lecteur';
            case 'search': return 'Recherche';
            case 'general': return 'Général';
            default: return 'Autre';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                            <span>⌨️</span>
                            <span>Raccourcis clavier</span>
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Utilisez ces raccourcis pour naviguer plus rapidement
                        </p>
                    </div>
                    <label className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-700">Activés</span>
                        <button
                            onClick={toggleShortcuts}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                isEnabled ? 'bg-primary' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    isEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </label>
                </div>
            </div>

            <div className="p-6">
                {/* Category Filter */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                            <button
                                key={category.value}
                                onClick={() => setSelectedCategory(category.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                                    selectedCategory === category.value
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <span>{category.icon}</span>
                                <span>{category.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Shortcuts List */}
                {filteredShortcuts.length > 0 ? (
                    <div className="space-y-3">
                        {filteredShortcuts.map(shortcut => (
                            <div
                                key={shortcut.id}
                                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                                    isEnabled 
                                        ? 'border-gray-200 bg-white hover:bg-gray-50' 
                                        : 'border-gray-100 bg-gray-50 opacity-60'
                                }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="text-lg">
                                        {getCategoryIcon(shortcut.category)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {shortcut.description}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {getCategoryName(shortcut.category)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                    {keyboardService.formatShortcut(shortcut).split(' + ').map((key, index, array) => (
                                        <React.Fragment key={index}>
                                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
                                                {key}
                                            </kbd>
                                            {index < array.length - 1 && (
                                                <span className="text-gray-400 text-xs">+</span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-4xl mb-4">⌨️</div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Aucun raccourci dans cette catégorie
                        </h3>
                        <p className="text-gray-600">
                            Sélectionnez une autre catégorie pour voir les raccourcis disponibles
                        </p>
                    </div>
                )}

                {/* Help Text */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                        <div className="text-blue-500 text-lg">💡</div>
                        <div>
                            <h4 className="font-semibold text-blue-900 mb-1">Conseils d'utilisation</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Les raccourcis ne fonctionnent pas dans les champs de saisie</li>
                                <li>• Utilisez Échap pour fermer les modales et revenir en arrière</li>
                                <li>• Les raccourcis du lecteur ne fonctionnent que pendant la lecture</li>
                                <li>• Vous pouvez désactiver tous les raccourcis avec l'interrupteur ci-dessus</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Quick Reference Card */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Raccourcis les plus utilisés</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Accueil</span>
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded">H</kbd>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Rechercher</span>
                            <div className="flex items-center space-x-1">
                                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded">Ctrl</kbd>
                                <span className="text-gray-400 text-xs">+</span>
                                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded">S</kbd>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Sports</span>
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded">F</kbd>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Lecture/Pause</span>
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded">Espace</kbd>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};