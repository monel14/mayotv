import { useState, useEffect } from 'react';
import { fetchFootballData, getSportsChannels, getSportStats } from '../services/footballApi';
import type { LiveMatch, SportStats, Channel } from '../domain/models';

export const useFootballData = (channels: Channel[]) => {
    const [matches, setMatches] = useState<LiveMatch[]>([]);
    const [sportsChannels, setSportsChannels] = useState<Channel[]>([]);
    const [sportStats, setSportStats] = useState<SportStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (channels.length === 0) return;

        const loadFootballData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Get sports channels
                const sportsChannelsList = getSportsChannels(channels);
                setSportsChannels(sportsChannelsList);

                // Fetch football matches
                const matchesData = await fetchFootballData(sportsChannelsList);
                setMatches(matchesData);

                // Calculate stats
                const stats = getSportStats(channels, matchesData);
                setSportStats(stats);

            } catch (e: any) {
                setError(`Failed to load football data: ${e.message}`);
                console.error('Football data loading error:', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadFootballData();
    }, [channels]);

    const refreshFootballData = async () => {
        if (channels.length === 0) return;
        
        try {
            setIsLoading(true);
            setError(null);

            const sportsChannelsList = getSportsChannels(channels);
            const matchesData = await fetchFootballData(sportsChannelsList);
            setMatches(matchesData);

            const stats = getSportStats(channels, matchesData);
            setSportStats(stats);

        } catch (e: any) {
            setError(`Failed to refresh football data: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        matches,
        sportsChannels,
        sportStats,
        isLoading,
        error,
        refreshFootballData
    };
};