import React from 'react';
import type { Channel } from '../../domain/models';
import { ChannelCard } from './ChannelCard';
import { ChannelCardSkeleton } from './ChannelCardSkeleton';

interface ChannelGridProps {
    channels: Channel[];
    onSelectChannel: (channel: Channel) => void;
    isLoading: boolean;
}

export const ChannelGrid = React.memo(({ channels, onSelectChannel, isLoading }: ChannelGridProps) => {
    const gridClasses = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4";

    if (isLoading) {
        return (
            <div className={gridClasses}>
                {Array.from({ length: 20 }).map((_, index) => (
                    <ChannelCardSkeleton key={index} />
                ))}
            </div>
        );
    }
    
    if (channels.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>No channels found.</p>
            </div>
        );
    }

    return (
        <div className={gridClasses}>
            {channels.map(channel => (
                <ChannelCard 
                  key={channel.url} 
                  channel={channel} 
                  onSelect={onSelectChannel}
                />
            ))}
        </div>
    );
});