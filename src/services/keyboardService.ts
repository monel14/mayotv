// Keyboard shortcuts service for MAYO TV

export interface KeyboardShortcut {
    id: string;
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    description: string;
    action: () => void;
    category: 'navigation' | 'player' | 'search' | 'general';
}

class KeyboardService {
    private static instance: KeyboardService;
    private shortcuts: Map<string, KeyboardShortcut> = new Map();
    private isEnabled = true;

    private constructor() {
        this.setupEventListeners();
    }

    public static getInstance(): KeyboardService {
        if (!KeyboardService.instance) {
            KeyboardService.instance = new KeyboardService();
        }
        return KeyboardService.instance;
    }

    private setupEventListeners(): void {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (!this.isEnabled) return;

        // Don't trigger shortcuts when typing in inputs
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }

        const shortcutKey = this.getShortcutKey(event);
        const shortcut = this.shortcuts.get(shortcutKey);

        if (shortcut) {
            event.preventDefault();
            shortcut.action();
        }
    }

    private getShortcutKey(event: KeyboardEvent): string {
        const parts: string[] = [];
        
        if (event.ctrlKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        
        parts.push(event.key.toLowerCase());
        
        return parts.join('+');
    }

    public register(shortcut: KeyboardShortcut): void {
        const key = this.buildShortcutKey(shortcut);
        this.shortcuts.set(key, { ...shortcut, key });
    }

    public unregister(id: string): void {
        for (const [key, shortcut] of this.shortcuts) {
            if (shortcut.id === id) {
                this.shortcuts.delete(key);
                break;
            }
        }
    }

    private buildShortcutKey(shortcut: KeyboardShortcut): string {
        const parts: string[] = [];
        
        if (shortcut.ctrlKey) parts.push('ctrl');
        if (shortcut.altKey) parts.push('alt');
        if (shortcut.shiftKey) parts.push('shift');
        
        parts.push(shortcut.key.toLowerCase());
        
        return parts.join('+');
    }

    public getShortcuts(): KeyboardShortcut[] {
        return Array.from(this.shortcuts.values());
    }

    public getShortcutsByCategory(category: KeyboardShortcut['category']): KeyboardShortcut[] {
        return this.getShortcuts().filter(shortcut => shortcut.category === category);
    }

    public enable(): void {
        this.isEnabled = true;
    }

    public disable(): void {
        this.isEnabled = false;
    }

    public isShortcutEnabled(): boolean {
        return this.isEnabled;
    }

    public formatShortcut(shortcut: KeyboardShortcut): string {
        const parts: string[] = [];
        
        if (shortcut.ctrlKey) parts.push('Ctrl');
        if (shortcut.altKey) parts.push('Alt');
        if (shortcut.shiftKey) parts.push('Shift');
        
        // Format key name
        const keyName = shortcut.key.length === 1 
            ? shortcut.key.toUpperCase()
            : shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1);
            
        parts.push(keyName);
        
        return parts.join(' + ');
    }
}

// Export singleton instance
export const keyboardService = KeyboardService.getInstance();

// Export singleton instance
export { keyboardService };

// Default shortcuts for MAYO TV
export const registerDefaultShortcuts = (callbacks: {
    onHome: () => void;
    onSearch: () => void;
    onSports: () => void;
    onGuide: () => void;
    onSettings: () => void;
    onFullscreen: () => void;
    onPlayPause: () => void;
    onVolumeUp: () => void;
    onVolumeDown: () => void;
    onMute: () => void;
}): void => {
    const shortcuts: Omit<KeyboardShortcut, 'key'>[] = [
        // Navigation
        {
            id: 'home',
            key: 'h',
            description: 'Aller à l\'accueil',
            action: callbacks.onHome,
            category: 'navigation'
        },
        {
            id: 'search',
            key: 's',
            ctrlKey: true,
            description: 'Rechercher',
            action: callbacks.onSearch,
            category: 'search'
        },
        {
            id: 'sports',
            key: 'f',
            description: 'Section Football & Sports',
            action: callbacks.onSports,
            category: 'navigation'
        },
        {
            id: 'guide',
            key: 'g',
            description: 'Guide TV',
            action: callbacks.onGuide,
            category: 'navigation'
        },
        {
            id: 'settings',
            key: ',',
            ctrlKey: true,
            description: 'Paramètres',
            action: callbacks.onSettings,
            category: 'general'
        },

        // Player controls
        {
            id: 'fullscreen',
            key: 'f',
            description: 'Plein écran',
            action: callbacks.onFullscreen,
            category: 'player'
        },
        {
            id: 'play-pause',
            key: ' ',
            description: 'Lecture/Pause',
            action: callbacks.onPlayPause,
            category: 'player'
        },
        {
            id: 'volume-up',
            key: 'ArrowUp',
            description: 'Volume +',
            action: callbacks.onVolumeUp,
            category: 'player'
        },
        {
            id: 'volume-down',
            key: 'ArrowDown',
            description: 'Volume -',
            action: callbacks.onVolumeDown,
            category: 'player'
        },
        {
            id: 'mute',
            key: 'm',
            description: 'Muet',
            action: callbacks.onMute,
            category: 'player'
        },

        // General
        {
            id: 'escape',
            key: 'Escape',
            description: 'Fermer/Retour',
            action: () => {
                // This will be handled by individual components
            },
            category: 'general'
        }
    ];

    shortcuts.forEach(shortcut => {
        keyboardService.register(shortcut as KeyboardShortcut);
    });
};