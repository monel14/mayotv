export interface Channel {
    name: string;
    logo: string;
    group: string;
    url: string;
    country?: string;
    countryName?: string;
    countryFlag?: string;
    network?: string;
    quality?: string; // e.g., '720p', '1080p'
}

export interface Country {
    code: string;
    name: string;
    flag: string;
}

export interface Category {
    id: string;
    name: string;
}

export interface Language {
    code: string;
    name: string;
}

export type ChannelsByGroup = Record<string, Channel[]>;

// API Models from iptv-org
export interface ApiStream {
    channel: string | null; // This is the ID to join with other tables
    name: string;
    logo: string | null;
    url: string;
    category: string;
    height?: number; // From stream metadata
}

export interface ApiChannel {
    id: string;
    name: string;
    alt_names?: string[];
    network?: string;
    owners?: string[];
    country: string;
    subdivision?: string;
    city?: string;
    categories: string[];
    languages?: string[];
    is_nsfw: boolean;
    launched?: string;
    closed?: string;
    replaced_by?: string;
    website?: string;
}

export interface ApiLogo {
    channel: string;
    url: string;
}

// FIX: Add missing type definitions for API models to resolve import errors.
export interface ApiCategory {
    id: string;
    name: string;
}

export interface ApiCountry {
    code: string;
    name: string;
    flag: string;
}

export interface ApiLanguage {
    code: string;
    name: string;
}

export interface ApiGuideProgram {
    title: string;
    start: string;
    end: string;
}

// EPG (Electronic Program Guide) Models
export interface Program {
    id: string;
    title: string;
    description?: string;
    start: Date;
    end: Date;
    category?: string;
    channelId: string;
    isLive?: boolean;
}

export interface ChannelGuide {
    channelId: string;
    channelName: string;
    channelLogo?: string;
    programs: Program[];
}

export interface EpgData {
    channels: ChannelGuide[];
    lastUpdated: Date;
}

// Football/Sports Models
export interface Team {
    id: string;
    name: string;
    logo?: string;
    country: string;
    league: string;
}

export interface LiveMatch {
    id: string;
    homeTeam: Team;
    awayTeam: Team;
    league: string;
    competition: string;
    kickoffTime: Date;
    status: 'scheduled' | 'live' | 'halftime' | 'finished';
    score?: {
        home: number;
        away: number;
    };
    minute?: number;
    channels: Channel[];
    isLive: boolean;
}

export interface FavoriteTeam {
    id: string;
    name: string;
    logo?: string;
    league: string;
    country: string;
    nextMatch?: LiveMatch;
}

export interface SportStats {
    totalSportsChannels: number;
    liveMatches: number;
    upcomingToday: number;
    popularLeagues: string[];
    peakViewingHours: string[];
}

export interface SportBadge {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress?: number;
    target?: number;
}

export type View = 'home' | 'countries' | 'categories' | 'languages' | 'all-channels' | 'guide' | 'sports';
