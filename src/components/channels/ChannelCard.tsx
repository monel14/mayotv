import React, { useState, useEffect } from 'react';
import type { Channel } from '../../domain/models';

// Helper function to generate initials from a channel name.
const getInitials = (name: string): string => {
    if (!name) return '?';
    // Clean the name by removing special characters and extra spaces
    const words = name.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) return name.substring(0, 1).toUpperCase() || '?';
    
    // For a single word, take the first two letters.
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    
    // For multiple words, take the first letter of the first two words.
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
};

// A color palette for the background of the initials.
const PALETTE = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', 
    '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899'
];

// Generates a consistent color from the palette based on the channel name.
const generateColorFromName = (name: string): string => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash; // Ensure 32bit integer
    }
    const index = Math.abs(hash % PALETTE.length);
    return PALETTE[index];
};


interface ChannelCardProps {
    channel: Channel;
    onSelect: (channel: Channel) => void;
}

export const ChannelCard = React.memo(({ channel, onSelect }: ChannelCardProps) => {
    const [logoError, setLogoError] = useState(false);

    // Reset error state if the channel logo URL changes.
    useEffect(() => {
        setLogoError(false);
    }, [channel.logo]);

    const handleLogoError = () => {
        setLogoError(true);
    };

    const showFallback = logoError || !channel.logo;
    const metadataTitle = [channel.countryName, channel.network].filter(Boolean).join(' | ');

    return (
        <div 
            className="bg-white border border-gray-200 rounded-lg p-2 flex flex-col items-center justify-start text-center cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105 hover:border-primary hover:shadow-md"
            onClick={() => onSelect(channel)} 
            role="button" 
            tabIndex={0} 
            aria-label={`Play ${channel.name}`}
        >
            <div className="w-full h-20 bg-gray-50 rounded-md flex items-center justify-center mb-2 p-1 overflow-hidden relative">
                {channel.quality && (
                    <span 
                        className="absolute top-1.5 right-1.5 bg-primary text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg"
                        aria-label={`Quality: ${channel.quality}`}
                    >
                        {channel.quality}
                    </span>
                )}
                {showFallback ? (
                    <div 
                        className="w-full h-full rounded-md flex items-center justify-center text-white font-bold text-2xl uppercase select-none"
                        style={{ backgroundColor: generateColorFromName(channel.name) }}
                        aria-label={`${channel.name} initials logo`}
                    >
                        {getInitials(channel.name)}
                    </div>
                ) : (
                    <img 
                        src={channel.logo} 
                        alt={`${channel.name} logo`} 
                        className="max-w-full max-h-full object-contain" 
                        loading="lazy"
                        onError={handleLogoError}
                    />
                )}
            </div>
            <div className="w-full h-16 flex flex-col items-center justify-center px-1">
                <p className="text-gray-800 text-xs font-semibold leading-tight text-center w-full truncate" title={channel.name}>
                    {channel.name}
                </p>
                
                {(channel.countryFlag || channel.network) && (
                    <div 
                        className="flex items-center justify-center gap-1.5 text-gray-500 text-[11px] w-full truncate mt-1.5"
                        title={metadataTitle}
                    >
                        {channel.countryFlag && (
                            <span className="text-sm shrink-0" aria-label={channel.countryName}>{channel.countryFlag}</span>
                        )}
                        {channel.network && (
                            <span className="truncate">{channel.network}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});