import type { Program, ChannelGuide, EpgData, Channel } from '../domain/models';
import { EPG_CACHE_TTL } from '../domain/constants';

// Make TypeScript aware of the global localforage variable
declare const localforage: any;

const EPG_CACHE_KEY = 'epgDataCache';

/**
 * Generates mock EPG data for demonstration purposes
 * In a real app, this would fetch from actual EPG providers like XMLTV
 */
const generateMockEpgData = (channels: Channel[]): EpgData => {
    const now = new Date();
    const channelGuides: ChannelGuide[] = [];

    // Take first 20 channels for demo
    const sampleChannels = channels.slice(0, 20);

    const programCategories = [
        'News', 'Sports', 'Movies', 'Series', 'Documentary', 
        'Entertainment', 'Kids', 'Music', 'Reality TV', 'Talk Show'
    ];

    const samplePrograms = [
        { title: 'Morning News', duration: 60, category: 'News' },
        { title: 'Sports Center', duration: 90, category: 'Sports' },
        { title: 'Movie: Action Hero', duration: 120, category: 'Movies' },
        { title: 'Comedy Series S01E05', duration: 30, category: 'Series' },
        { title: 'Nature Documentary', duration: 60, category: 'Documentary' },
        { title: 'Game Show', duration: 45, category: 'Entertainment' },
        { title: 'Kids Cartoon Hour', duration: 60, category: 'Kids' },
        { title: 'Music Videos', duration: 30, category: 'Music' },
        { title: 'Reality Show', duration: 60, category: 'Reality TV' },
        { title: 'Late Night Talk', duration: 90, category: 'Talk Show' },
        { title: 'Evening News', duration: 30, category: 'News' },
        { title: 'Football Match', duration: 120, category: 'Sports' },
        { title: 'Drama Series', duration: 45, category: 'Series' },
        { title: 'Cooking Show', duration: 30, category: 'Entertainment' }
    ];

    sampleChannels.forEach(channel => {
        const programs: Program[] = [];
        let currentTime = new Date(now);
        currentTime.setHours(6, 0, 0, 0); // Start at 6 AM

        // Generate programs for next 18 hours
        for (let i = 0; i < 12; i++) {
            const program = samplePrograms[Math.floor(Math.random() * samplePrograms.length)];
            const startTime = new Date(currentTime);
            const endTime = new Date(currentTime.getTime() + program.duration * 60000);

            const isLive = now >= startTime && now <= endTime;

            programs.push({
                id: `${channel.name}-${i}-${Date.now()}`,
                title: program.title,
                description: `${program.title} - A great ${program.category.toLowerCase()} program on ${channel.name}`,
                start: startTime,
                end: endTime,
                category: program.category,
                channelId: channel.url, // Using URL as unique ID
                isLive
            });

            currentTime = endTime;
        }

        channelGuides.push({
            channelId: channel.url,
            channelName: channel.name,
            channelLogo: channel.logo,
            programs
        });
    });

    return {
        channels: channelGuides,
        lastUpdated: now
    };
};

/**
 * Fetches EPG data with caching
 */
export const fetchEpgData = async (channels: Channel[]): Promise<EpgData> => {
    try {
        const cachedItem: { timestamp: number, data: EpgData } | null = await localforage.getItem(EPG_CACHE_KEY);

        if (cachedItem) {
            const { timestamp, data } = cachedItem;
            if (Date.now() - timestamp < EPG_CACHE_TTL) {
                console.log("Loading EPG data from cache");
                return data;
            }
        }
    } catch (e) {
        console.error("Failed to read EPG cache", e);
    }

    console.log("Generating fresh EPG data");
    const freshData = generateMockEpgData(channels);

    try {
        const cachePayload = {
            timestamp: Date.now(),
            data: freshData,
        };
        await localforage.setItem(EPG_CACHE_KEY, cachePayload);
        console.log("EPG data cached successfully");
    } catch (e) {
        console.error("Failed to cache EPG data", e);
    }

    return freshData;
};

/**
 * Gets current program for a specific channel
 */
export const getCurrentProgram = (channelGuide: ChannelGuide): Program | null => {
    const now = new Date();
    return channelGuide.programs.find(program => 
        now >= program.start && now <= program.end
    ) || null;
};

/**
 * Gets next program for a specific channel
 */
export const getNextProgram = (channelGuide: ChannelGuide): Program | null => {
    const now = new Date();
    return channelGuide.programs.find(program => 
        program.start > now
    ) || null;
};

/**
 * Formats time for display
 */
export const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

/**
 * Formats duration in minutes
 */
export const formatDuration = (start: Date, end: Date): string => {
    const duration = Math.round((end.getTime() - start.getTime()) / 60000);
    if (duration < 60) {
        return `${duration}min`;
    }
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`;
};