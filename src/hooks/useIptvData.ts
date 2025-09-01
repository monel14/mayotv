import { useState, useEffect } from 'react';
import { fetchDirectory, fetchAndProcessFullData } from '../services/iptvApi';
import type { Channel, ChannelsByGroup, Country, Category, Language } from '../domain/models';

interface IptvDataState {
    countries: Country[];
    channelsByCountry: ChannelsByGroup;
    categories: Category[];
    channelsByCategory: ChannelsByGroup;
    languages: Language[];
    channelsByLanguage: ChannelsByGroup;
    allChannels: Channel[];
}

const initialState: IptvDataState = {
    countries: [],
    channelsByCountry: {},
    categories: [],
    channelsByCategory: {},
    languages: [],
    channelsByLanguage: {},
    allChannels: [],
};

export const useIptvData = () => {
    const [data, setData] = useState<IptvDataState>(initialState);
    const [isLoading, setIsLoading] = useState(true); // For initial directory load
    const [isSyncing, setIsSyncing] = useState(true); // For background channel processing
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Phase 1: Fetch lightweight directory data for a fast initial UI
                setIsLoading(true);
                const directoryData = await fetchDirectory();
                setData(prevData => ({ ...prevData, ...directoryData }));
                setIsLoading(false);

                // Phase 2: Fetch and process the full, heavy dataset from cache or network
                setIsSyncing(true);
                const fullData = await fetchAndProcessFullData();
                setData(fullData);
                
            } catch (e: any) {
                const errorMessage = `Failed to load IPTV data: ${e.message}`;
                setError(errorMessage);
                console.error(e);
                setIsLoading(false); // Ensure loader is turned off on error
            } finally {
                setIsSyncing(false);
            }
        };

        loadData();
    }, []);

    return { 
        ...data,
        isLoading, 
        isSyncing,
        error 
    };
};