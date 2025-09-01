import React from 'react';

export const ErrorMessage = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center h-full">
        <div className="text-center bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            <h3 className="font-bold mb-2 text-red-800">An Error Occurred</h3>
            <p className="text-sm">{message}</p>
        </div>
    </div>
);