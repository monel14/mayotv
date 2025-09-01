import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import type { Channel } from '../../domain/models';
import { LazyImage } from '../common/LazyImage';
import { performanceMetrics } from '../../services/performanceOptimizer';

interface VirtualChannelGridProps {
    channels: Channel[];
    onSelectChannel: (channel: Channel) => void;
    isLoading?: boolean;
    itemWidth?: number;
    itemHeight?: number;
}

interface CellProps {
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
    data: {
        channels: Channel[];
        columnsPerRow: number;
        onSelectChannel: (channel: Channel) => void;
    };
}

const ChannelCell: React.FC<CellProps> = ({ columnIndex, rowIndex, style, data }) => {
    const { channels, columnsPerRow, onSelectChannel } = data;
    const index = rowIndex * columnsPerRow + columnIndex;
    const channel = channels[index];

    if (!channel) {
        return <div style={style} />;
    }

    const handleClick = () => {
        const endTiming = performanceMetrics.startTiming('channel-selection');
        onSelectChannel(channel);
        endTiming();
    };

    return (
        <div style={style} className="p-2">
            <button
                onClick={handleClick}
                className="w-full h-full bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
                <div className="relative h-32">
                    <LazyImage
                        src={channel.logo}
                        alt={channel.name}
                        className="w-full h-full object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300"
                        onError={() => {
                            // Fallback to placeholder
                        }}
                    />
                    <div className="absolute top-2 right-2">
                        {channel.quality && (
                            <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                                {channel.quality}
                            </span>
                        )}
                    </div>
                </div>
                <div className="p-3">
                    <h3 className="font-semibold text-gray-900 truncate text-sm mb-1">
                        {channel.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="flex items-center">
                            {channel.countryFlag && <span className="mr-1">{channel.countryFlag}</span>}
                            <span className="truncate">{channel.countryName || channel.country}</span>
                        </span>
                    </div>
                </div>
            </button>
        </div>
    );
};

export const VirtualChannelGrid: React.FC<VirtualChannelGridProps> = ({
    channels,
    onSelectChannel,
    isLoading = false,
    itemWidth = 200,
    itemHeight = 240
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                setContainerSize({ width: clientWidth, height: clientHeight });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const { columnsPerRow, rowCount } = useMemo(() => {
        const cols = Math.max(1, Math.floor(containerSize.width / itemWidth));
        const rows = Math.ceil(channels.length / cols);
        return { columnsPerRow: cols, rowCount: rows };
    }, [containerSize.width, channels.length, itemWidth]);

    const itemData = useMemo(() => ({
        channels,
        columnsPerRow,
        onSelectChannel
    }), [channels, columnsPerRow, onSelectChannel]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (channels.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-center text-gray-500">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune chaîne trouvée</h3>
                    <p className="text-gray-600">Essayez de modifier vos filtres de recherche</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full h-full min-h-96">
            {containerSize.width > 0 && (
                <Grid
                    columnCount={columnsPerRow}
                    columnWidth={itemWidth}
                    height={Math.min(containerSize.height || 600, 600)}
                    rowCount={rowCount}
                    rowHeight={itemHeight}
                    width={containerSize.width}
                    itemData={itemData}
                    overscanRowCount={2}
                    overscanColumnCount={1}
                >
                    {ChannelCell}
                </Grid>
            )}
        </div>
    );
};