import type { LiveMatch, Team, SportStats, Channel } from '../domain/models';
import { FOOTBALL_LEAGUES, FOOTBALL_CACHE_TTL, SPORTS_KEYWORDS } from '../domain/constants';

// Make TypeScript aware of the global localforage variable
declare const localforage: any;

const FOOTBALL_CACHE_KEY = 'footballDataCache';
const FAVORITES_KEY = 'favoriteTeams';
const SPORT_STATS_KEY = 'sportStats';

/**
 * Filters channels to find sports-related ones
 */
export const getSportsChannels = (channels: Channel[]): Channel[] => {
    return channels.filter(channel => {
        const name = channel.name.toLowerCase();
        const group = channel.group?.toLowerCase() || '';
        
        return SPORTS_KEYWORDS.some(keyword => 
            name.includes(keyword.toLowerCase()) || 
            group.includes(keyword.toLowerCase())
        );
    });
};

/**
 * Filters sports channels to find football-specific ones
 */
export const getFootballChannels = (sportsChannels: Channel[]): Channel[] => {
    const footballKeywords = ['football', 'soccer', 'foot+', 'premier', 'liga', 'serie', 'bundesliga', 'ligue', 'champions', 'uefa', 'fifa'];
    
    return sportsChannels.filter(channel => {
        const name = channel.name.toLowerCase();
        return footballKeywords.some(keyword => name.includes(keyword));
    });
};

/**
 * Generates mock football matches for demonstration
 */
const generateMockMatches = (): LiveMatch[] => {
    const teams: Team[] = [
        { id: '1', name: 'Manchester United', country: 'GB', league: 'Premier League', logo: '🔴' },
        { id: '2', name: 'Liverpool', country: 'GB', league: 'Premier League', logo: '🔴' },
        { id: '3', name: 'Real Madrid', country: 'ES', league: 'La Liga', logo: '⚪' },
        { id: '4', name: 'Barcelona', country: 'ES', league: 'La Liga', logo: '🔵' },
        { id: '5', name: 'Juventus', country: 'IT', league: 'Serie A', logo: '⚫' },
        { id: '6', name: 'AC Milan', country: 'IT', league: 'Serie A', logo: '🔴' },
        { id: '7', name: 'Bayern Munich', country: 'DE', league: 'Bundesliga', logo: '🔴' },
        { id: '8', name: 'Borussia Dortmund', country: 'DE', league: 'Bundesliga', logo: '🟡' },
        { id: '9', name: 'PSG', country: 'FR', league: 'Ligue 1', logo: '🔵' },
        { id: '10', name: 'Marseille', country: 'FR', league: 'Ligue 1', logo: '⚪' },
        { id: '11', name: 'Chelsea', country: 'GB', league: 'Premier League', logo: '🔵' },
        { id: '12', name: 'Arsenal', country: 'GB', league: 'Premier League', logo: '🔴' }
    ];

    const competitions = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions League'];
    const matches: LiveMatch[] = [];
    const now = new Date();

    // Generate matches for today and next few days
    for (let day = 0; day < 7; day++) {
        const matchDate = new Date(now);
        matchDate.setDate(now.getDate() + day);
        
        // 2-4 matches per day
        const matchesPerDay = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < matchesPerDay; i++) {
            const homeTeam = teams[Math.floor(Math.random() * teams.length)];
            let awayTeam = teams[Math.floor(Math.random() * teams.length)];
            
            // Ensure different teams
            while (awayTeam.id === homeTeam.id) {
                awayTeam = teams[Math.floor(Math.random() * teams.length)];
            }

            const competition = competitions[Math.floor(Math.random() * competitions.length)];
            const league = homeTeam.league === awayTeam.league ? homeTeam.league : competition;

            // Set match time
            const matchTime = new Date(matchDate);
            matchTime.setHours(14 + i * 2, Math.floor(Math.random() * 60), 0, 0);

            // Determine status
            let status: LiveMatch['status'] = 'scheduled';
            let score = undefined;
            let minute = undefined;
            let isLive = false;

            if (day === 0) { // Today's matches
                const timeDiff = matchTime.getTime() - now.getTime();
                if (timeDiff < 0 && timeDiff > -2 * 60 * 60 * 1000) { // Started within last 2 hours
                    const random = Math.random();
                    if (random < 0.3) {
                        status = 'live';
                        isLive = true;
                        minute = Math.floor(Math.random() * 90) + 1;
                        score = {
                            home: Math.floor(Math.random() * 4),
                            away: Math.floor(Math.random() * 4)
                        };
                    } else if (random < 0.4) {
                        status = 'halftime';
                        minute = 45;
                        score = {
                            home: Math.floor(Math.random() * 3),
                            away: Math.floor(Math.random() * 3)
                        };
                    } else if (random < 0.6) {
                        status = 'finished';
                        score = {
                            home: Math.floor(Math.random() * 4),
                            away: Math.floor(Math.random() * 4)
                        };
                    }
                }
            }

            matches.push({
                id: `match-${day}-${i}`,
                homeTeam,
                awayTeam,
                league,
                competition,
                kickoffTime: matchTime,
                status,
                score,
                minute,
                channels: [], // Will be populated with relevant sports channels
                isLive
            });
        }
    }

    return matches.sort((a, b) => a.kickoffTime.getTime() - b.kickoffTime.getTime());
};

/**
 * Fetches football data with caching
 */
export const fetchFootballData = async (sportsChannels: Channel[]): Promise<LiveMatch[]> => {
    try {
        const cachedItem: { timestamp: number, data: LiveMatch[] } | null = await localforage.getItem(FOOTBALL_CACHE_KEY);

        if (cachedItem) {
            const { timestamp, data } = cachedItem;
            if (Date.now() - timestamp < FOOTBALL_CACHE_TTL) {
                console.log("Loading football data from cache");
                return data.map(match => ({
                    ...match,
                    channels: getRelevantChannels(match, sportsChannels)
                }));
            }
        }
    } catch (e) {
        console.error("Failed to read football cache", e);
    }

    console.log("Generating fresh football data");
    const freshData = generateMockMatches();

    // Add relevant channels to each match
    const dataWithChannels = freshData.map(match => ({
        ...match,
        channels: getRelevantChannels(match, sportsChannels)
    }));

    try {
        const cachePayload = {
            timestamp: Date.now(),
            data: dataWithChannels,
        };
        await localforage.setItem(FOOTBALL_CACHE_KEY, cachePayload);
        console.log("Football data cached successfully");
    } catch (e) {
        console.error("Failed to cache football data", e);
    }

    return dataWithChannels;
};

/**
 * Gets relevant channels for a match based on league and teams
 */
const getRelevantChannels = (match: LiveMatch, sportsChannels: Channel[]): Channel[] => {
    const relevantChannels = sportsChannels.filter(channel => {
        const name = channel.name.toLowerCase();
        const league = match.league.toLowerCase();
        
        // Check if channel name contains league or team names
        return name.includes(league) || 
               name.includes(match.homeTeam.name.toLowerCase()) ||
               name.includes(match.awayTeam.name.toLowerCase()) ||
               name.includes('sport') ||
               name.includes('football') ||
               name.includes('soccer');
    });

    // If no specific channels found, return general sports channels
    if (relevantChannels.length === 0) {
        return sportsChannels.slice(0, 3); // Return first 3 sports channels
    }

    return relevantChannels.slice(0, 5); // Limit to 5 channels max
};

/**
 * Gets live matches
 */
export const getLiveMatches = (matches: LiveMatch[]): LiveMatch[] => {
    return matches.filter(match => match.status === 'live' || match.status === 'halftime');
};

/**
 * Gets today's matches
 */
export const getTodaysMatches = (matches: LiveMatch[]): LiveMatch[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return matches.filter(match => 
        match.kickoffTime >= today && match.kickoffTime < tomorrow
    );
};

/**
 * Gets upcoming matches (next 7 days)
 */
export const getUpcomingMatches = (matches: LiveMatch[]): LiveMatch[] => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return matches.filter(match => 
        match.kickoffTime > now && match.kickoffTime <= nextWeek && match.status === 'scheduled'
    );
};

/**
 * Formats match time
 */
export const formatMatchTime = (date: Date): string => {
    return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

/**
 * Formats match date
 */
export const formatMatchDate = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Aujourd\'hui';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Demain';
    } else {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    }
};

/**
 * Gets sport statistics
 */
export const getSportStats = (channels: Channel[], matches: LiveMatch[]): SportStats => {
    const sportsChannels = getSportsChannels(channels);
    const liveMatches = getLiveMatches(matches);
    const todaysMatches = getTodaysMatches(matches);
    
    const leagues = [...new Set(matches.map(m => m.league))];
    
    return {
        totalSportsChannels: sportsChannels.length,
        liveMatches: liveMatches.length,
        upcomingToday: todaysMatches.filter(m => m.status === 'scheduled').length,
        popularLeagues: leagues.slice(0, 5),
        peakViewingHours: ['15:00', '17:00', '20:00', '21:00']
    };
};

/**
 * Saves favorite teams
 */
export const saveFavoriteTeams = async (teams: Team[]): Promise<void> => {
    try {
        await localforage.setItem(FAVORITES_KEY, teams);
    } catch (e) {
        console.error("Failed to save favorite teams", e);
    }
};

/**
 * Gets favorite teams
 */
export const getFavoriteTeams = async (): Promise<Team[]> => {
    try {
        return await localforage.getItem(FAVORITES_KEY) || [];
    } catch (e) {
        console.error("Failed to get favorite teams", e);
        return [];
    }
};

/**
 * Gets matches for favorite teams
 */
export const getFavoriteTeamMatches = (matches: LiveMatch[], favoriteTeams: Team[]): LiveMatch[] => {
    const favoriteTeamIds = favoriteTeams.map(team => team.id);
    
    return matches.filter(match => 
        favoriteTeamIds.includes(match.homeTeam.id) || 
        favoriteTeamIds.includes(match.awayTeam.id)
    );
};