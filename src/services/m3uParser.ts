import type { Channel } from '../domain/models';

export interface M3UEntry {
    title: string;
    url: string;
    group?: string;
    logo?: string;
    country?: string;
    language?: string;
    tvgId?: string;
}

/**
 * Parses M3U playlist content and extracts channel information
 */
export const parseM3U = (content: string): M3UEntry[] => {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const entries: M3UEntry[] = [];
    
    let currentEntry: Partial<M3UEntry> = {};
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.startsWith('#EXTINF:')) {
            // Parse EXTINF line
            const extinf = line.substring(8); // Remove '#EXTINF:'
            
            // Extract duration and title
            const commaIndex = extinf.indexOf(',');
            if (commaIndex !== -1) {
                const attributes = extinf.substring(0, commaIndex);
                const title = extinf.substring(commaIndex + 1).trim();
                
                currentEntry = { title };
                
                // Parse attributes
                const attrMatches = attributes.matchAll(/(\w+)="([^"]+)"/g);
                for (const match of attrMatches) {
                    const [, key, value] = match;
                    switch (key.toLowerCase()) {
                        case 'tvg-logo':
                            currentEntry.logo = value;
                            break;
                        case 'group-title':
                            currentEntry.group = value;
                            break;
                        case 'tvg-country':
                            currentEntry.country = value;
                            break;
                        case 'tvg-language':
                            currentEntry.language = value;
                            break;
                        case 'tvg-id':
                            currentEntry.tvgId = value;
                            break;
                    }
                }
            }
        } else if (line && !line.startsWith('#') && currentEntry.title) {
            // This should be the URL
            currentEntry.url = line;
            entries.push(currentEntry as M3UEntry);
            currentEntry = {};
        }
    }
    
    return entries;
};

/**
 * Converts M3U entries to Channel objects
 */
export const m3uToChannels = (entries: M3UEntry[]): Channel[] => {
    return entries.map((entry, index) => ({
        name: entry.title,
        logo: entry.logo || '',
        group: entry.group || entry.country || 'Unknown',
        url: entry.url,
        country: entry.country,
        countryName: entry.country,
        countryFlag: getCountryFlag(entry.country),
        network: entry.group,
        quality: detectQuality(entry.url)
    }));
};

/**
 * Detects video quality from URL
 */
const detectQuality = (url: string): string | undefined => {
    if (url.includes('2500000')) return '1080p';
    if (url.includes('1500000')) return '720p';
    if (url.includes('1000000')) return '480p';
    if (url.includes('500000')) return '360p';
    return undefined;
};

/**
 * Gets country flag emoji from country code or name
 */
const getCountryFlag = (country?: string): string => {
    if (!country) return '🏴';
    
    const countryFlags: Record<string, string> = {
        'SI': '🇸🇮', 'Slovenia': '🇸🇮',
        'HR': '🇭🇷', 'Croatia': '🇭🇷',
        'RS': '🇷🇸', 'Serbia': '🇷🇸',
        'BA': '🇧🇦', 'Bosnia': '🇧🇦',
        'MK': '🇲🇰', 'Macedonia': '🇲🇰',
        'ME': '🇲🇪', 'Montenegro': '🇲🇪',
        'FR': '🇫🇷', 'France': '🇫🇷',
        'DE': '🇩🇪', 'Germany': '🇩🇪',
        'IT': '🇮🇹', 'Italy': '🇮🇹',
        'ES': '🇪🇸', 'Spain': '🇪🇸',
        'GB': '🇬🇧', 'UK': '🇬🇧', 'United Kingdom': '🇬🇧',
        'US': '🇺🇸', 'USA': '🇺🇸', 'United States': '🇺🇸'
    };
    
    return countryFlags[country.toUpperCase()] || countryFlags[country] || '🏴';
};

/**
 * Sample M3U content for testing
 */
export const SAMPLE_M3U = `#EXTM3U
#EXTINF:-1 tvg-logo="https://example.com/logo1.png" group-title="Slovenia",DARING TV
http://p21.sdn.si/daring/daring.isml/daring-video=2500000-audio101=128000.m3u8
#EXTINF:-1 tvg-logo="https://example.com/logo2.png" group-title="Slovenia",CENTOX CENTO TV
http://p21.sdn.si/priveetv/priveetv.isml/priveetv-video=2500000-audio101=128000.m3u8
#EXTINF:-1 tvg-logo="https://example.com/logo3.png" group-title="Adult",SUPER ONE +18
http://p22.sdn.si/superone/superone.isml/superone-video=2500000-audio101=128000.m3u8`;

/**
 * Validates M3U content
 */
export const validateM3U = (content: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!content.trim()) {
        errors.push('Le contenu M3U est vide');
        return { isValid: false, errors };
    }
    
    if (!content.includes('#EXTM3U') && !content.includes('#EXTINF:')) {
        errors.push('Format M3U invalide - en-têtes manquants');
    }
    
    const entries = parseM3U(content);
    if (entries.length === 0) {
        errors.push('Aucune chaîne trouvée dans le fichier M3U');
    }
    
    // Check for valid URLs
    const invalidUrls = entries.filter(entry => !isValidUrl(entry.url));
    if (invalidUrls.length > 0) {
        errors.push(`${invalidUrls.length} URL(s) invalide(s) détectée(s)`);
    }
    
    return { isValid: errors.length === 0, errors };
};

/**
 * Validates URL format
 */
const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};