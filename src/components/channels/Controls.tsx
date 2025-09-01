
import React from 'react';
import { formatTime } from '../utils';

// --- Icon Components ---
const PlayIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4.018 14.386V5.614a1 1 0 011.504-.864l7.996 4.386a1 1 0 010 1.728l-7.996 4.386a1 1 0 01-1.504-.864z"></path></svg>;
const PauseIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4h3a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zm7 0h3a1 1 0 011 1v10a1 1 0 01-1 1h-3a1 1 0 01-1-1V5a1 1 0 011-1z" clipRule="evenodd"></path></svg>;
const VolumeHighIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3.6c.41 0 .75.34.75.75v11.3c0 .41-.34.75-.75.75S9.25 16.06 9.25 15.65V4.35c0-.41.34-.75.75-.75zM6 6.35c.41 0 .75.34.75.75v6.8c0 .41-.34.75-.75.75S5.25 14.31 5.25 13.9V7.1c0-.41.34-.75.75-.75zM14 6.35c.41 0 .75.34.75.75v6.8c0 .41-.34.75-.75.75s-.75-.34-.75-.75V7.1c0-.41.34-.75.75-.75zM2.75 8.5c.41 0 .75.34.75.75v2.5c0 .41-.34.75-.75.75S2 12.16 2 11.75V9.25c0-.41.34-.75.75-.75zM17.25 8.5c.41 0 .75.34.75.75v2.5c0 .41-.34.75-.75.75S16.5 12.16 16.5 11.75V9.25c0-.41.34-.75.75-.75z"></path></svg>;
const VolumeMuteIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v.783L6.45 2.23A1 1 0 005 3.055v1.2L1.75 1.005a.75.75 0 00-1.06 1.06L2.94 4.315 1.914 5.34a1 1 0 001.414 1.414l1.3-1.3.1.1a4.988 4.988 0 00-2.032 4.282 1 1 0 001 1h.5a1 1 0 001-1 3 3 0 013-3h1a3 3 0 013 3 1 1 0 001 1h.5a1 1 0 001-1 5 5 0 00-2.7-4.472l2.362-2.362a.75.75 0 00-1.061-1.06L12.217 8.25 11 7.032V4a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>;
const FullscreenEnterIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" /></svg>;
const FullscreenExitIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19v-4m0 0h4m-4 0l-5 5M5 5v4m0 0H9m-4 0l5-5m10 14v-4m0 0h-4m4 0l-5 5M5 9V5m0 0h4M5 5l5 5" /></svg>;

interface PlayerControlsProps {
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;
    currentTime: number;
    duration: number;
    onPlayPause: () => void;
    onMuteToggle: () => void;
    onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFullscreenToggle: () => void;
    isFullscreen: boolean;
}

export const PlayerControls = ({
    isPlaying, isMuted, volume, currentTime, duration, onPlayPause, onMuteToggle, onVolumeChange, onSeek, onFullscreenToggle, isFullscreen
}: PlayerControlsProps) => {
    
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    
    return (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white opacity-100 transition-opacity duration-300">
            {/* Progress Bar */}
            <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={onSeek}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer range-sm accent-primary"
                aria-label="Seek slider"
            />
            
            {/* Controls */}
            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-4">
                    <button onClick={onPlayPause} aria-label={isPlaying ? "Pause" : "Play"}>{isPlaying ? <PauseIcon /> : <PlayIcon />}</button>
                    <div className="flex items-center gap-2 group">
                        <button onClick={onMuteToggle} aria-label={isMuted ? "Unmute" : "Mute"}>{isMuted || volume === 0 ? <VolumeMuteIcon /> : <VolumeHighIcon />}</button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={onVolumeChange}
                            className="w-0 group-hover:w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer range-sm accent-primary transition-all duration-300 ease-in-out"
                            aria-label="Volume slider"
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                     <span className="text-sm font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
                    <button onClick={onFullscreenToggle} aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
                    </button>
                </div>
            </div>
        </div>
    );
};
