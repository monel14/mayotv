import React from 'react';

export const ChannelCardSkeleton = () => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-2 flex flex-col items-center justify-start animate-pulse">
            <div className="w-full h-20 bg-gray-200 rounded-md mb-2"></div>
            <div className="w-full h-16 flex flex-col items-center justify-center px-1">
                <div className="w-3/4 h-4 bg-gray-200 rounded-md mb-2"></div>
                <div className="w-1/2 h-3 bg-gray-200 rounded-md"></div>
            </div>
        </div>
    );
};