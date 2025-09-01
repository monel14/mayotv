
import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Channel } from '../../domain/models';
import { PlayerControls } from '../channels/Controls';

declare const Hls: any;

export const Player = ({ channel, onClose }: { channel: Channel; onClose: () => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<number | null>(null);

    const [error, setError] = useState<string | null>(null);

    // --- Player State ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [areControlsVisible, setAreControlsVisible] = useState(true);

    // --- HLS Setup Effect ---
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !channel) return;

        setError(null);
        setIsPlaying(false);
        let hls: any;
        const sourceUrl = channel.url;
        
        if (Hls.isSupported() && (sourceUrl.includes('.m3u8') || !sourceUrl.match(/\.\w{3,4}$/))) {
            hls = new Hls();
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    console.error('HLS fatal error:', `Type: ${data.type}`, `Details: ${data.details}`);
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            setError(`Could not load the stream. The channel might be offline or geo-blocked.`);
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                             setError(`The video stream is corrupted or in an unsupported format.`);
                            break;
                        default:
                            setError(`An unexpected error occurred while trying to play this channel.`);
                            break;
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            video.addEventListener('loadedmetadata', () => video.play());
            video.addEventListener('error', (e) => {
                console.error("HTML5 Video Playback Error:", e);
                setError("Could not load the video. The format isn't supported by your browser.");
            });
        } else {
            setError("This browser does not support HLS playback.");
        }

        return () => {
            if (hls) hls.destroy();
            if(video) {
                video.pause();
                video.removeAttribute('src');
                video.load();
            }
        };
    }, [channel]);

    // --- Control Handlers ---
    const togglePlayPause = useCallback(() => {
        if (!videoRef.current) return;
        videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
    }, []);

    const toggleMute = useCallback(() => {
        if (!videoRef.current) return;
        const newMuted = !videoRef.current.muted;
        videoRef.current.muted = newMuted;
        setIsMuted(newMuted);
    }, []);

    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return;
        const newVolume = parseFloat(e.target.value);
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        if (newVolume > 0 && videoRef.current.muted) {
            videoRef.current.muted = false;
            setIsMuted(false);
        }
    }, []);

    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = parseFloat(e.target.value);
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            playerContainerRef.current?.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    }, []);

    // --- Video Event Listeners ---
    const handleTimeUpdate = () => setCurrentTime(videoRef.current?.currentTime || 0);
    const handleLoadedMetadata = () => setDuration(videoRef.current?.duration || 0);

    // --- Fullscreen Change Listener ---
    useEffect(() => {
        const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    // --- Controls Visibility ---
    const showControls = useCallback(() => {
        setAreControlsVisible(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = window.setTimeout(() => {
            if (isPlaying) setAreControlsVisible(false);
        }, 3000);
    }, [isPlaying]);

    useEffect(() => {
        const container = playerContainerRef.current;
        container?.addEventListener('mousemove', showControls);
        return () => container?.removeEventListener('mousemove', showControls);
    }, [showControls]);


    // --- Component Render ---
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === overlayRef.current) onClose();
    };

    return (
        <div ref={overlayRef} className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center" onClick={handleOverlayClick}>
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent flex items-center justify-between">
                <h2 className="text-white text-lg font-bold truncate">{channel.name}</h2>
                <button
                    className="text-white text-3xl z-10 p-2 rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Close player"
                    onClick={onClose}
                >
                    &times;
                </button>
            </div>
            
            <div
                ref={playerContainerRef}
                className="relative w-full h-full flex items-center justify-center"
                onMouseEnter={showControls}
                onMouseLeave={() => { if(isPlaying) setAreControlsVisible(false); }}
            >
                <video
                    ref={videoRef}
                    className="w-full h-auto max-h-screen"
                    onClick={togglePlayPause}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onVolumeChange={() => {
                        if (!videoRef.current) return;
                        setIsMuted(videoRef.current.muted);
                        setVolume(videoRef.current.volume);
                    }}
                ></video>
                
                {!error && areControlsVisible && (
                    <PlayerControls
                        isPlaying={isPlaying}
                        isMuted={isMuted}
                        volume={volume}
                        currentTime={currentTime}
                        duration={duration}
                        onPlayPause={togglePlayPause}
                        onMuteToggle={toggleMute}
                        onVolumeChange={handleVolumeChange}
                        onSeek={handleSeek}
                        onFullscreenToggle={toggleFullscreen}
                        isFullscreen={isFullscreen}
                    />
                )}
                
                {error && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-6" role="alert">
                        <div className="w-16 h-16 text-red-500 mb-4" aria-hidden="true">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">Playback Error</h3>
                        <p className="text-gray-300 max-w-md">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
