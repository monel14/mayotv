import { useEffect, useCallback, useRef } from 'react';
import { 
    debounce, 
    throttle, 
    memoryMonitor, 
    performanceMetrics,
    lazyImageLoader 
} from '../services/performanceOptimizer';

/**
 * Hook for performance optimization utilities
 */
export const usePerformanceOptimization = () => {
    const isInitialized = useRef(false);

    useEffect(() => {
        if (!isInitialized.current) {
            // Start memory monitoring
            memoryMonitor.startMonitoring(() => {
                console.warn('High memory usage detected - consider clearing cache');
                // Could trigger cache cleanup here
            });

            isInitialized.current = true;
        }

        return () => {
            if (isInitialized.current) {
                memoryMonitor.stopMonitoring();
                lazyImageLoader.disconnect();
            }
        };
    }, []);

    const measurePerformance = useCallback((label: string) => {
        return performanceMetrics.startTiming(label);
    }, []);

    const getMemoryUsage = useCallback(() => {
        return memoryMonitor.getMemoryUsage();
    }, []);

    const getPerformanceMetrics = useCallback(() => {
        return performanceMetrics.getAllMetrics();
    }, []);

    return {
        debounce,
        throttle,
        measurePerformance,
        getMemoryUsage,
        getPerformanceMetrics,
        lazyImageLoader
    };
};

/**
 * Hook for debounced search
 */
export const useDebouncedSearch = (
    searchFunction: (query: string) => void,
    delay: number = 300
) => {
    const debouncedSearch = useCallback(
        debounce(searchFunction, delay),
        [searchFunction, delay]
    );

    return debouncedSearch;
};

/**
 * Hook for throttled scroll handling
 */
export const useThrottledScroll = (
    scrollHandler: (event: Event) => void,
    limit: number = 16 // ~60fps
) => {
    const throttledHandler = useCallback(
        throttle(scrollHandler, limit),
        [scrollHandler, limit]
    );

    return throttledHandler;
};