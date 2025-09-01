import React from 'react';
import type { LiveMatch, Channel } from '../../domain/models';
import { formatMatchTime, formatMatchDate } from '../../services/footballApi';

interface MatchModalProps {
    match: LiveMatch;
    onClose: () => void;
    onSelectChannel: (channel: Channel) => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
    match,
    onClose,
    onSelectChannel
}) => {
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getStatusInfo = () => {
        switch (match.status) {
            case 'live':
                return {
                    text: `${match.minute}' - En direct`,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200'
                };
            case 'halftime':
                return {
                    text: 'Mi-temps',
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50',
                    borderColor: 'border-orange-200'
                };
            case 'finished':
                return {
                    text: 'Match terminé',
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200'
                };
            default:
                return {
                    text: `Coup d'envoi à ${formatMatchTime(match.kickoffTime)}`,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200'
                };
        }
    };

    const statusInfo = getStatusInfo();
    const isLiveOrHalftime = match.status === 'live' || match.status === 'halftime';

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleOverlayClick}
        >
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                            {match.homeTeam.name} vs {match.awayTeam.name}
                        </h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>{match.league}</span>
                            {match.competition !== match.league && (
                                <>
                                    <span>•</span>
                                    <span>{match.competition}</span>
                                </>
                            )}
                            <span>•</span>
                            <span>{formatMatchDate(match.kickoffTime)}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                        aria-label="Fermer"
                    >
                        ×
                    </button>
                </div>

                {/* Match Info */}
                <div className="p-6 space-y-6">
                    {/* Status */}
                    <div className={`p-4 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
                        <div className="flex items-center justify-center">
                            {isLiveOrHalftime && match.status === 'live' && (
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className={`font-semibold ${statusInfo.color}`}>
                                        {statusInfo.text}
                                    </span>
                                </div>
                            )}
                            {match.status !== 'live' && (
                                <span className={`font-semibold ${statusInfo.color}`}>
                                    {statusInfo.text}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Teams and Score */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            {/* Home Team */}
                            <div className="text-center flex-1">
                                <div className="text-4xl mb-2">{match.homeTeam.logo}</div>
                                <h3 className="font-bold text-lg text-gray-900 mb-1">
                                    {match.homeTeam.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {match.homeTeam.country} • {match.homeTeam.league}
                                </p>
                            </div>

                            {/* Score */}
                            <div className="text-center mx-8">
                                {match.score ? (
                                    <div className="text-4xl font-bold text-gray-900 mb-2">
                                        {match.score.home} - {match.score.away}
                                    </div>
                                ) : (
                                    <div className="text-2xl text-gray-500 font-medium mb-2">VS</div>
                                )}
                                {match.minute && (
                                    <div className="text-sm text-gray-600">
                                        {match.minute}e minute
                                    </div>
                                )}
                            </div>

                            {/* Away Team */}
                            <div className="text-center flex-1">
                                <div className="text-4xl mb-2">{match.awayTeam.logo}</div>
                                <h3 className="font-bold text-lg text-gray-900 mb-1">
                                    {match.awayTeam.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {match.awayTeam.country} • {match.awayTeam.league}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Available Channels */}
                    {match.channels.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Chaînes disponibles ({match.channels.length})
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {match.channels.map((channel, index) => (
                                    <button
                                        key={`${channel.url}-${index}`}
                                        onClick={() => onSelectChannel(channel)}
                                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
                                    >
                                        {channel.logo && (
                                            <img
                                                src={channel.logo}
                                                alt={channel.name}
                                                className="w-8 h-8 object-contain rounded"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 truncate">
                                                {channel.name}
                                            </div>
                                            <div className="text-sm text-gray-600 flex items-center space-x-2">
                                                {channel.countryFlag && (
                                                    <span>{channel.countryFlag}</span>
                                                )}
                                                <span>{channel.countryName || channel.country}</span>
                                                {channel.quality && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="font-medium">{channel.quality}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a2 2 0 002 2h2a2 2 0 002-2v-4M9 10V8a2 2 0 012-2h2a2 2 0 012 2v2" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                        {isLiveOrHalftime && match.channels.length > 0 && (
                            <button
                                onClick={() => onSelectChannel(match.channels[0])}
                                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors flex items-center justify-center space-x-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a2 2 0 002 2h2a2 2 0 002-2v-4M9 10V8a2 2 0 012-2h2a2 2 0 012 2v2" />
                                </svg>
                                <span>Regarder maintenant</span>
                            </button>
                        )}

                        {match.status === 'scheduled' && (
                            <button
                                onClick={() => {
                                    // In a real app, this would set a reminder
                                    alert(`Rappel programmé pour ${match.homeTeam.name} vs ${match.awayTeam.name}`);
                                }}
                                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Programmer un rappel</span>
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="flex-shrink-0 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};