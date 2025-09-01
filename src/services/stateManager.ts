// Global state management for MAYO TV
import { useState, useEffect } from 'react';

export interface AppState {
    // UI State
    ui: {
        sidebarOpen: boolean;
        sidebarCollapsed: boolean;
        currentView: string;
        isLoading: boolean;
        searchQuery: string;
        selectedFilters: {
            country?: string;
            category?: string;
            language?: string;
        };
    };

    // Player State
    player: {
        currentChannel: any | null;
        isPlaying: boolean;
        volume: number;
        isMuted: boolean;
        isFullscreen: boolean;
        playbackHistory: any[];
    };

    // User Preferences
    preferences: {
        theme: string;
        language: string;
        autoPlay: boolean;
        notifications: boolean;
        favoriteChannels: string[];
        recentChannels: string[];
    };

    // Performance
    performance: {
        metrics: Record<string, any>;
        memoryUsage: number;
        fps: number;
        networkSpeed: number;
    };
}

type StateListener<T = AppState> = (state: T) => void;
type StateUpdater<T = AppState> = (state: T) => Partial<T>;

class StateManager {
    private static instance: StateManager;
    private state: AppState;
    private listeners: StateListener[] = [];

    private constructor() {
        this.state = this.getInitialState();
        this.loadPersistedState();
    }

    public static getInstance(): StateManager {
        if (!StateManager.instance) {
            StateManager.instance = new StateManager();
        }
        return StateManager.instance;
    }

    private getInitialState(): AppState {
        return {
            ui: {
                sidebarOpen: false,
                sidebarCollapsed: false,
                currentView: 'home',
                isLoading: false,
                searchQuery: '',
                selectedFilters: {}
            },
            player: {
                currentChannel: null,
                isPlaying: false,
                volume: 1,
                isMuted: false,
                isFullscreen: false,
                playbackHistory: []
            },
            preferences: {
                theme: 'auto',
                language: 'fr',
                autoPlay: false,
                notifications: true,
                favoriteChannels: [],
                recentChannels: []
            },
            performance: {
                metrics: {},
                memoryUsage: 0,
                fps: 60,
                networkSpeed: 0
            }
        };
    }

    private loadPersistedState(): void {
        try {
            const saved = localStorage.getItem('mayo-tv-state');
            if (saved) {
                const parsedState = JSON.parse(saved);
                // Only restore preferences and some UI state
                this.state = {
                    ...this.state,
                    preferences: { ...this.state.preferences, ...parsedState.preferences },
                    ui: {
                        ...this.state.ui,
                        sidebarCollapsed: parsedState.ui?.sidebarCollapsed ?? this.state.ui.sidebarCollapsed
                    }
                };
            }
        } catch (error) {
            console.error('Failed to load persisted state:', error);
        }
    }

    private persistState(): void {
        try {
            const stateToPersist = {
                preferences: this.state.preferences,
                ui: {
                    sidebarCollapsed: this.state.ui.sidebarCollapsed
                }
            };
            localStorage.setItem('mayo-tv-state', JSON.stringify(stateToPersist));
        } catch (error) {
            console.error('Failed to persist state:', error);
        }
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.state));
    }

    public getState(): AppState {
        return { ...this.state };
    }

    public setState(updater: StateUpdater | Partial<AppState>): void {
        const update = typeof updater === 'function' ? updater(this.state) : updater;
        this.state = this.deepMerge(this.state, update);
        this.persistState();
        this.notifyListeners();
    }

    public updateUI(updates: Partial<AppState['ui']>): void {
        this.setState({
            ui: { ...this.state.ui, ...updates }
        });
    }

    public updatePlayer(updates: Partial<AppState['player']>): void {
        this.setState({
            player: { ...this.state.player, ...updates }
        });
    }

    public updatePreferences(updates: Partial<AppState['preferences']>): void {
        this.setState({
            preferences: { ...this.state.preferences, ...updates }
        });
    }

    public updatePerformance(updates: Partial<AppState['performance']>): void {
        this.setState({
            performance: { ...this.state.performance, ...updates }
        });
    }

    private deepMerge(target: any, source: any): any {
        const result = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }

    public subscribe(listener: StateListener): () => void {
        this.listeners.push(listener);
        listener(this.state); // Call immediately with current state

        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    // Convenience methods for common state updates
    public setCurrentView(view: string): void {
        this.updateUI({ currentView: view });
    }

    public setLoading(isLoading: boolean): void {
        this.updateUI({ isLoading });
    }

    public setSearchQuery(searchQuery: string): void {
        this.updateUI({ searchQuery });
    }

    public setSidebarOpen(sidebarOpen: boolean): void {
        this.updateUI({ sidebarOpen });
    }

    public setSidebarCollapsed(sidebarCollapsed: boolean): void {
        this.updateUI({ sidebarCollapsed });
    }

    public setCurrentChannel(channel: any): void {
        // Add to recent channels
        const recentChannels = [
            channel.url,
            ...this.state.preferences.recentChannels.filter(url => url !== channel.url)
        ].slice(0, 10);

        this.updatePlayer({ currentChannel: channel });
        this.updatePreferences({ recentChannels });
    }

    public setPlayerState(playerState: Partial<AppState['player']>): void {
        this.updatePlayer(playerState);
    }

    public addToFavorites(channelUrl: string): void {
        const favoriteChannels = [...this.state.preferences.favoriteChannels];
        if (!favoriteChannels.includes(channelUrl)) {
            favoriteChannels.push(channelUrl);
            this.updatePreferences({ favoriteChannels });
        }
    }

    public removeFromFavorites(channelUrl: string): void {
        const favoriteChannels = this.state.preferences.favoriteChannels.filter(url => url !== channelUrl);
        this.updatePreferences({ favoriteChannels });
    }

    public updatePerformanceMetrics(metrics: Partial<AppState['performance']>): void {
        this.updatePerformance(metrics);
    }

    public setFilters(filters: AppState['ui']['selectedFilters']): void {
        this.updateUI({ selectedFilters: filters });
    }

    public clearFilters(): void {
        this.updateUI({
            selectedFilters: {},
            searchQuery: ''
        });
    }

    // Selectors
    public isFavorite(channelUrl: string): boolean {
        return this.state.preferences.favoriteChannels.includes(channelUrl);
    }

    public getRecentChannels(): string[] {
        return this.state.preferences.recentChannels;
    }

    public getFavoriteChannels(): string[] {
        return this.state.preferences.favoriteChannels;
    }

    public getCurrentFilters(): AppState['ui']['selectedFilters'] {
        return this.state.ui.selectedFilters;
    }

    // Reset methods
    public resetPlayerState(): void {
        this.updatePlayer({
            currentChannel: null,
            isPlaying: false,
            isFullscreen: false
        });
    }

    public resetUIState(): void {
        const initialUI = this.getInitialState().ui;
        this.updateUI({
            ...initialUI,
            sidebarCollapsed: this.state.ui.sidebarCollapsed // Preserve sidebar state
        });
    }

    public exportState(): string {
        return JSON.stringify(this.state, null, 2);
    }

    public importState(stateJson: string): boolean {
        try {
            const importedState = JSON.parse(stateJson);
            this.setState(importedState);
            return true;
        } catch (error) {
            console.error('Failed to import state:', error);
            return false;
        }
    }
}

// Export singleton instance
export const stateManager = StateManager.getInstance();

// React hook for state management
export const useAppState = <T = AppState>(selector?: (state: AppState) => T): T extends AppState ? AppState : T => {
    const [state, setState] = useState(() =>
        selector ? selector(stateManager.getState()) : stateManager.getState()
    );

    useEffect(() => {
        return stateManager.subscribe((newState) => {
            const selectedState = selector ? selector(newState) : newState;
            setState(selectedState as any);
        });
    }, [selector]);

    return state as any;
};

// Specific hooks for common state slices
export const useUIState = () => useAppState(state => state.ui);
export const usePlayerState = () => useAppState(state => state.player);
export const usePreferences = () => useAppState(state => state.preferences);
export const usePerformanceState = () => useAppState(state => state.performance);