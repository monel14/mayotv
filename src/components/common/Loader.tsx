import React from 'react';

export const Loader = () => (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary mx-auto"></div>
            <p className="text-secondary text-lg mt-4">Loading playlist...</p>
            <p className="text-gray-500 text-sm mt-2">This might take a moment on the first visit.</p>
        </div>
    </div>
);