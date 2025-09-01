import { ChangeEvent } from 'react';
import type { Channel, Country, Category, Language } from '../../domain/models';
import type { View } from '../../hooks/useAppNavigation';

interface MainContentProps {
    view: View;
    isLoading: boolean;
    isSyncing: boolean;
    error: string | null;
    countries: Country[];
    channelsByCountry: Record<string, Channel[]>;
    categories: Category[];
    channelsByCategory: Record<string, Channel[]>;
    languages: Language[];
    channelsByLanguage: Record<string, Channel[]>;
    allChannels: Channel[];
    matches: any[];
    sportsChannels: Channel[];
    sportStats: any;
    isLoadingFootball: boolean;
    footballError: string | null;
    globalSearchResults: Channel[];
    filteredChannels: Channel[];
    listItems: any[];
    filterItems: any[];
    globalSearchTerm: string;
    selectedCountry: string;
    selectedCategory: string;
    selectedLanguage: string;
    searchTerm: string;
    onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onSelectChannel: (channel: Channel) => void;
    onViewChange: (view: View) => void;
    onRefreshFootball: () => void;
    onSelectCountry: (countryCode: string) => void;
    onSelectCategory: (categoryId: string) => void;
    onSelectLanguage: (languageCode: string) => void;
}

export const MainContent = ({
    view,
    isLoading,
    isSyncing,
    error,
    countries,
    categories,
    languages,
    allChannels,
    globalSearchResults,
    filteredChannels,
    listItems,
    globalSearchTerm,
    searchTerm,
    onSearchChange,
    onSelectChannel,
    onViewChange,
    onSelectCountry,
    onSelectCategory,
    onSelectLanguage
}: MainContentProps) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Chargement des données...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-center">
                <div>
                    <div className="text-lg text-red-500 mb-2">Erreur de chargement</div>
                    <p className="text-sm text-gray-600">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    // Home view - show overview and quick access
    if (view === 'home') {
        return (
            <div className="space-y-6">
                {isSyncing && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            <span className="text-blue-700">Synchronisation des chaînes en cours...</span>
                        </div>
                    </div>
                )}
                
                <div className="text-center py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Bienvenue sur MAYO TV</h1>
                    <p className="text-gray-600 mb-8">Découvrez des milliers de chaînes TV du monde entier</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div 
                        onClick={() => onViewChange('countries')}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all"
                    >
                        <div className="text-2xl mb-2">🌍</div>
                        <h3 className="text-lg font-semibold mb-1">Pays</h3>
                        <p className="text-blue-100 text-sm">{countries.length} pays disponibles</p>
                    </div>

                    <div 
                        onClick={() => onViewChange('categories')}
                        className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all"
                    >
                        <div className="text-2xl mb-2">📺</div>
                        <h3 className="text-lg font-semibold mb-1">Catégories</h3>
                        <p className="text-green-100 text-sm">{categories.length} catégories</p>
                    </div>

                    <div 
                        onClick={() => onViewChange('languages')}
                        className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white cursor-pointer hover:from-purple-600 hover:to-purple-700 transition-all"
                    >
                        <div className="text-2xl mb-2">🗣️</div>
                        <h3 className="text-lg font-semibold mb-1">Langues</h3>
                        <p className="text-purple-100 text-sm">{languages.length} langues</p>
                    </div>

                    <div 
                        onClick={() => onViewChange('all-channels')}
                        className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all"
                    >
                        <div className="text-2xl mb-2">📡</div>
                        <h3 className="text-lg font-semibold mb-1">Toutes les chaînes</h3>
                        <p className="text-orange-100 text-sm">{allChannels.length} chaînes</p>
                    </div>
                </div>

                {allChannels.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Chaînes populaires</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {allChannels.slice(0, 8).map((channel, index) => (
                                <div
                                    key={`${channel.name}-${index}`}
                                    onClick={() => onSelectChannel(channel)}
                                    className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-center space-x-3">
                                        {channel.logo && (
                                            <img
                                                src={channel.logo}
                                                alt={channel.name}
                                                className="w-12 h-12 object-contain rounded"
                                            />
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                                            {channel.countryName && (
                                                <p className="text-sm text-gray-600">{channel.countryFlag} {channel.countryName}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // List views (countries, categories, languages)
    if (view === 'countries' || view === 'categories' || view === 'languages') {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {listItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => {
                                if (view === 'countries') onSelectCountry(item.id);
                                else if (view === 'categories') onSelectCategory(item.id);
                                else if (view === 'languages') onSelectLanguage(item.id);
                            }}
                            className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {item.flag && <span className="text-2xl">{item.flag}</span>}
                                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                </div>
                                {item.count && (
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                                        {item.count}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Channel views (all-channels, search results, filtered channels)
    const channelsToShow = globalSearchTerm ? globalSearchResults : filteredChannels;

    return (
        <div className="space-y-4">
            {(view === 'all-channels' || globalSearchTerm) && (
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Rechercher des chaînes..."
                        value={searchTerm}
                        onChange={onSearchChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {channelsToShow.map((channel, index) => (
                    <div
                        key={`${channel.name}-${index}`}
                        onClick={() => onSelectChannel(channel)}
                        className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center space-x-3">
                            {channel.logo && (
                                <img
                                    src={channel.logo}
                                    alt={channel.name}
                                    className="w-12 h-12 object-contain rounded"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            )}
                            <div>
                                <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                                {channel.countryName && (
                                    <p className="text-sm text-gray-600">{channel.countryFlag} {channel.countryName}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {channelsToShow.length === 0 && !isSyncing && (
                <div className="text-center py-8">
                    <p className="text-gray-500">Aucune chaîne trouvée</p>
                </div>
            )}
        </div>
    );
};