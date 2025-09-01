import React from 'react';
import type { LiveMatch, Channel } from '../../domain/models';
import { formatMatchTime, formatMatchDate } from '../../services/footballApi';

interface MatchCardProps {
    match: LiveMatch;
    onSelectChannel: (channel: Channel) => void;
    onViewDetails: (match: LiveMatch) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
    match,
    onSelectChannel,
    onViewDetails
}) => {
    const getStatusColor = () => {
        switch (match.status) {
            case 'live':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'halftime':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'finished':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const getStatusText = () => {
        switch (match.status) {
            case 'live':
                return `${match.minute}'`;
            case 'halftime':
                return 'Mi-temps';
            case 'finished':
                return 'Terminé';
            default:
                return formatMatchTime(match.kickoffTime);
        }
    };

    const isLiveOrHalftime = match.status === 'live' || match.status === 'halftime';

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">{match.league}</span>
                        {match.competition !== match.league && (
                            <>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-gray-500">{match.competition}</span>
                            </>
                        )}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
                        {isLiveOrHalftime && match.status === 'live' && (
                            <div className="flex items-center space-x-1">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                <span>{getStatusText()}</span>
                            </div>
                        )}
                        {match.status === 'halftime' && (
                            <div className="flex items-center space-x-1">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                <span>{getStatusText()}</span>
                            </div>
                        )}
                        {match.status === 'scheduled' && getStatusText()}
                        {match.status === 'finished' && getStatusText()}
                    </div>
                </div>
                <div className="text-xs text-gray-500">
                    {formatMatchDate(match.kickoffTime)}
                </div>
            </div>

            {/* Match Details */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    {/* Home Team */}
                    <div className="flex-1 text-center">
                        <div className="text-2xl mb-1">{match.homeTeam.logo}</div>
                        <div className="font-semibold text-gray-900 text-sm truncate">
                            {match.homeTeam.name}
                        </div>
                    </div>

                    {/* Score/VS */}
                    <div className="flex-shrink-0 mx-4 text-center">
                        {match.score ? (
                            <div className="text-2xl font-bold text-gray-900">
                                {match.score.home} - {match.score.away}
                            </div>
                        ) : (
                            <div className="text-lg text-gray-500 font-medium">VS</div>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 text-center">
                        <div className="text-2xl mb-1">{match.awayTeam.logo}</div>
                        <div className="font-semibold text-gray-900 text-sm truncate">
                            {match.awayTeam.name}
                        </div>
                    </div>
                </div>

                {/* Channels */}
                {match.channels.length > 0 && (
                    <div className="mb-4">
                        <div className="text-xs text-gray-600 mb-2">
                            Disponible sur {match.channels.length} chaîne{match.channels.length > 1 ? 's' : ''} :
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {match.channels.slice(0, 3).map((channel, index) => (
                                <button
                                    key={`${channel.url}-${index}`}
                                    onClick={() => onSelectChannel(channel)}
                                    className="text-xs bg-gray-100 hover:bg-primary hover:text-white px-2 py-1 rounded transition-colors truncate max-w-24"
                                    title={channel.name}
                                >
                                    {channel.name}
                                </button>
                            ))}
                            {match.channels.length > 3 && (
                                <span className="text-xs text-gray-500 px-2 py-1">
                                    +{match.channels.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                    {isLiveOrHalftime && match.channels.length > 0 && (
                        <button
                            onClick={() => onSelectChannel(match.channels[0])}
                            className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-secondary transition-colors flex items-center justify-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a2 2 0 002 2h2a2 2 0 002-2v-4M9 10V8a2 2 0 012-2h2a2 2 0 012 2v2" />
                            </svg>
                            <span>Regarder</span>
                        </button>
                    )}
                    
                    <button
                        onClick={() => onViewDetails(match)}
                        className={`${isLiveOrHalftime && match.channels.length > 0 ? 'flex-shrink-0' : 'flex-1'} border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Détails</span>
                    </button>
                </div>
            </div>
        </div>
    );
};