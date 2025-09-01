import React from 'react';
import type { Program, ChannelGuide } from '../../domain/models';
import { formatTime, formatDuration } from '../../services/epgApi';

interface ProgramModalProps {
    program: Program;
    channelGuide: ChannelGuide;
    onClose: () => void;
    onWatchChannel: (channelGuide: ChannelGuide) => void;
}

export const ProgramModal: React.FC<ProgramModalProps> = ({
    program,
    channelGuide,
    onClose,
    onWatchChannel
}) => {
    const isLive = () => {
        const now = new Date();
        return now >= program.start && now <= program.end;
    };

    const isUpcoming = () => {
        const now = new Date();
        return program.start > now;
    };

    const getTimeUntilStart = () => {
        const now = new Date();
        const diff = program.start.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `dans ${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
        } else if (minutes > 0) {
            return `dans ${minutes}min`;
        } else {
            return 'bientôt';
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleOverlayClick}
        >
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        {channelGuide.channelLogo && (
                            <img
                                src={channelGuide.channelLogo}
                                alt={channelGuide.channelName}
                                className="w-12 h-12 rounded object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {program.title}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {channelGuide.channelName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                        aria-label="Fermer"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status and Time */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-600">
                                {formatTime(program.start)} - {formatTime(program.end)}
                            </span>
                            <span className="text-xs text-gray-500">
                                ({formatDuration(program.start, program.end)})
                            </span>
                        </div>

                        {isLive() && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                <span className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></span>
                                EN DIRECT
                            </span>
                        )}

                        {isUpcoming() && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {getTimeUntilStart()}
                            </span>
                        )}

                        {program.category && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                {program.category}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {program.description && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Description
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                {program.description}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                        {isLive() && (
                            <button
                                onClick={() => onWatchChannel(channelGuide)}
                                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors flex items-center justify-center space-x-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a2 2 0 002 2h2a2 2 0 002-2v-4M9 10V8a2 2 0 012-2h2a2 2 0 012 2v2" />
                                </svg>
                                <span>Regarder maintenant</span>
                            </button>
                        )}

                        <button
                            onClick={() => onWatchChannel(channelGuide)}
                            className={`flex-1 border border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors flex items-center justify-center space-x-2 ${
                                isLive() ? '' : 'bg-primary text-white hover:bg-secondary'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>
                                {isLive() ? 'Voir la chaîne' : 'Aller à la chaîne'}
                            </span>
                        </button>

                        {isUpcoming() && (
                            <button
                                onClick={() => {
                                    // In a real app, this would set a reminder
                                    alert(`Rappel programmé pour "${program.title}" sur ${channelGuide.channelName}`);
                                }}
                                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h10V9H4v2zM4 7h12V5H4v2z" />
                                </svg>
                                <span>Programmer un rappel</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};