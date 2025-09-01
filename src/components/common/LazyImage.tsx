import React, { useRef, useEffect, useState } from 'react';
import { createIntersectionObserver, imagePreloader } from '../../services/performanceOptimizer';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    placeholder?: string;
    onLoad?: () => void;
    onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt,
    className = '',
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
    onLoad,
    onError
}) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const img = imgRef.current;
        if (!img) return;

        // Set up lazy loading
        img.src = placeholder;

        const handleLoad = () => {
            setIsLoaded(true);
            onLoad?.();
        };

        const handleError = () => {
            setHasError(true);
            onError?.();
        };

        img.addEventListener('load', handleLoad);
        img.addEventListener('error', handleError);

        // Create intersection observer for lazy loading
        const observer = createIntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const target = entry.target as HTMLImageElement;
                    
                    // Check if image is already preloaded
                    if (imagePreloader.isLoaded(src)) {
                        target.src = src;
                    } else {
                        // Preload and then set source
                        imagePreloader.preloadSingle(src)
                            .then(() => {
                                target.src = src;
                            })
                            .catch(() => {
                                setHasError(true);
                            });
                    }
                    
                    observer.unobserve(target);
                }
            });
        });

        observer.observe(img);

        return () => {
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
            observer.unobserve(img);
        };
    }, [src, placeholder, onLoad, onError]);

    if (hasError) {
        return (
            <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    return (
        <img
            ref={imgRef}
            alt={alt}
            className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-70'} ${className}`}
        />
    );
};