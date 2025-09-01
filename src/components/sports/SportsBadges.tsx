import React, { useState, useEffect } from 'react';
import type { SportBadge } from '../../domain/models';
import { SPORT_BADGES } from '../../domain/constants';

// Make TypeScript aware of the global localforage variable
declare const localforage: any;

const BADGES_KEY = 'sportBadges';
const STATS_KEY = 'userSportStats';

interface UserSportStats {
    matchesWatched: number;
    earlyMatches: number;
    lateMatches: number;
    countriesWatched: Set<string>;
    leaguesWatched: Set<string>;
    weekendMatches: number;
}

export const SportsBadges: React.FC = () => {
    const [badges, setBadges] = useState<SportBadge[]>([]);
    const [userStats, setUserStats] = useState<UserSportStats>({
        matchesWatched: 0,
        earlyMatches: 0,
        lateMatches: 0,
        countriesWatched: new Set(),
        leaguesWatched: new Set(),
        weekendMatches: 0
    });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        loadBadges();
        loadUserStats();
    }, []);

    const loadBadges = async () => {
        try {
            const savedBadges = await localforage.getItem(BADGES_KEY);
            if (savedBadges) {
                setBadges(savedBadges);
            } else {
                // Initialize badges
                const initialBadges = SPORT_BADGES.map(badge => ({
                    ...badge,
                    unlocked: false,
                    progress: 0
                }));
                setBadges(initialBadges);
                await localforage.setItem(BADGES_KEY, initialBadges);
            }
        } catch (e) {
            console.error('Failed to load badges', e);
        }
    };

    const loadUserStats = async () => {
        try {
            const savedStats = await localforage.getItem(STATS_KEY);
            if (savedStats) {
                setUserStats({
                    ...savedStats,
                    countriesWatched: new Set(savedStats.countriesWatched),
                    leaguesWatched: new Set(savedStats.leaguesWatched)
                });
            }
        } catch (e) {
            console.error('Failed to load user stats', e);
        }
    };

    const updateBadgeProgress = async () => {
        const updatedBadges = badges.map(badge => {
            let progress = 0;
            let unlocked = badge.unlocked;

            switch (badge.id) {
                case 'early_bird':
                    progress = userStats.earlyMatches;
                    unlocked = progress >= (badge.target || 5);
                    break;
                case 'night_owl':
                    progress = userStats.lateMatches;
                    unlocked = progress >= (badge.target || 5);
                    break;
                case 'world_cup':
                    progress = userStats.countriesWatched.size;
                    unlocked = progress >= (badge.target || 10);
                    break;
                case 'league_expert':
                    progress = userStats.leaguesWatched.size;
                    unlocked = progress >= (badge.target || 5);
                    break;
                case 'weekend_warrior':
                    progress = userStats.weekendMatches;
                    unlocked = progress >= (badge.target || 20);
                    break;
                case 'champion':
                    progress = userStats.matchesWatched;
                    unlocked = progress >= (badge.target || 100);
                    break;
            }

            return { ...badge, progress, unlocked };
        });

        setBadges(updatedBadges);
        await localforage.setItem(BADGES_KEY, updatedBadges);
    };

    useEffect(() => {
        updateBadgeProgress();
    }, [userStats]);

    const unlockedBadges = badges.filter(badge => badge.unlocked);
    const inProgressBadges = badges.filter(badge => !badge.unlocked && badge.progress > 0);

    if (badges.length === 0) return null;

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                        <h3 className="font-semibold text-gray-900">Badges Sport</h3>
                        <p className="text-sm text-gray-600">
                            {unlockedBadges.length} débloqué{unlockedBadges.length > 1 ? 's' : ''} sur {badges.length}
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
                    {/* Unlocked Badges */}
                    {unlockedBadges.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Débloqués</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {unlockedBadges.map(badge => (
                                    <div key={badge.id} className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="text-2xl mb-1">{badge.icon}</div>
                                        <div className="text-xs font-medium text-green-800">{badge.name}</div>
                                        <div className="text-xs text-green-600 mt-1">{badge.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* In Progress Badges */}
                    {inProgressBadges.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">En cours</h4>
                            <div className="space-y-3">
                                {inProgressBadges.map(badge => (
                                    <div key={badge.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center space-x-3">
                                            <div className="text-xl">{badge.icon}</div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-blue-800">{badge.name}</div>
                                                <div className="text-xs text-blue-600">{badge.description}</div>
                                                <div className="mt-2">
                                                    <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
                                                        <span>Progression</span>
                                                        <span>{badge.progress}/{badge.target}</span>
                                                    </div>
                                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                                        <div 
                                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${Math.min(100, (badge.progress / (badge.target || 1)) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Locked Badges */}
                    {badges.filter(badge => !badge.unlocked && badge.progress === 0).length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">À débloquer</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {badges.filter(badge => !badge.unlocked && badge.progress === 0).map(badge => (
                                    <div key={badge.id} className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
                                        <div className="text-2xl mb-1 grayscale">{badge.icon}</div>
                                        <div className="text-xs font-medium text-gray-600">{badge.name}</div>
                                        <div className="text-xs text-gray-500 mt-1">{badge.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};