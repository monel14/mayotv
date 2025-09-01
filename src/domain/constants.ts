// Base URLs for IPTV-org API
const rawStreamsJsonUrl = 'https://iptv-org.github.io/api/streams.json';
const rawChannelsJsonUrl = 'https://iptv-org.github.io/api/channels.json';
const rawLogosJsonUrl = 'https://iptv-org.github.io/api/logos.json';
const rawCountriesJsonUrl = 'https://iptv-org.github.io/api/countries.json';
const rawCategoriesJsonUrl = 'https://iptv-org.github.io/api/categories.json';
const rawLanguagesJsonUrl = 'https://iptv-org.github.io/api/languages.json';

// Multiple CORS proxies for fallback
const PROXIES = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
];

// Try direct access first (works in development), then fallback to proxies
export const STREAMS_JSON_URL = rawStreamsJsonUrl;
export const CHANNELS_JSON_URL = rawChannelsJsonUrl;
export const LOGOS_JSON_URL = rawLogosJsonUrl;
export const COUNTRIES_JSON_URL = rawCountriesJsonUrl;
export const CATEGORIES_JSON_URL = rawCategoriesJsonUrl;
export const LANGUAGES_JSON_URL = rawLanguagesJsonUrl;

// Fallback URLs with proxies
export const FALLBACK_URLS = {
    streams: PROXIES.map(proxy => `${proxy}${encodeURIComponent(rawStreamsJsonUrl)}`),
    channels: PROXIES.map(proxy => `${proxy}${encodeURIComponent(rawChannelsJsonUrl)}`),
    logos: PROXIES.map(proxy => `${proxy}${encodeURIComponent(rawLogosJsonUrl)}`),
    countries: PROXIES.map(proxy => `${proxy}${encodeURIComponent(rawCountriesJsonUrl)}`),
    categories: PROXIES.map(proxy => `${proxy}${encodeURIComponent(rawCategoriesJsonUrl)}`),
    languages: PROXIES.map(proxy => `${proxy}${encodeURIComponent(rawLanguagesJsonUrl)}`),
};

// EPG API URLs (using a mock service for demo - in real app you'd use real EPG providers)
const rawEpgJsonUrl = 'https://iptv-org.github.io/epg/guides.xml';
export const EPG_JSON_URL = `${PROXIES[0]}${encodeURIComponent(rawEpgJsonUrl)}`;

// Time constants for EPG
export const EPG_CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours
export const EPG_TIME_SLOTS = [
    '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
    '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
];

// Sports constants
export const SPORTS_KEYWORDS = [
    'sport', 'football', 'soccer', 'espn', 'eurosport',
    'bein', 'sky sports', 'fox sports', 'canal+',
    'rmc sport', 'l\'équipe', 'foot+', 'sports',
    'fifa', 'uefa', 'premier league', 'la liga',
    'serie a', 'bundesliga', 'ligue 1', 'champions league'
];

export const FOOTBALL_LEAGUES = {
    'Premier League': { country: 'GB', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#3d195b' },
    'La Liga': { country: 'ES', flag: '🇪🇸', color: '#ff6b35' },
    'Serie A': { country: 'IT', flag: '🇮🇹', color: '#0066cc' },
    'Bundesliga': { country: 'DE', flag: '🇩🇪', color: '#d20515' },
    'Ligue 1': { country: 'FR', flag: '🇫🇷', color: '#1e3a8a' },
    'Champions League': { country: 'EU', flag: '🏆', color: '#0066b2' },
    'Europa League': { country: 'EU', flag: '🥈', color: '#ff8c00' }
};

export const SPORT_BADGES = [
    { id: 'early_bird', name: 'Lève-tôt', desc: 'Regarder 5 matchs avant 10h', icon: '🌅', target: 5 },
    { id: 'night_owl', name: 'Couche-tard', desc: 'Regarder 5 matchs après 22h', icon: '🦉', target: 5 },
    { id: 'world_cup', name: 'Fan mondial', desc: 'Regarder 10 pays différents', icon: '🌍', target: 10 },
    { id: 'league_expert', name: 'Expert ligues', desc: 'Suivre 5 ligues différentes', icon: '🏆', target: 5 },
    { id: 'weekend_warrior', name: 'Guerrier du weekend', desc: 'Regarder 20 matchs le weekend', icon: '⚔️', target: 20 },
    { id: 'champion', name: 'Champion', desc: 'Regarder 100 matchs au total', icon: '👑', target: 100 }
];

// Football API (using free tier)
export const FOOTBALL_API_URL = 'https://api.football-data.org/v4/';
export const FOOTBALL_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
