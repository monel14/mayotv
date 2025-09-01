import React, { useState, useRef, useEffect } from 'react';
import type { Channel } from '../../domain/models';

declare const Hls: any;

interface ChannelPreviewProps {
    channel: Channel;
    onPlay: (channel: Channel) => void;
    onClose: () => void;
    autoPlay?: boolean;
}

export const ChannelPreview: React.FC<ChannelPreviewProps> = ({
    channel,
    onPlay,
    onClose,
    autoPlay = false
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const hlsRef = useRef<any>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !channel.url) return;

        setIsLoading(true);
        setHasError(false);

        let hls: any;
        const sourceUrl = channel.url;

        const cleanup = () => {
            if (hls) {
                hls.destroy();
                hls = null;
            }
            if (video) {
                video.pause();
                video.removeAttribute('src');
                video.load();
            }
        };

        if (Hls.isSupported() && (sourceUrl.includes('.m3u8') || !sourceUrl.match(/\.\w{3,4}$/))) {
            hls = new Hls({
                enableWorker: false,
                lowLatencyMode: true,
                backBufferLength: 30
            });
            
            hlsRef.current = hls;
            
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setIsLoading(false);
                if (autoPlay) {
                    video.play().catch(() => {
                        // Auto-play failed, user interaction required
                    });
                }
            });
            
            hls.on(Hls.Events.ERROR, (event: any, data: any) => {
                if (data.fatal) {
                    console.error('HLS error:', data);
                    setHasError(true);
                    setIsLoading(false);
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            video.addEventListener('loadedmetadata', () => {
                setIsLoading(false);
                if (autoPlay) {
                    video.play().catch(() => {
                        // Auto-play failed
                    });
                }
            });
            video.addEventListener('error', () => {
                setHasError(true);
                setIsLoading(false);
            });
        } else {
            setHasError(true);
            setIsLoading(false);
        }

        return cleanup;
    }, [channel.url, autoPlay]);

    const handlePlay = () => {
        const video = videoRef.current;
        if (video) {
            if (video.paused) {
                video.play();
                setIsPlaying(true);
            } else {
                video.pause();
                setIsPlaying(false);
            }
        }
    };

    const handleFullPlay = () => {
        onPlay(channel);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={handleOverlayClick}
        >
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        {channel.logo && (
                            <img
                                src={channel.logo}
                                alt={channel.name}
                                className="w-8 h-8 rounded object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        )}
                        <div>
                            <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                {channel.countryFlag && <span>{channel.countryFlag}</span>}
                                <span>{channel.countryName || channel.country}</span>
                                {channel.quality && (
                                    <>
                                        <span>•</span>
                                        <span className="font-medium">{channel.quality}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Video Preview */}
                <div className="relative bg-black aspect-video">
                    <video
                        ref={videoRef}
                        className="w-full h-full"
                        muted
                        playsInline
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                    />

                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <div className="text-white text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                                <p>Chargement de l'aperçu...</p>
                            </div>
                        </div>
                    )}

                    {/* Error Overlay */}
                    {hasError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                            <div className="text-white text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                                <h4 className="text-lg font-semibold mb-2">Aperçu indisponible</h4>
                                <p className="text-gray-300">Cette chaîne ne peut pas être prévisualisée</p>
                            </div>
                        </div>
                    )}

                    {/* Play/Pause Button */}
                    {!isLoading && !hasError && (
                        <button
                            onClick={handlePlay}
                            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group"
                        >
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:bg-white/30 transition-colors">
                                {isPlaying ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a2 2 0 002 2h2a2 2 0 002-2v-4M9 10V8a2 2 0 012-2h2a2 2 0 012 2v2" />
                                    </svg>
                                )}
                            </div>
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 flex space-x-3">
                    <button
                        onClick={handleFullPlay}
                        disabled={hasError}
                        className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Regarder en plein écran</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};