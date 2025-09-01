

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useIptvData } from './hooks/useIptvData';
import type { Channel } from './domain/models';
import { ErrorMessage } from './components/common/ErrorMessage';
import { Header } from './components/layout/Header';
import { CategoryList } from './components/categories/CategoryList';
import { ChannelGrid } from './components/channels/ChannelGrid';
import { Player } from './components/player/Player';
import { ChannelFilters } from './components/channels/ChannelFilters';
import { Sidebar } from './components/layout/Sidebar';
import { SearchInput } from './components/common/SearchInput';
import { Loader } from './components/common/Loader';
import { Home } from './components/home/Home';
import { EpgView } from './components/epg/EpgView';
import { SportsView } from './components/sports/SportsView';
import { useFootballData } from './hooks/useFootballData';

export type View = 'home' | 'countries' | 'categories' | 'languages' | 'all-channels' | 'guide' | 'sports';

export const App = () => {
    const {
        countries, channelsByCountry,
        categories, channelsByCategory,
        languages, channelsByLanguage,
        allChannels,
        isLoading, isSyncing, error
    } = useIptvData();

    const {
        matches,
        sportsChannels,
        sportStats,
        isLoading: isLoadingFootball,
        error: footballError,
        refreshFootballData
    } = useFootballData(allChannels);

    const [view, setView] = useState<View>('home');
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [playingChannel, setPlayingChannel] = useState<Channel | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);

            if (!mobile) {
                // Automatically collapse sidebar on medium screens for more content space on initial load.
                const shouldBeCollapsed = window.innerWidth < 1280;
                setIsSidebarCollapsed(shouldBeCollapsed);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleViewChange = useCallback((newView: View) => {
        setView(newView);
        setSelectedCountry(null);
        setSelectedCategory(null);
        setSelectedLanguage(null);
        setSearchTerm('');
        setGlobalSearchTerm('');
        closeSidebar();
    }, []);

    const handleSelectCountry = useCallback((countryCode: string) => {
        setSelectedCountry(countryCode);
        setSelectedCategory(null);
        setSelectedLanguage(null);
        setSearchTerm('');
    }, []);

    const handleSelectCategory = useCallback((categoryId: string) => {
        setSelectedCategory(categoryId);
        setSelectedCountry(null);
        setSelectedLanguage(null);
        setSearchTerm('');
    }, []);

    const handleSelectLanguage = useCallback((languageCode: string) => {
        setSelectedLanguage(languageCode);
        setSelectedCountry(null);
        setSelectedCategory(null);
        setSearchTerm('');
    }, []);

    const handleGlobalSearchChange = useCallback((term: string) => {
        setGlobalSearchTerm(term);
        if (term) {
            setSelectedCountry(null);
            setSelectedCategory(null);
            setSelectedLanguage(null);
            setSearchTerm('');
        }
    }, []);

    const handleBack = useCallback(() => {
        if (globalSearchTerm) {
            setGlobalSearchTerm('');
            return;
        }
        setSelectedCountry(null);
        setSelectedCategory(null);
        setSelectedLanguage(null);
        setSearchTerm('');
    }, [globalSearchTerm]);

    const handleSelectChannel = useCallback((channel: Channel) => {
        setPlayingChannel(channel);
    }, []);

    const handleClosePlayer = useCallback(() => {
        setPlayingChannel(null);
    }, []);

    const toggleSidebar = useCallback(() => {
        if (isMobile) {
            // Sur mobile, on toggle l'ouverture/fermeture
            setIsSidebarOpen(prev => !prev);
        } else {
            // Sur desktop, on toggle la visibilité complète
            setIsSidebarVisible(prev => {
                const newVisibility = !prev;
                // Si on rend la sidebar visible, on s'assure qu'elle n'est pas réduite
                if (newVisibility) {
                    setIsSidebarCollapsed(false);
                }
                return newVisibility;
            });
        }
    }, [isMobile]);

    const closeSidebar = useCallback(() => {
        setIsSidebarOpen(false);
    }, []);

    const handleToggleSidebarCollapse = useCallback(() => {
        setIsSidebarCollapsed(prev => !prev);
    }, []);

    const globalSearchResults = useMemo(() => {
        if (!globalSearchTerm || isSyncing) return [];
        return allChannels.filter(channel =>
            channel.name.toLowerCase().includes(globalSearchTerm.toLowerCase())
        );
    }, [allChannels, globalSearchTerm, isSyncing]);

    const filteredChannels = useMemo(() => {
        if (globalSearchTerm || isSyncing) return [];

        let channels: Channel[] = [];
        if (selectedCountry) {
            channels = channelsByCountry[selectedCountry] || [];
        } else if (selectedCategory) {
            channels = channelsByCategory[selectedCategory] || [];
        } else if (selectedLanguage) {
            channels = channelsByLanguage[selectedLanguage] || [];
        } else if (view === 'all-channels') {
            channels = allChannels;
        }

        if (!searchTerm) return channels;

        return channels.filter(channel =>
            channel.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [
        selectedCountry, selectedCategory, selectedLanguage, view,
        channelsByCountry, channelsByCategory, channelsByLanguage, allChannels,
        searchTerm, globalSearchTerm, isSyncing
    ]);

    const headerTitle = useMemo(() => {
        if (globalSearchTerm) return 'Search Results';
        if (selectedCountry) {
            const country = countries.find(c => c.code === selectedCountry);
            return country ? `${country.flag} ${country.name}` : selectedCountry;
        }
        if (selectedCategory) {
            const category = categories.find(c => c.id === selectedCategory);
            return category ? category.name : selectedCategory;
        }
        if (selectedLanguage) {
            const language = languages.find(l => l.code === selectedLanguage);
            return language ? language.name : selectedLanguage;
        }
        if (view === 'countries') return 'Pays';
        if (view === 'categories') return 'Catégories';
        if (view === 'languages') return 'Langues';
        if (view === 'all-channels') return 'Toutes les chaînes';
        if (view === 'guide') return 'Guide TV';
        if (view === 'sports') return 'Football & Sports';
        if (view === 'home') return 'Accueil';
        return 'MAYO TV';
    }, [globalSearchTerm, selectedCountry, selectedCategory, selectedLanguage, countries, categories, languages, view]);

    const listItems = useMemo(() => {
        if (view === 'countries') {
            return countries.map(country => ({
                id: country.code,
                name: country.name,
                flag: country.flag,
                count: channelsByCountry[country.code]?.length,
            }));
        }
        if (view === 'categories') {
            return categories.map(category => ({
                id: category.id,
                name: category.name,
                count: channelsByCategory[category.id]?.length,
            }));
        }
        if (view === 'languages') {
            return languages.map(lang => ({
                id: lang.code,
                name: lang.name,
                count: channelsByLanguage[lang.code]?.length,
            }));
        }
        return [];
    }, [view, countries, categories, languages, channelsByCountry, channelsByCategory, channelsByLanguage]);

    const filterItems = useMemo(() => {
        if (selectedCountry) {
            return countries.map(c => ({ code: c.code, name: c.name, flag: c.flag }));
        }
        if (selectedCategory) {
            return categories.map(c => ({ code: c.id, name: c.name }));
        }
        if (selectedLanguage) {
            return languages.map(l => ({ code: l.code, name: l.name }));
        }
        return [];
    }, [selectedCountry, selectedCategory, selectedLanguage, countries, categories, languages]);

    const renderContent = () => {
        if (isLoading) return <Loader />;
        if (error) return <ErrorMessage message={error} />;

        if (view === 'home') {
            return (
                <Home
                    onViewChange={handleViewChange}
                    countries={countries}
                    categories={categories}
                    allChannels={allChannels}
                    onSelectChannel={handleSelectChannel}
                    matches={matches}
                    sportStats={sportStats}
                />
            );
        }

        if (view === 'guide') {
            return (
                <EpgView
                    channels={allChannels}
                    onSelectChannel={handleSelectChannel}
                />
            );
        }

        if (view === 'sports') {
            return (
                <SportsView
                    matches={matches}
                    sportsChannels={sportsChannels}
                    sportStats={sportStats}
                    isLoading={isLoadingFootball}
                    error={footballError}
                    onSelectChannel={handleSelectChannel}
                    onRefresh={refreshFootballData}
                />
            );
        }

        if (globalSearchTerm) {
            return <ChannelGrid channels={globalSearchResults} onSelectChannel={handleSelectChannel} isLoading={isSyncing} />;
        }

        const isItemSelected = selectedCountry || selectedCategory || selectedLanguage;

        if (view === 'all-channels') {
            return (
                <>
                    <div className="mb-6">
                        <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
                    </div>
                    <ChannelGrid channels={filteredChannels} onSelectChannel={handleSelectChannel} isLoading={isSyncing} />
                </>
            );
        }

        if (isItemSelected) {
            const handleItemChange = selectedCountry ? handleSelectCountry
                : selectedCategory ? handleSelectCategory
                    : handleSelectLanguage;

            const filterLabel = selectedCountry ? 'Filter by country'
                : selectedCategory ? 'Filter by category'
                    : 'Filter by language';

            return (
                <>
                    <ChannelFilters
                        searchTerm={searchTerm}
                        onSearchChange={(e) => setSearchTerm(e.target.value)}
                        filterItems={filterItems}
                        selectedItem={selectedCountry || selectedCategory || selectedLanguage || ''}
                        onItemChange={handleItemChange}
                        filterLabel={filterLabel}
                    />
                    <ChannelGrid channels={filteredChannels} onSelectChannel={handleSelectChannel} isLoading={isSyncing} />
                </>
            );
        }

        const handleSelect = view === 'countries' ? handleSelectCountry
            : view === 'categories' ? handleSelectCategory
                : handleSelectLanguage;

        return (
            <CategoryList
                items={listItems}
                onSelectItem={handleSelect}
                isSyncing={isSyncing}
            />
        );
    };

    return (
        <div className="h-screen bg-background relative">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
                currentView={view}
                onViewChange={handleViewChange}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={handleToggleSidebarCollapse}
                isVisible={isSidebarVisible}
                isMobile={isMobile}
            />
            {/* Header fixe au-dessus de tout */}
            <Header
                title={headerTitle}
                showBackButton={!!(selectedCountry || selectedCategory || selectedLanguage || globalSearchTerm)}
                onBack={handleBack}
                onToggleSidebar={toggleSidebar}
                globalSearchTerm={globalSearchTerm}
                onGlobalSearchChange={handleGlobalSearchChange}
                isSidebarOpen={isMobile ? isSidebarOpen : isSidebarVisible}
            />

            {/* Contenu principal avec marge pour le header */}
            <div
                className="absolute top-16 bottom-0 right-0 flex flex-col overflow-y-hidden transition-all duration-300"
                style={{
                    left: !isMobile && isSidebarVisible
                        ? (isSidebarCollapsed ? '5rem' : '16rem')
                        : '0'
                }}
            >
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
                    {renderContent()}
                </main>
            </div>
            {playingChannel && <Player channel={playingChannel} onClose={handleClosePlayer} />}
        </div>
    );
};