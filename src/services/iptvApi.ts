import { 
    STREAMS_JSON_URL, 
    CHANNELS_JSON_URL, 
    LOGOS_JSON_URL, 
    COUNTRIES_JSON_URL,
    CATEGORIES_JSON_URL,
    LANGUAGES_JSON_URL,
    FALLBACK_URLS
} from '../domain/constants';
import type { 
    Channel, 
    ChannelsByGroup, 
    ApiStream, 
    ApiChannel, 
    ApiLogo, 
    Country, 
    ApiCountry, 
    Category,
    ApiCategory,
    Language,
    ApiLanguage
} from '../domain/models';

// Make TypeScript aware of the global localforage variable
declare const localforage: any;

// Cache configuration
const CACHE_KEY = 'iptvDataCache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const fetchJson = async <T>(url: string, resourceName: string, fallbackUrls?: string[]): Promise<T> => {
    const urlsToTry = [url, ...(fallbackUrls || [])];
    
    for (let i = 0; i < urlsToTry.length; i++) {
        try {
            console.log(`Attempting to fetch ${resourceName} from: ${urlsToTry[i]}`);
            const response = await fetch(urlsToTry[i]);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            console.log(`Successfully fetched ${resourceName} from ${i === 0 ? 'direct URL' : `fallback ${i}`}`);
            return data;
        } catch (error) {
            console.warn(`Failed to fetch ${resourceName} from ${urlsToTry[i]}:`, error);
            if (i === urlsToTry.length - 1) {
                throw new Error(`Failed to fetch ${resourceName} from all available sources. Last error: ${error}`);
            }
        }
    }
    
    throw new Error(`Failed to fetch ${resourceName} from all sources`);
}

/**
 * Derives a quality label from stream height.
 */
const getQualityLabel = (height?: number): string | undefined => {
    if (!height || height < 240) return undefined;
    return `${height}p`;
};

/**
 * Fetches only the lightweight directory data for a fast initial UI load.
 * This data is not cached as it's very small.
 */
export const fetchDirectory = async () => {
    const [countriesData, categoriesData, languagesData] = await Promise.all([
        fetchJson<ApiCountry[]>(COUNTRIES_JSON_URL, 'countries', FALLBACK_URLS.countries),
        fetchJson<ApiCategory[]>(CATEGORIES_JSON_URL, 'categories', FALLBACK_URLS.categories),
        fetchJson<ApiLanguage[]>(LANGUAGES_JSON_URL, 'languages', FALLBACK_URLS.languages)
    ]);

    const countries: Country[] = countriesData
        .map(c => ({ code: c.code, name: c.name, flag: c.flag }))
        .sort((a, b) => a.name.localeCompare(b.name));
        
    const categories: Category[] = categoriesData
        .sort((a, b) => a.name.localeCompare(b.name));
        
    const languages: Language[] = languagesData
        .sort((a, b) => a.name.localeCompare(b.name));

    return { countries, categories, languages };
};

/**
 * Fetches all raw data from the APIs and processes it into a structured format.
 * This function performs the heavy lifting and its result should be cached.
 */
const fetchAndProcessFreshData = async () => {
    const [
        streams, 
        channelsData, 
        logosData, 
        countriesData, 
        categoriesData, 
        languagesData
    ] = await Promise.all([
        fetchJson<ApiStream[]>(STREAMS_JSON_URL, 'streams', FALLBACK_URLS.streams),
        fetchJson<ApiChannel[]>(CHANNELS_JSON_URL, 'channels', FALLBACK_URLS.channels),
        fetchJson<ApiLogo[]>(LOGOS_JSON_URL, 'logos', FALLBACK_URLS.logos),
        fetchJson<ApiCountry[]>(COUNTRIES_JSON_URL, 'countries', FALLBACK_URLS.countries),
        fetchJson<ApiCategory[]>(CATEGORIES_JSON_URL, 'categories', FALLBACK_URLS.categories),
        fetchJson<ApiLanguage[]>(LANGUAGES_JSON_URL, 'languages', FALLBACK_URLS.languages)
    ]);
    
    // Create lookup maps for efficient data access
    const channelsMap = new Map<string, ApiChannel>(channelsData.map(c => [c.id, c]));
    const logosMap = new Map<string, string>(logosData.map(l => [l.channel, l.url]));
    const countriesMap = new Map<string, ApiCountry>(countriesData.map(c => [c.code, c]));
    const categoriesMap = new Map<string, ApiCategory>(categoriesData.map(c => [c.id, c]));
    const languagesMap = new Map<string, ApiLanguage>(languagesData.map(l => [l.code, l]));

    const channelsByCountry: ChannelsByGroup = {};
    const channelsByCategory: ChannelsByGroup = {};
    const channelsByLanguage: ChannelsByGroup = {};
    const allChannelsMap = new Map<string, Channel>();

    for (const stream of streams) {
        if (!stream.url || !stream.channel) {
            continue;
        }

        const channelInfo = channelsMap.get(stream.channel);
        const countryInfo = countriesMap.get(channelInfo?.country || '');
        
        const channel: Channel = {
            name: channelInfo?.name || stream.name || 'Unknown Channel',
            logo: logosMap.get(stream.channel) || stream.logo || '',
            group: channelInfo?.country || 'ZZ',
            url: stream.url,
            country: channelInfo?.country,
            countryName: countryInfo?.name,
            countryFlag: countryInfo?.flag,
            network: channelInfo?.network,
            quality: getQualityLabel(stream.height),
        };

        // Avoid duplicate channels based on URL
        if (allChannelsMap.has(channel.url)) continue;
        allChannelsMap.set(channel.url, channel);
        
        // Populate by Country
        const countryCode = channelInfo?.country || 'ZZ';
        if (!channelsByCountry[countryCode]) channelsByCountry[countryCode] = [];
        channelsByCountry[countryCode].push(channel);

        // Populate by Category
        channelInfo?.categories?.forEach(catId => {
            if (categoriesMap.has(catId)) {
                if (!channelsByCategory[catId]) channelsByCategory[catId] = [];
                channelsByCategory[catId].push(channel);
            }
        });

        // Populate by Language
        channelInfo?.languages?.forEach(langCode => {
            if (languagesMap.has(langCode)) {
                if (!channelsByLanguage[langCode]) channelsByLanguage[langCode] = [];
                channelsByLanguage[langCode].push(channel);
            }
        });
    }
    
    // Process and sort Countries, filtering for those with channels
    const countries: Country[] = Object.keys(channelsByCountry).map(code => {
        const countryData = countriesMap.get(code);
        return {
            code: code,
            name: countryData?.name || (code === 'ZZ' ? 'Unknown' : code),
            flag: countryData?.flag || '🏴'
        };
    }).sort((a, b) => a.name.localeCompare(b.name));

    const unknownIndex = countries.findIndex(c => c.code === 'ZZ');
    if (unknownIndex > -1) {
        const unknownCountry = countries.splice(unknownIndex, 1)[0];
        countries.push(unknownCountry);
    }
    
    // Process and sort Categories, filtering for those with channels
    const categories: Category[] = Object.keys(channelsByCategory).map(id => ({
        id: id,
        name: categoriesMap.get(id)?.name || id,
    })).sort((a, b) => a.name.localeCompare(b.name));
    
    // Process and sort Languages, filtering for those with channels
    const languages: Language[] = Object.keys(channelsByLanguage).map(code => ({
        code: code,
        name: languagesMap.get(code)?.name || code,
    })).sort((a, b) => a.name.localeCompare(b.name));

    const allChannels = Array.from(allChannelsMap.values());

    return { 
        countries, channelsByCountry, 
        categories, channelsByCategory,
        languages, channelsByLanguage,
        allChannels
    };
};

/**
 * Main data fetching function with a caching layer using localforage (IndexedDB).
 * It first attempts to load data from the cache. If the cache is missing or stale,
 * it fetches fresh data from the APIs, processes it, and updates the cache.
 */
// Demo data as fallback
const getDemoData = () => {
    const demoChannels: Channel[] = [
        {
            name: "France 24",
            logo: "https://upload.wikimedia.org/wikipedia/commons/8/8a/France24.png",
            group: "FR",
            url: "https://static.france24.com/live/F24_FR_HI_HLS/live_web.m3u8",
            country: "FR",
            countryName: "France",
            countryFlag: "🇫🇷",
            network: "France Médias Monde"
        },
        {
            name: "BBC World News",
            logo: "https://upload.wikimedia.org/wikipedia/commons/7/75/BBC_News_2019.svg",
            group: "GB",
            url: "https://vs-hls-push-ww-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_news_channel_hd/t=3840/v=pv14/b=5070016/main.m3u8",
            country: "GB",
            countryName: "United Kingdom",
            countryFlag: "🇬🇧",
            network: "BBC"
        },
        {
            name: "CNN International",
            logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN.svg",
            group: "US",
            url: "https://cnn-cnninternational-1-eu.rakuten.wurl.tv/playlist.m3u8",
            country: "US",
            countryName: "United States",
            countryFlag: "🇺🇸",
            network: "CNN"
        }
    ];

    const countries: Country[] = [
        { code: "FR", name: "France", flag: "🇫🇷" },
        { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
        { code: "US", name: "United States", flag: "🇺🇸" }
    ];

    const categories: Category[] = [
        { id: "news", name: "Actualités" },
        { id: "entertainment", name: "Divertissement" },
        { id: "sports", name: "Sports" }
    ];

    const languages: Language[] = [
        { code: "fr", name: "Français" },
        { code: "en", name: "English" },
        { code: "es", name: "Español" }
    ];

    return {
        countries,
        channelsByCountry: {
            "FR": [demoChannels[0]],
            "GB": [demoChannels[1]],
            "US": [demoChannels[2]]
        },
        categories,
        channelsByCategory: {
            "news": demoChannels
        },
        languages,
        channelsByLanguage: {
            "fr": [demoChannels[0]],
            "en": [demoChannels[1], demoChannels[2]]
        },
        allChannels: demoChannels
    };
};

export const fetchAndProcessFullData = async () => {
    try {
        const cachedItem: { timestamp: number, data: any } | null = await localforage.getItem(CACHE_KEY);

        if (cachedItem) {
            const { timestamp, data } = cachedItem;
            if (Date.now() - timestamp < CACHE_TTL) {
                console.log("Loading full dataset from valid cache (IndexedDB).");
                return data;
            }
            console.log("Cache is stale. Fetching fresh full dataset.");
        }
    } catch (e) {
        console.error("Failed to read from localforage. Fetching fresh full dataset.", e);
    }

    try {
        console.log("Fetching fresh full dataset from IPTV-org API.");
        const freshData = await fetchAndProcessFreshData();

        try {
            const cachePayload = {
                timestamp: Date.now(),
                data: freshData,
            };
            await localforage.setItem(CACHE_KEY, cachePayload);
            console.log("Successfully cached fresh full dataset to IndexedDB.");
        } catch (e) {
            console.error("Failed to save full dataset to IndexedDB.", e);
        }

        return freshData;
    } catch (error) {
        console.error("Failed to fetch data from all sources, using demo data:", error);
        return getDemoData();
    }
};