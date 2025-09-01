// Advanced caching system for MAYO TV

export interface CacheEntry<T = any> {
    data: T;
    timestamp: number;
    ttl: number;
    hits: number;
    size: number;
}

export interface CacheStats {
    totalEntries: number;
    totalSize: number;
    hitRate: number;
    missRate: number;
    oldestEntry: number;
    newestEntry: number;
}

export interface CacheOptions {
    ttl?: number;
    maxSize?: number;
    maxEntries?: number;
    serialize?: boolean;
    compress?: boolean;
}

class CacheManager {
    private static instance: CacheManager;
    private cache: Map<string, CacheEntry> = new Map();
    private stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0
    };
    private maxSize: number = 50 * 1024 * 1024; // 50MB
    private maxEntries: number = 1000;
    private cleanupInterval: NodeJS.Timeout;

    private constructor() {
        this.startCleanupInterval();
        this.setupStorageListener();
    }

    public static getInstance(): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }

    private startCleanupInterval(): void {
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000); // Cleanup every 5 minutes
    }

    private setupStorageListener(): void {
        // Listen for storage events to sync cache across tabs
        window.addEventListener('storage', (event) => {
            if (event.key?.startsWith('mayo-cache-')) {
                const cacheKey = event.key.replace('mayo-cache-', '');
                if (event.newValue) {
                    try {
                        const entry = JSON.parse(event.newValue);
                        this.cache.set(cacheKey, entry);
                    } catch (error) {
                        console.error('Failed to sync cache entry:', error);
                    }
                } else {
                    this.cache.delete(cacheKey);
                }
            }
        });
    }

    private calculateSize(data: any): number {
        try {
            return new Blob([JSON.stringify(data)]).size;
        } catch {
            return JSON.stringify(data).length * 2; // Rough estimate
        }
    }

    private isExpired(entry: CacheEntry): boolean {
        return Date.now() - entry.timestamp > entry.ttl;
    }

    private evictLRU(): void {
        if (this.cache.size === 0) return;

        // Find least recently used entry (lowest hits)
        let lruKey = '';
        let lruHits = Infinity;

        for (const [key, entry] of this.cache) {
            if (entry.hits < lruHits) {
                lruHits = entry.hits;
                lruKey = key;
            }
        }

        if (lruKey) {
            this.delete(lruKey);
        }
    }

    private enforceConstraints(): void {
        // Remove expired entries first
        this.cleanup();

        // Enforce max entries
        while (this.cache.size > this.maxEntries) {
            this.evictLRU();
        }

        // Enforce max size
        let totalSize = this.getTotalSize();
        while (totalSize > this.maxSize && this.cache.size > 0) {
            this.evictLRU();
            totalSize = this.getTotalSize();
        }
    }

    private getTotalSize(): number {
        let total = 0;
        for (const entry of this.cache.values()) {
            total += entry.size;
        }
        return total;
    }

    private persistToStorage(key: string, entry: CacheEntry): void {
        try {
            localStorage.setItem(`mayo-cache-${key}`, JSON.stringify(entry));
        } catch (error) {
            // Storage full or other error, continue without persisting
            console.warn('Failed to persist cache entry:', error);
        }
    }

    private loadFromStorage(key: string): CacheEntry | null {
        try {
            const stored = localStorage.getItem(`mayo-cache-${key}`);
            if (stored) {
                const entry = JSON.parse(stored);
                if (!this.isExpired(entry)) {
                    return entry;
                } else {
                    localStorage.removeItem(`mayo-cache-${key}`);
                }
            }
        } catch (error) {
            console.warn('Failed to load cache entry from storage:', error);
        }
        return null;
    }

    public set<T>(key: string, data: T, options: CacheOptions = {}): void {
        const ttl = options.ttl || 60 * 60 * 1000; // Default 1 hour
        const size = this.calculateSize(data);
        
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl,
            hits: 0,
            size
        };

        this.cache.set(key, entry);
        this.stats.sets++;

        // Persist to localStorage if requested
        if (options.serialize !== false) {
            this.persistToStorage(key, entry);
        }

        this.enforceConstraints();
    }

    public get<T>(key: string): T | null {
        // Try memory cache first
        let entry = this.cache.get(key);
        
        // If not in memory, try localStorage
        if (!entry) {
            entry = this.loadFromStorage(key);
            if (entry) {
                this.cache.set(key, entry);
            }
        }

        if (!entry) {
            this.stats.misses++;
            return null;
        }

        if (this.isExpired(entry)) {
            this.delete(key);
            this.stats.misses++;
            return null;
        }

        entry.hits++;
        this.stats.hits++;
        return entry.data as T;
    }

    public has(key: string): boolean {
        return this.get(key) !== null;
    }

    public delete(key: string): boolean {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.stats.deletes++;
            try {
                localStorage.removeItem(`mayo-cache-${key}`);
            } catch (error) {
                // Ignore storage errors
            }
        }
        return deleted;
    }

    public clear(): void {
        this.cache.clear();
        
        // Clear localStorage cache entries
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('mayo-cache-')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    public cleanup(): void {
        const expiredKeys: string[] = [];
        
        for (const [key, entry] of this.cache) {
            if (this.isExpired(entry)) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => this.delete(key));
    }

    public getStats(): CacheStats {
        const entries = Array.from(this.cache.values());
        const totalRequests = this.stats.hits + this.stats.misses;
        
        return {
            totalEntries: this.cache.size,
            totalSize: this.getTotalSize(),
            hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0,
            missRate: totalRequests > 0 ? (this.stats.misses / totalRequests) * 100 : 0,
            oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : 0,
            newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : 0
        };
    }

    public getDetailedStats() {
        return {
            ...this.getStats(),
            rawStats: { ...this.stats },
            entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
                key,
                size: entry.size,
                hits: entry.hits,
                age: Date.now() - entry.timestamp,
                ttl: entry.ttl,
                expired: this.isExpired(entry)
            }))
        };
    }

    // Convenience methods for common cache patterns
    public async getOrSet<T>(
        key: string, 
        fetcher: () => Promise<T>, 
        options: CacheOptions = {}
    ): Promise<T> {
        const cached = this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        const data = await fetcher();
        this.set(key, data, options);
        return data;
    }

    public memoize<T extends (...args: any[]) => any>(
        fn: T,
        keyGenerator?: (...args: Parameters<T>) => string,
        options: CacheOptions = {}
    ): T {
        return ((...args: Parameters<T>) => {
            const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
            const cached = this.get(key);
            
            if (cached !== null) {
                return cached;
            }

            const result = fn(...args);
            this.set(key, result, options);
            return result;
        }) as T;
    }

    public invalidatePattern(pattern: RegExp): number {
        let count = 0;
        const keysToDelete: string[] = [];

        for (const key of this.cache.keys()) {
            if (pattern.test(key)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => {
            this.delete(key);
            count++;
        });

        return count;
    }

    public warmup<T>(entries: Array<{ key: string; data: T; options?: CacheOptions }>): void {
        entries.forEach(({ key, data, options }) => {
            this.set(key, data, options);
        });
    }

    public destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.clear();
    }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// React hook for cached data
export const useCachedData = <T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions & { enabled?: boolean } = {}
): {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
} => {
    const [data, setData] = React.useState<T | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const fetchData = React.useCallback(async () => {
        if (options.enabled === false) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await cacheManager.getOrSet(key, fetcher, options);
            setData(result);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [key, fetcher, options]);

    React.useEffect(() => {
        // Check cache first
        const cached = cacheManager.get<T>(key);
        if (cached !== null) {
            setData(cached);
        } else {
            fetchData();
        }
    }, [key, fetchData]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchData
    };
};