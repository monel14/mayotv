// Performance optimization utilities for MAYO TV

/**
 * Debounce function to limit the rate of function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

/**
 * Throttle function to limit function calls to once per interval
 */
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    interval: number
): ((...args: Parameters<T>) => void) => {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
        const now = Date.now();
        if (now - lastCall >= interval) {
            lastCall = now;
            func(...args);
        }
    };
};

/**
 * Intersection Observer utility for lazy loading
 */
export const createIntersectionObserver = (
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
): IntersectionObserver => {
    return new IntersectionObserver(callback, {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
    });
};

/**
 * Virtual scrolling utility for large lists
 */
export class VirtualScroller {
    private container: HTMLElement;
    private itemHeight: number;
    private visibleCount: number;
    private totalCount: number;
    private scrollTop: number = 0;
    private renderCallback: (startIndex: number, endIndex: number) => void;

    constructor(
        container: HTMLElement,
        itemHeight: number,
        totalCount: number,
        renderCallback: (startIndex: number, endIndex: number) => void
    ) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.totalCount = totalCount;
        this.renderCallback = renderCallback;
        this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;

        this.setupScrollListener();
    }

    private setupScrollListener() {
        const throttledScroll = throttle(() => {
            this.scrollTop = this.container.scrollTop;
            this.updateVisibleItems();
        }, 16); // ~60fps

        this.container.addEventListener('scroll', throttledScroll);
    }

    private updateVisibleItems() {
        const startIndex = Math.floor(this.scrollTop / this.itemHeight);
        const endIndex = Math.min(startIndex + this.visibleCount, this.totalCount);
        this.renderCallback(startIndex, endIndex);
    }

    public updateTotalCount(newCount: number) {
        this.totalCount = newCount;
        this.updateVisibleItems();
    }
}

/**
 * Memory usage monitor
 */
export class MemoryMonitor {
    private static instance: MemoryMonitor;
    private memoryInfo: any = null;
    private callbacks: ((info: any) => void)[] = [];

    private constructor() {
        this.startMonitoring();
    }

    public static getInstance(): MemoryMonitor {
        if (!MemoryMonitor.instance) {
            MemoryMonitor.instance = new MemoryMonitor();
        }
        return MemoryMonitor.instance;
    }

    private startMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                this.memoryInfo = (performance as any).memory;
                this.callbacks.forEach(callback => callback(this.memoryInfo));
            }, 5000);
        }
    }

    public subscribe(callback: (info: any) => void) {
        this.callbacks.push(callback);
        if (this.memoryInfo) {
            callback(this.memoryInfo);
        }
    }

    public unsubscribe(callback: (info: any) => void) {
        this.callbacks = this.callbacks.filter(cb => cb !== callback);
    }

    public getMemoryInfo() {
        return this.memoryInfo;
    }
}

/**
 * Performance metrics collector
 */
export class PerformanceMetrics {
    private static instance: PerformanceMetrics;
    private metrics: Map<string, number[]> = new Map();

    private constructor() { }

    public static getInstance(): PerformanceMetrics {
        if (!PerformanceMetrics.instance) {
            PerformanceMetrics.instance = new PerformanceMetrics();
        }
        return PerformanceMetrics.instance;
    }

    public startTiming(label: string): () => void {
        const startTime = performance.now();
        return () => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            this.addMetric(label, duration);
        };
    }

    public addMetric(label: string, value: number) {
        if (!this.metrics.has(label)) {
            this.metrics.set(label, []);
        }
        const values = this.metrics.get(label)!;
        values.push(value);

        // Keep only last 100 measurements
        if (values.length > 100) {
            values.shift();
        }
    }

    public getMetrics(label: string) {
        const values = this.metrics.get(label) || [];
        if (values.length === 0) return null;

        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        return { avg, min, max, count: values.length };
    }

    public getAllMetrics() {
        const result: Record<string, any> = {};
        for (const [label] of this.metrics) {
            result[label] = this.getMetrics(label);
        }
        return result;
    }

    public clearMetrics(label?: string) {
        if (label) {
            this.metrics.delete(label);
        } else {
            this.metrics.clear();
        }
    }
}

/**
 * Image preloader utility
 */
export class ImagePreloader {
    private cache: Map<string, HTMLImageElement> = new Map();
    private loading: Set<string> = new Set();

    public preload(urls: string[]): Promise<void[]> {
        return Promise.all(urls.map(url => this.preloadSingle(url)));
    }

    public preloadSingle(url: string): Promise<void> {
        if (this.cache.has(url)) {
            return Promise.resolve();
        }

        if (this.loading.has(url)) {
            return new Promise(resolve => {
                const checkLoaded = () => {
                    if (this.cache.has(url)) {
                        resolve();
                    } else {
                        setTimeout(checkLoaded, 50);
                    }
                };
                checkLoaded();
            });
        }

        this.loading.add(url);

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.cache.set(url, img);
                this.loading.delete(url);
                resolve();
            };
            img.onerror = () => {
                this.loading.delete(url);
                reject(new Error(`Failed to load image: ${url}`));
            };
            img.src = url;
        });
    }

    public isLoaded(url: string): boolean {
        return this.cache.has(url);
    }

    public getCachedImage(url: string): HTMLImageElement | null {
        return this.cache.get(url) || null;
    }

    public clearCache() {
        this.cache.clear();
        this.loading.clear();
    }
}

/**
 * Lazy loading utility for images
 */
export class LazyImageLoader {
    private observer: IntersectionObserver;
    private images: Set<HTMLImageElement> = new Set();

    constructor() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target as HTMLImageElement;
                        this.loadImage(img);
                    }
                });
            },
            {
                rootMargin: '50px',
                threshold: 0.1
            }
        );
    }

    observe(img: HTMLImageElement) {
        this.images.add(img);
        this.observer.observe(img);
    }

    unobserve(img: HTMLImageElement) {
        this.images.delete(img);
        this.observer.unobserve(img);
    }

    private loadImage(img: HTMLImageElement) {
        const src = img.dataset.src;
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            this.observer.unobserve(img);
        }
    }

    disconnect() {
        this.observer.disconnect();
        this.images.clear();
    }
}

/**
 * Cache manager with size limits and TTL
 */
export class CacheManager {
    private cache: Map<string, { data: any; timestamp: number; size: number }> = new Map();
    private maxSize: number;
    private defaultTTL: number;
    private currentSize: number = 0;

    constructor(maxSize: number = 50 * 1024 * 1024, defaultTTL: number = 3600000) { // 50MB, 1 hour
        this.maxSize = maxSize;
        this.defaultTTL = defaultTTL;
    }

    set(key: string, data: any, ttl?: number): void {
        const size = this.estimateSize(data);
        const timestamp = Date.now();
        const expiryTime = timestamp + (ttl || this.defaultTTL);

        // Remove expired entries
        this.cleanup();

        // Make space if needed
        while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
            this.evictOldest();
        }

        // Add new entry
        if (this.cache.has(key)) {
            this.currentSize -= this.cache.get(key)!.size;
        }

        this.cache.set(key, { data, timestamp: expiryTime, size });
        this.currentSize += size;
    }

    get(key: string): any | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.timestamp) {
            this.delete(key);
            return null;
        }

        return entry.data;
    }

    delete(key: string): boolean {
        const entry = this.cache.get(key);
        if (entry) {
            this.currentSize -= entry.size;
            return this.cache.delete(key);
        }
        return false;
    }

    clear(): void {
        this.cache.clear();
        this.currentSize = 0;
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.timestamp) {
                this.delete(key);
            }
        }
    }

    private evictOldest(): void {
        const oldestKey = this.cache.keys().next().value;
        if (oldestKey) {
            this.delete(oldestKey);
        }
    }

    private estimateSize(data: any): number {
        return JSON.stringify(data).length * 2; // Rough estimate
    }

    getStats(): { size: number; maxSize: number; entries: number } {
        return {
            size: this.currentSize,
            maxSize: this.maxSize,
            entries: this.cache.size
        };
    }
}

/**
 * Network request optimizer
 */
export class NetworkOptimizer {
    private requestQueue: Array<() => Promise<any>> = [];
    private activeRequests: number = 0;
    private maxConcurrent: number = 6;
    private retryAttempts: number = 3;
    private retryDelay: number = 1000;

    async request<T>(requestFn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.requestQueue.push(async () => {
                try {
                    const result = await this.executeWithRetry(requestFn);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });

            this.processQueue();
        });
    }

    private async processQueue(): Promise<void> {
        if (this.activeRequests >= this.maxConcurrent || this.requestQueue.length === 0) {
            return;
        }

        const request = this.requestQueue.shift();
        if (!request) return;

        this.activeRequests++;

        try {
            await request();
        } finally {
            this.activeRequests--;
            this.processQueue(); // Process next request
        }
    }

    private async executeWithRetry<T>(requestFn: () => Promise<T>): Promise<T> {
        let lastError: Error;

        for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error as Error;

                if (attempt < this.retryAttempts - 1) {
                    await this.delay(this.retryDelay * Math.pow(2, attempt));
                }
            }
        }

        throw lastError!;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Bundle size analyzer
 */
export const analyzeBundleSize = () => {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

    return {
        scripts: scripts.length,
        styles: styles.length,
        totalResources: scripts.length + styles.length
    };
};

/**
 * Network speed tester
 */
export const testNetworkSpeed = async (): Promise<number> => {
    const startTime = performance.now();
    const testUrl = 'https://httpbin.org/bytes/1024'; // 1KB test

    try {
        await fetch(testUrl);
        const endTime = performance.now();
        const duration = endTime - startTime;
        const speedKbps = (1024 * 8) / (duration / 1000) / 1000; // Convert to Kbps
        return speedKbps;
    } catch (error) {
        console.error('Network speed test failed:', error);
        return 0;
    }
};

/**
 * Batch processing utility
 */
export const batchProcess = async <T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10,
    delay: number = 0
): Promise<R[]> => {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(processor));
        results.push(...batchResults);

        if (delay > 0 && i + batchSize < items.length) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    return results;
};

// Export singleton instances
export const memoryMonitor = MemoryMonitor.getInstance();
export const performanceMetrics = PerformanceMetrics.getInstance();
export const imagePreloader = new ImagePreloader();
export const lazyImageLoader = new LazyImageLoader();
export const cacheManager = new CacheManager();
export const networkOptimizer = new NetworkOptimizer();