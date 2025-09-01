import React, { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import type { ThemeMode, AccentColor } from '../../services/themeService';

export const ThemeSettings: React.FC = () => {
    const {
        theme,
        colors,
        setMode,
        setAccent,
        setFontSize,
        setReducedMotion,
        setHighContrast,
        exportTheme,
        importTheme,
        resetTheme
    } = useTheme();

    const [importText, setImportText] = useState('');
    const [showImport, setShowImport] = useState(false);

    const handleImport = () => {
        if (importTheme(importText)) {
            setImportText('');
            setShowImport(false);
            alert('Thème importé avec succès !');
        } else {
            alert('Erreur lors de l\'importation du thème');
        }
    };

    const handleExport = () => {
        const themeData = exportTheme();
        navigator.clipboard.writeText(themeData).then(() => {
            alert('Thème copié dans le presse-papiers !');
        }).catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = themeData;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('Thème copié dans le presse-papiers !');
        });
    };

    const accentColors: { value: AccentColor; name: string; color: string }[] = [
        { value: 'blue', name: 'Bleu', color: '#3b82f6' },
        { value: 'green', name: 'Vert', color: '#10b981' },
        { value: 'purple', name: 'Violet', color: '#8b5cf6' },
        { value: 'red', name: 'Rouge', color: '#ef4444' },
        { value: 'orange', name: 'Orange', color: '#f59e0b' },
        { value: 'pink', name: 'Rose', color: '#ec4899' }
    ];

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                    <span>Paramètres d'apparence</span>
                </h2>
                <p className="text-gray-600 mt-1">
                    Personnalisez l'apparence de MAYO TV selon vos préférences
                </p>
            </div>

            <div className="p-6 space-y-8">
                {/* Theme Mode */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Mode d'affichage
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { value: 'light' as ThemeMode, name: 'Clair', icon: '☀️' },
                            { value: 'dark' as ThemeMode, name: 'Sombre', icon: '🌙' },
                            { value: 'auto' as ThemeMode, name: 'Auto', icon: '🔄' }
                        ].map((mode) => (
                            <button
                                key={mode.value}
                                onClick={() => setMode(mode.value)}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    theme.mode === mode.value
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="text-2xl mb-2">{mode.icon}</div>
                                <div className="font-medium">{mode.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Accent Color */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Couleur d'accent
                    </label>
                    <div className="grid grid-cols-6 gap-3">
                        {accentColors.map((color) => (
                            <button
                                key={color.value}
                                onClick={() => setAccent(color.value)}
                                className={`aspect-square rounded-lg border-4 transition-all ${
                                    theme.accent === color.value
                                        ? 'border-gray-800 scale-110'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                style={{ backgroundColor: color.color }}
                                title={color.name}
                            >
                                {theme.accent === color.value && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Font Size */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Taille de police
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { value: 'small' as const, name: 'Petite', size: 'text-sm' },
                            { value: 'medium' as const, name: 'Normale', size: 'text-base' },
                            { value: 'large' as const, name: 'Grande', size: 'text-lg' }
                        ].map((size) => (
                            <button
                                key={size.value}
                                onClick={() => setFontSize(size.value)}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    theme.fontSize === size.value
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className={`font-medium ${size.size}`}>Aa</div>
                                <div className="text-sm mt-1">{size.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Accessibility Options */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Accessibilité
                    </label>
                    <div className="space-y-4">
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={theme.reducedMotion}
                                onChange={(e) => setReducedMotion(e.target.checked)}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <div>
                                <div className="font-medium text-gray-900">Réduire les animations</div>
                                <div className="text-sm text-gray-600">Limite les mouvements et transitions</div>
                            </div>
                        </label>

                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={theme.highContrast}
                                onChange={(e) => setHighContrast(e.target.checked)}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <div>
                                <div className="font-medium text-gray-900">Contraste élevé</div>
                                <div className="text-sm text-gray-600">Améliore la lisibilité</div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Import/Export */}
                <div className="border-t border-gray-200 pt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Sauvegarde et restauration
                    </label>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Exporter</span>
                        </button>

                        <button
                            onClick={() => setShowImport(!showImport)}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            <span>Importer</span>
                        </button>

                        <button
                            onClick={() => {
                                if (confirm('Êtes-vous sûr de vouloir réinitialiser le thème ?')) {
                                    resetTheme();
                                }
                            }}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Réinitialiser</span>
                        </button>
                    </div>

                    {showImport && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <textarea
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                                placeholder="Collez ici les données du thème exporté..."
                                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <div className="flex justify-end space-x-2 mt-3">
                                <button
                                    onClick={() => setShowImport(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={!importText.trim()}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Importer
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview */}
                <div className="border-t border-gray-200 pt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Aperçu
                    </label>
                    <div className="p-4 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="flex items-center space-x-3 mb-3">
                            <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: colors.primary }}
                            ></div>
                            <span className="font-medium" style={{ color: colors.text }}>
                                Couleur principale
                            </span>
                        </div>
                        <div className="text-sm" style={{ color: colors.textSecondary }}>
                            Texte secondaire avec la configuration actuelle
                        </div>
                        <button 
                            className="mt-3 px-4 py-2 rounded-lg text-white font-medium"
                            style={{ backgroundColor: colors.primary }}
                        >
                            Bouton d'exemple
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};