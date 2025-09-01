import React, { useState, useMemo } from 'react';
import { MatchCard } from './MatchCard';
import { MatchModal } from './MatchModal';
import { SportsBadges } from './SportsBadges';
import { FavoriteTeams } from './FavoriteTeams';
import { Loader } from '../common/Loader';
import { ErrorMessage } from '../common/ErrorMessage';
import type { LiveMatch, Channel, SportStats } from '../../domain/models';
import { getLiveMatches, getTodaysMatches, getUpcomingMatches } from '../../services/footballApi';

interface SportsViewProps {
    matches: LiveMatch[];
    sportsChannels: Channel[];
    sportStats: SportStats | null;
    isLoading: boolean;
    error: string | null;
    onSelectChannel: (channel: Channel) => void;
    onRefresh: () => void;
}

export const SportsView: React.FC<SportsViewProps> = ({
    matches,
    sportsChannels,
    sportStats,
    isLoading,
    error,
    onSelectChannel,
    onRefresh
}) => {
    const [selectedMatch, setSelectedMatch] = useState<LiveMatch | null>(null);
    const [activeTab, setActiveTab] = useState<'live' | 'today' | 'upcoming' | 'channels'>('live');

    const liveMatches = useMemo(() => getLiveMatches(matches), [matches]);
    const todaysMatches = useMemo(() => getTodaysMatches(matches), [matches]);
    const upcomingMatches = useMemo(() => getUpcomingMatches(matches), [matches]);

    const handleViewDetails = (match: LiveMatch) => {
        setSelectedMatch(match);
    };

    const handleCloseModal = () => {
        setSelectedMatch(null);
    };

    if (isLoading && matches.length === 0) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="space-y-4">
                <ErrorMessage message={error} />
                <div className="text-center">
                    <button
                        onClick={onRefresh}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    const getTabContent = () => {
        switch (activeTab) {
            case 'live':
                return liveMatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {liveMatches.map((match) => (
                            <MatchCard
                                key={match.id}
                                match={match}
                                onSelectChannel={onSelectChannel}
                                onViewDetails={handleViewDetails}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">⚽</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            Aucun match en direct
                        </h3>
                        <p className="text-gray-600">
                            Consultez les matchs d'aujourd'hui ou à venir
                        </p>
                    </div>
                );

            case 'today':
                return todaysMatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {todaysMatches.map((match) => (
                            <MatchCard
                                key={match.id}
                                match={match}
                                onSelectChannel={onSelectChannel}
                                onViewDetails={handleViewDetails}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📅</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            Aucun match aujourd'hui
                        </h3>
                        <p className="text-gray-600">
                            Consultez les matchs à venir cette semaine
                        </p>
                    </div>
                );

            case 'upcoming':
                return upcomingMatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingMatches.map((match) => (
                            <MatchCard
                                key={match.id}
                                match={match}
                                onSelectChannel={onSelectChannel}
                                onViewDetails={handleViewDetails}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔮</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            Aucun match à venir
                        </h3>
                        <p className="text-gray-600">
                            Les prochains matchs seront bientôt disponibles
                        </p>
                    </div>
                );

            case 'channels':
                return sportsChannels.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {sportsChannels.map((channel, index) => (
                            <button
                                key={`${channel.url}-${index}`}
                                onClick={() => onSelectChannel(channel)}
                                className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary text-left group"
                            >
                                <div className="flex items-center space-x-3 mb-3">
                                    {channel.logo ? (
                                        <img
                                            src={channel.logo}
                                            alt={channel.name}
                                            className="w-12 h-12 object-contain rounded group-hover:scale-110 transition-transform"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            {channel.name}
                                        </h3>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            {channel.countryFlag && (
                                                <span>{channel.countryFlag}</span>
                                            )}
                                            <span className="truncate">
                                                {channel.countryName || channel.country}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {channel.quality && (
                                    <div className="flex justify-end">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                                            {channel.quality}
                                        </span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📺</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            Aucune chaîne sport trouvée
                        </h3>
                        <p className="text-gray-600">
                            Les chaînes sport seront détectées automatiquement
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                        <span>⚽</span>
                        <span>Football & Sports</span>
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Suivez tous vos matchs préférés en direct
                    </p>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>{isLoading ? 'Actualisation...' : 'Actualiser'}</span>
                </button>
            </div>

            {/* Stats */}
            {sportStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-gray-600">En direct</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {sportStats.liveMatches}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">Aujourd'hui</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {sportStats.upcomingToday}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">Chaînes</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {sportStats.totalSportsChannels}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">Ligues</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {sportStats.popularLeagues.length}
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('live')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                            activeTab === 'live'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span>En direct ({liveMatches.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('today')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'today'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Aujourd'hui ({todaysMatches.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'upcoming'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        À venir ({upcomingMatches.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('channels')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'channels'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Chaînes ({sportsChannels.length})
                    </button>
                </nav>
            </div>

            {/* Sidebar Components */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    {/* Content */}
                    <div className="min-h-96">
                        {getTabContent()}
                    </div>
                </div>
                
                <div className="space-y-6">
                    {/* Favorite Teams */}
                    <FavoriteTeams 
                        matches={matches}
                        onSelectMatch={handleViewDetails}
                    />
                    
                    {/* Sports Badges */}
                    <SportsBadges />
                </div>
            </div>

            {/* Match Modal */}
            {selectedMatch && (
                <MatchModal
                    match={selectedMatch}
                    onClose={handleCloseModal}
                    onSelectChannel={onSelectChannel}
                />
            )}
        </div>
    );
};