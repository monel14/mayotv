import React, { useState, useEffect, useMemo } from 'react';
import type { View } from '../../hooks/useAppNavigation';
import type { Channel, Country, Category, LiveMatch, SportStats } from '../../domain/models';
import { getCurrentProgram } from '../../services/epgApi';
import { SportsHighlight } from '../sports/SportsHighlight';

// --- Icon Components ---
const GlobeAltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" />
    </svg>
);

const TagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 8V3a2 2 0 012-2z" />
    </svg>
);

const TvIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const LanguageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a2 2 0 002 2h2a2 2 0 002-2v-4M9 10V8a2 2 0 012-2h2a2 2 0 012 2v2" />
    </svg>
);

const FireIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    </svg>
);

// --- Card Component for the Home Page ---
interface HomeCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const HomeCard = ({ icon, title, description, onClick }: HomeCardProps) => (
    <button
        onClick={onClick}
        className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-primary text-left w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4 mx-auto md:mx-0">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 text-center md:text-left">{title}</h3>
        <p className="text-gray-500 text-center md:text-left">{description}</p>
    </button>
);


// --- Featured Channel Card ---
interface FeaturedChannelProps {
    channel: Channel;
    onSelect: (channel: Channel) => void;
}

const FeaturedChannel = ({ channel, onSelect }: FeaturedChannelProps) => (
    <div 
        onClick={() => onSelect(channel)}
        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-primary overflow-hidden group"
    >
        <div className="relative">
            {channel.logo ? (
                <img
                    src={channel.logo}
                    alt={channel.name}
                    className="w-full h-32 object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />
            ) : (
                <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <TvIcon />
                </div>
            )}
            <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <PlayIcon />
                <span>LIVE</span>
            </div>
        </div>
        <div className="p-4">
            <h3 className="font-semibold text-gray-900 truncate mb-1">{channel.name}</h3>
            <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center">
                    {channel.countryFlag && <span className="mr-1">{channel.countryFlag}</span>}
                    {channel.countryName || channel.country}
                </span>
                {channel.quality && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">
                        {channel.quality}
                    </span>
                )}
            </div>
        </div>
    </div>
);

// --- Stats Card ---
interface StatsCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
}

const StatsCard = ({ icon, title, value, subtitle }: StatsCardProps) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center">
            <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                    {icon}
                </div>
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
        </div>
    </div>
);

// --- Quick Action Button ---
interface QuickActionProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    featured?: boolean;
}

const QuickAction = ({ icon, title, description, onClick, featured = false }: QuickActionProps) => (
    <button
        onClick={onClick}
        className={`p-4 rounded-lg border transition-all duration-300 text-left w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
            featured 
                ? 'bg-gradient-to-r from-primary to-secondary text-white border-transparent hover:shadow-lg transform hover:-translate-y-1' 
                : 'bg-white border-gray-200 hover:border-primary hover:shadow-md'
        }`}
    >
        <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 ${featured ? 'text-white' : 'text-primary'}`}>
                {icon}
            </div>
            <div>
                <h3 className={`font-semibold ${featured ? 'text-white' : 'text-gray-900'}`}>
                    {title}
                </h3>
                <p className={`text-sm ${featured ? 'text-white/90' : 'text-gray-600'}`}>
                    {description}
                </p>
            </div>
        </div>
    </button>
);

// --- Main Home Component ---
interface HomeProps {
    onViewChange: (view: View) => void;
    countries: Country[];
    categories: Category[];
    allChannels: Channel[];
    onSelectChannel: (channel: Channel) => void;
    matches: LiveMatch[];
    sportStats: SportStats | null;
}

export const Home = ({ onViewChange, countries, categories, allChannels, onSelectChannel, matches, sportStats }: HomeProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Get featured channels (random selection)
    const featuredChannels = useMemo(() => {
        if (allChannels.length === 0) return [];
        const shuffled = [...allChannels].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 6);
    }, [allChannels]);

    // Get popular countries (top 6 by channel count)
    const popularCountries = useMemo(() => {
        const countryChannelCount = countries.map(country => ({
            ...country,
            channelCount: allChannels.filter(ch => ch.country === country.code).length
        }));
        return countryChannelCount
            .sort((a, b) => b.channelCount - a.channelCount)
            .slice(0, 6);
    }, [countries, allChannels]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    return (
        <div className="animate-fade-in space-y-8">
            {/* Hero Section */}
            <div className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                    Bienvenue sur <span className="text-primary">MAYO TV</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6">
                    Votre lecteur IPTV moderne. Explorez des milliers de chaînes du monde entier, 
                    découvrez de nouveaux contenus et profitez d'une expérience de visionnage exceptionnelle.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatTime(currentTime)}</span>
                    </div>
                    <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(currentTime)}</span>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard
                    icon={<TvIcon />}
                    title="Chaînes disponibles"
                    value={allChannels.length.toLocaleString()}
                    subtitle="En direct"
                />
                <StatsCard
                    icon={<GlobeAltIcon />}
                    title="Pays"
                    value={countries.length}
                    subtitle="Du monde entier"
                />
                <StatsCard
                    icon={<TagIcon />}
                    title="Catégories"
                    value={categories.length}
                    subtitle="Genres variés"
                />
                <StatsCard
                    icon={<FireIcon />}
                    title="Qualité"
                    value="HD/4K"
                    subtitle="Haute définition"
                />
            </div>

            {/* Sports Highlight */}
            {matches.length > 0 && sportStats && (
                <SportsHighlight
                    matches={matches}
                    sportStats={sportStats}
                    onViewSports={() => onViewChange('sports')}
                />
            )}

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions rapides</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <QuickAction
                        icon={<span className="text-2xl">⚽</span>}
                        title="Football & Sports"
                        description="Matchs en direct et à venir"
                        onClick={() => onViewChange('sports')}
                        featured
                    />
                    <QuickAction
                        icon={<CalendarIcon />}
                        title="Guide TV"
                        description="Programmes en cours et à venir"
                        onClick={() => onViewChange('guide')}
                    />
                    <QuickAction
                        icon={<GlobeAltIcon />}
                        title="Par Pays"
                        description="Chaînes par pays d'origine"
                        onClick={() => onViewChange('countries')}
                    />
                    <QuickAction
                        icon={<TagIcon />}
                        title="Par Catégorie"
                        description="News, Sports, Films, etc."
                        onClick={() => onViewChange('categories')}
                    />
                    <QuickAction
                        icon={<LanguageIcon />}
                        title="Par Langue"
                        description="Contenu dans votre langue"
                        onClick={() => onViewChange('languages')}
                    />
                </div>
            </div>

            {/* Featured Channels */}
            {featuredChannels.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Chaînes populaires</h2>
                        <button
                            onClick={() => onViewChange('all-channels')}
                            className="text-primary hover:text-secondary font-medium text-sm flex items-center space-x-1"
                        >
                            <span>Voir toutes</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        {featuredChannels.map((channel, index) => (
                            <FeaturedChannel
                                key={`${channel.url}-${index}`}
                                channel={channel}
                                onSelect={onSelectChannel}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Popular Countries */}
            {popularCountries.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Pays populaires</h2>
                        <button
                            onClick={() => onViewChange('countries')}
                            className="text-primary hover:text-secondary font-medium text-sm flex items-center space-x-1"
                        >
                            <span>Voir tous</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {popularCountries.map((country) => (
                            <button
                                key={country.code}
                                onClick={() => onViewChange('countries')}
                                className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary text-center group"
                            >
                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                                    {country.flag}
                                </div>
                                <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">
                                    {country.name}
                                </h3>
                                <p className="text-xs text-gray-600">
                                    {country.channelCount} chaînes
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer CTA */}
            <div className="text-center bg-gray-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Prêt à explorer ?
                </h3>
                <p className="text-gray-600 mb-6">
                    Découvrez des milliers de chaînes gratuites du monde entier
                </p>
                <button
                    onClick={() => onViewChange('all-channels')}
                    className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors inline-flex items-center space-x-2"
                >
                    <TvIcon />
                    <span>Commencer à regarder</span>
                </button>
            </div>
        </div>
    );
};