import { useState, useEffect } from 'react';
import { fetchEpgData } from '../services/epgApi';
import type { EpgData, Channel } from '../domain/models';

export const useEpgData = (channels: Channel[]) => {
    const [epgData, setEpgData] = useState<EpgData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (channels.length === 0) return;

        const loadEpgData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await fetchEpgData(channels);
                setEpgData(data);
            } catch (e: any) {
                setError(`Failed to load EPG data: ${e.message}`);
                console.error('EPG loading error:', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadEpgData();
    }, [channels]);

    const refreshEpgData = async () => {
        if (channels.length === 0) return;
        
        try {
            setIsLoading(true);
            setError(null);
            const data = await fetchEpgData(channels);
            setEpgData(data);
        } catch (e: any) {
            setError(`Failed to refresh EPG data: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        epgData,
        isLoading,
        error,
        refreshEpgData
    };
};