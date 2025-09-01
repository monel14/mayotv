import React, { useState, useMemo } from 'react';
import type { EpgData, ChannelGuide, Program } from '../../domain/models';
import { formatTime, formatDuration, getCurrentProgram, getNextProgram } from '../../services/epgApi';
import { EPG_TIME_SLOTS } from '../../domain/constants';

interface EpgGridProps {
    epgData: EpgData;
    onSelectProgram: (program: Program, channelGuide: ChannelGuide) => void;
}

export const EpgGrid: React.FC<EpgGridProps> = ({ epgData, onSelectProgram }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

    const filteredChannels = useMemo(() => {
        if (!selectedTimeSlot) return epgData.channels;

        const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
        const slotTime = new Date(selectedDate);
        slotTime.setHours(hours, minutes, 0, 0);

        return epgData.channels.map(channel => ({
            ...channel,
            programs: channel.programs.filter(program => {
                const programStart = new Date(program.start);
                const programEnd = new Date(program.end);
                return programStart <= slotTime && programEnd > slotTime;
            })
        })).filter(channel => channel.programs.length > 0);
    }, [epgData.channels, selectedDate, selectedTimeSlot]);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const getProgramStatus = (program: Program) => {
        const now = new Date();
        if (now >= program.start && now <= program.end) {
            return 'live';
        } else if (program.start > now) {
            return 'upcoming';
        } else {
            return 'past';
        }
    };

    return (
        <div className="space-y-6">
            {/* Date and Time Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Créneau horaire
                        </label>
                        <select
                            value={selectedTimeSlot}
                            onChange={(e) => setSelectedTimeSlot(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">Toute la journée</option>
                            {EPG_TIME_SLOTS.map(slot => (
                                <option key={slot} value={slot}>
                                    {slot}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="text-sm text-gray-600">
                    {isToday(selectedDate) ? 'Aujourd\'hui' : formatDate(selectedDate)}
                    {selectedTimeSlot && ` - ${selectedTimeSlot}`}
                </div>
            </div>

            {/* EPG Grid */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {filteredChannels.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>Aucun programme trouvé pour cette période</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredChannels.map((channel) => (
                                <div key={channel.channelId} className="p-4">
                                    {/* Channel Header */}
                                    <div className="flex items-center mb-3">
                                        {channel.channelLogo && (
                                            <img
                                                src={channel.channelLogo}
                                                alt={channel.channelName}
                                                className="w-8 h-8 rounded mr-3 object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        )}
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            {channel.channelName}
                                        </h3>
                                    </div>

                                    {/* Programs */}
                                    <div className="space-y-2">
                                        {channel.programs.map((program) => {
                                            const status = getProgramStatus(program);
                                            const currentProgram = getCurrentProgram(channel);
                                            const isCurrentProgram = currentProgram?.id === program.id;

                                            return (
                                                <div
                                                    key={program.id}
                                                    onClick={() => onSelectProgram(program, channel)}
                                                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                                                        status === 'live' 
                                                            ? 'border-red-200 bg-red-50 hover:bg-red-100' 
                                                            : status === 'upcoming'
                                                            ? 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                                                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-medium text-gray-600">
                                                                    {formatTime(program.start)} - {formatTime(program.end)}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    ({formatDuration(program.start, program.end)})
                                                                </span>
                                                                {status === 'live' && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1 animate-pulse"></span>
                                                                        EN DIRECT
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <h4 className="font-semibold text-gray-900 truncate mb-1">
                                                                {program.title}
                                                            </h4>
                                                            {program.description && (
                                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                                    {program.description}
                                                                </p>
                                                            )}
                                                            {program.category && (
                                                                <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                                                                    {program.category}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {status === 'live' && (
                                                            <button className="ml-3 px-3 py-1 bg-primary text-white text-sm font-medium rounded hover:bg-secondary transition-colors">
                                                                Regarder
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Last Updated */}
            <div className="text-center text-sm text-gray-500">
                Dernière mise à jour : {epgData.lastUpdated.toLocaleString('fr-FR')}
            </div>
        </div>
    );
};