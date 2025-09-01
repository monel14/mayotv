import React, { useState } from 'react';
import { useEpgData } from '../../hooks/useEpgData';
import { EpgGrid } from './EpgGrid';
import { ProgramModal } from './ProgramModal';
import { Loader } from '../common/Loader';
import { ErrorMessage } from '../common/ErrorMessage';
import type { Channel, Program, ChannelGuide } from '../../domain/models';

interface EpgViewProps {
    channels: Channel[];
    onSelectChannel: (channel: Channel) => void;
}

export const EpgView: React.FC<EpgViewProps> = ({ channels, onSelectChannel }) => {
    const { epgData, isLoading, error, refreshEpgData } = useEpgData(channels);
    const [selectedProgram, setSelectedProgram] = useState<{
        program: Program;
        channelGuide: ChannelGuide;
    } | null>(null);

    const handleSelectProgram = (program: Program, channelGuide: ChannelGuide) => {
        setSelectedProgram({ program, channelGuide });
    };

    const handleWatchChannel = (channelGuide: ChannelGuide) => {
        // Find the channel object from the channels array
        const channel = channels.find(c => c.url === channelGuide.channelId);
        if (channel) {
            onSelectChannel(channel);
            setSelectedProgram(null);
        }
    };

    const handleCloseModal = () => {
        setSelectedProgram(null);
    };

    if (isLoading && !epgData) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="space-y-4">
                <ErrorMessage message={error} />
                <div className="text-center">
                    <button
                        onClick={refreshEpgData}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    if (!epgData) {
        return (
            <div className="flex items-center justify-center h-64 text-center text-gray-500">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Guide TV</h2>
                    <p className="text-gray-600">Chargement des programmes en cours...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Guide TV</h1>
                    <p className="text-gray-600 mt-1">
                        Découvrez les programmes en cours et à venir sur vos chaînes préférées
                    </p>
                </div>
                <button
                    onClick={refreshEpgData}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>{isLoading ? 'Actualisation...' : 'Actualiser'}</span>
                </button>
            </div>

            {/* EPG Grid */}
            <EpgGrid 
                epgData={epgData} 
                onSelectProgram={handleSelectProgram}
            />

            {/* Program Modal */}
            {selectedProgram && (
                <ProgramModal
                    program={selectedProgram.program}
                    channelGuide={selectedProgram.channelGuide}
                    onClose={handleCloseModal}
                    onWatchChannel={handleWatchChannel}
                />
            )}
        </div>
    );
};