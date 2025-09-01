import React from 'react';
import type { LiveMatch, SportStats } from '../../domain/models';
import { getLiveMatches, getTodaysMatches, formatMatchTime } from '../../services/footballApi';

interface SportsHighlightProps {
    matches: LiveMatch[];
    sportStats: SportStats | null;
    onViewSports: () => void;
}

export const SportsHighlight: React.FC<SportsHighlightProps> = ({
    matches,
    sportStats,
    onViewSports
}) => {
    const liveMatches = getLiveMatches(matches);
    const todaysMatches = getTodaysMatches(matches);
    const upcomingToday = todaysMatches.filter(m => m.status === 'scheduled');

    if (!sportStats || matches.length === 0) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-green-500 via-blue-600 to-purple-600 text-white rounded-xl p-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 text-6xl">⚽</div>
                <div className="absolute bottom-4 left-4 text-4xl">🏆</div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-5">⚽</div>
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="text-2xl">⚽</span>
                            <h3 className="text-xl font-bold">Football Live</h3>
                            {liveMatches.length > 0 && (
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium">LIVE</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-1 text-sm text-white/90">
                            <p>
                                {liveMatches.length > 0 
                                    ? `${liveMatches.length} match${liveMatches.length > 1 ? 's' : ''} en cours`
                                    : 'Aucun match en cours'
                                }
                            </p>
                            <p>
                                {upcomingToday.length} match{upcomingToday.length > 1 ? 's' : ''} à venir aujourd'hui
                            </p>
                            <p>{sportStats.totalSportsChannels} chaînes sport disponibles</p>
                        </div>
                    </div>
                    <button
                        onClick={onViewSports}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                    >
                        <span>Voir tout</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Live Matches Preview */}
                {liveMatches.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-white/80 mb-2">Matchs en direct :</h4>
                        {liveMatches.slice(0, 2).map((match) => (
                            <div key={match.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-center">
                                            <div className="flex items-center space-x-2 text-sm font-medium">
                                                <span>{match.homeTeam.logo}</span>
                                                <span className="truncate max-w-20">{match.homeTeam.name}</span>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            {match.score ? (
                                                <div className="text-lg font-bold">
                                                    {match.score.home} - {match.score.away}
                                                </div>
                                            ) : (
                                                <div className="text-sm">vs</div>
                                            )}
                                            {match.minute && (
                                                <div className="text-xs text-white/70">{match.minute}'</div>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center space-x-2 text-sm font-medium">
                                                <span className="truncate max-w-20">{match.awayTeam.name}</span>
                                                <span>{match.awayTeam.logo}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-white/70">
                                        {match.league}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {liveMatches.length > 2 && (
                            <div className="text-center text-sm text-white/70">
                                +{liveMatches.length - 2} autre{liveMatches.length - 2 > 1 ? 's' : ''} match{liveMatches.length - 2 > 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                )}

                {/* Next Matches Preview */}
                {liveMatches.length === 0 && upcomingToday.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-white/80 mb-2">Prochains matchs :</h4>
                        {upcomingToday.slice(0, 2).map((match) => (
                            <div key={match.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-center">
                                            <div className="flex items-center space-x-2 text-sm font-medium">
                                                <span>{match.homeTeam.logo}</span>
                                                <span className="truncate max-w-20">{match.homeTeam.name}</span>
                                            </div>
                                        </div>
                                        <div className="text-center text-sm">vs</div>
                                        <div className="text-center">
                                            <div className="flex items-center space-x-2 text-sm font-medium">
                                                <span className="truncate max-w-20">{match.awayTeam.name}</span>
                                                <span>{match.awayTeam.logo}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium">
                                            {formatMatchTime(match.kickoffTime)}
                                        </div>
                                        <div className="text-xs text-white/70">
                                            {match.league}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};