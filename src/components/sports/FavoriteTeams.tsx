import React, { useState, useEffect } from 'react';
import type { Team, LiveMatch } from '../../domain/models';
import { getFavoriteTeams, saveFavoriteTeams, getFavoriteTeamMatches } from '../../services/footballApi';

interface FavoriteTeamsProps {
    matches: LiveMatch[];
    onSelectMatch: (match: LiveMatch) => void;
}

export const FavoriteTeams: React.FC<FavoriteTeamsProps> = ({ matches, onSelectMatch }) => {
    const [favoriteTeams, setFavoriteTeams] = useState<Team[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [isAddingTeam, setIsAddingTeam] = useState(false);

    useEffect(() => {
        loadFavoriteTeams();
    }, []);

    const loadFavoriteTeams = async () => {
        const teams = await getFavoriteTeams();
        setFavoriteTeams(teams);
    };

    const addFavoriteTeam = async (team: Team) => {
        if (!favoriteTeams.find(t => t.id === team.id)) {
            const updatedTeams = [...favoriteTeams, team];
            setFavoriteTeams(updatedTeams);
            await saveFavoriteTeams(updatedTeams);
        }
        setIsAddingTeam(false);
    };

    const removeFavoriteTeam = async (teamId: string) => {
        const updatedTeams = favoriteTeams.filter(t => t.id !== teamId);
        setFavoriteTeams(updatedTeams);
        await saveFavoriteTeams(updatedTeams);
    };

    const favoriteMatches = getFavoriteTeamMatches(matches, favoriteTeams);
    const upcomingFavoriteMatches = favoriteMatches.filter(m => m.status === 'scheduled').slice(0, 3);
    const liveFavoriteMatches = favoriteMatches.filter(m => m.status === 'live' || m.status === 'halftime');

    // Get all unique teams from matches for selection
    const allTeams = Array.from(
        new Map(
            matches.flatMap(match => [match.homeTeam, match.awayTeam])
                .map(team => [team.id, team])
        ).values()
    ).sort((a, b) => a.name.localeCompare(b.name));

    const availableTeams = allTeams.filter(team => 
        !favoriteTeams.find(fav => fav.id === team.id)
    );

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">⭐</span>
                    <div>
                        <h3 className="font-semibold text-gray-900">Équipes Favorites</h3>
                        <p className="text-sm text-gray-600">
                            {favoriteTeams.length} équipe{favoriteTeams.length > 1 ? 's' : ''} suivie{favoriteTeams.length > 1 ? 's' : ''}
                            {liveFavoriteMatches.length > 0 && (
                                <span className="ml-2 text-red-600 font-medium">
                                    • {liveFavoriteMatches.length} en direct
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 text-gray-400 transition-transform ${isVisible ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isVisible && (
                <div className="p-4 border-t border-gray-200 space-y-4">
                    {/* Live Matches */}
                    {liveFavoriteMatches.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-red-600 mb-2 flex items-center space-x-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span>Matchs en direct</span>
                            </h4>
                            <div className="space-y-2">
                                {liveFavoriteMatches.map(match => (
                                    <button
                                        key={match.id}
                                        onClick={() => onSelectMatch(match)}
                                        className="w-full p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <span>{match.homeTeam.logo}</span>
                                                <span className="font-medium text-sm">{match.homeTeam.name}</span>
                                                <span className="text-xs text-gray-500">vs</span>
                                                <span className="font-medium text-sm">{match.awayTeam.name}</span>
                                                <span>{match.awayTeam.logo}</span>
                                            </div>
                                            <div className="text-right">
                                                {match.score && (
                                                    <div className="font-bold text-red-600">
                                                        {match.score.home}-{match.score.away}
                                                    </div>
                                                )}
                                                <div className="text-xs text-red-600">
                                                    {match.minute}'
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upcoming Matches */}
                    {upcomingFavoriteMatches.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Prochains matchs</h4>
                            <div className="space-y-2">
                                {upcomingFavoriteMatches.map(match => (
                                    <button
                                        key={match.id}
                                        onClick={() => onSelectMatch(match)}
                                        className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <span>{match.homeTeam.logo}</span>
                                                <span className="font-medium text-sm">{match.homeTeam.name}</span>
                                                <span className="text-xs text-gray-500">vs</span>
                                                <span className="font-medium text-sm">{match.awayTeam.name}</span>
                                                <span>{match.awayTeam.logo}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-blue-600">
                                                    {match.kickoffTime.toLocaleDateString('fr-FR', { 
                                                        weekday: 'short', 
                                                        day: 'numeric', 
                                                        month: 'short' 
                                                    })}
                                                </div>
                                                <div className="text-xs text-blue-600">
                                                    {match.kickoffTime.toLocaleTimeString('fr-FR', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Favorite Teams List */}
                    {favoriteTeams.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Mes équipes</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {favoriteTeams.map(team => (
                                    <div key={team.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg">{team.logo}</span>
                                            <div>
                                                <div className="text-sm font-medium">{team.name}</div>
                                                <div className="text-xs text-gray-500">{team.league}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFavoriteTeam(team.id)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            title="Retirer des favoris"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add Team */}
                    <div>
                        {!isAddingTeam ? (
                            <button
                                onClick={() => setIsAddingTeam(true)}
                                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-colors flex items-center justify-center space-x-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Ajouter une équipe</span>
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded">
                                    {availableTeams.map(team => (
                                        <button
                                            key={team.id}
                                            onClick={() => addFavoriteTeam(team)}
                                            className="w-full p-2 text-left hover:bg-gray-50 flex items-center space-x-2 border-b border-gray-100 last:border-b-0"
                                        >
                                            <span className="text-lg">{team.logo}</span>
                                            <div>
                                                <div className="text-sm font-medium">{team.name}</div>
                                                <div className="text-xs text-gray-500">{team.league}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setIsAddingTeam(false)}
                                    className="w-full p-2 text-sm text-gray-600 hover:text-gray-800"
                                >
                                    Annuler
                                </button>
                            </div>
                        )}
                    </div>

                    {favoriteTeams.length === 0 && !isAddingTeam && (
                        <div className="text-center py-6 text-gray-500">
                            <div className="text-4xl mb-2">⭐</div>
                            <p className="text-sm">Aucune équipe favorite</p>
                            <p className="text-xs">Ajoutez vos équipes préférées pour suivre leurs matchs</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};