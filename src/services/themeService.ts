// Theme service for MAYO TV

export type ThemeMode = 'light' | 'dark' | 'auto';
export type AccentColor = 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'pink';

export interface Theme {
    mode: ThemeMode;
    accent: AccentColor;
    fontSize: 'small' | 'medium' | 'large';
    reducedMotion: boolean;
    highContrast: boolean;
}

export interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
}

const THEME_STORAGE_KEY = 'mayo-tv-theme';

const accentColors: Record<AccentColor, { light: string; dark: string }> = {
    blue: { light: '#3b82f6', dark: '#60a5fa' },
    green: { light: '#10b981', dark: '#34d399' },
    purple: { light: '#8b5cf6', dark: '#a78bfa' },
    red: { light: '#ef4444', dark: '#f87171' },
    orange: { light: '#f59e0b', dark: '#fbbf24' },
    pink: { light: '#ec4899', dark: '#f472b6' }
};

const lightTheme: ThemeColors = {
    primary: '#3b82f6',
    secondary: '#1e40af',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
};

const darkTheme: ThemeColors = {
    primary: '#60a5fa',
    secondary: '#3b82f6',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    border: '#374151',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171'
};

class ThemeService {
    private static instance: ThemeService;
    private theme: Theme;
    private callbacks: ((theme: Theme, colors: ThemeColors) => void)[] = [];

    private constructor() {
        this.theme = this.loadTheme();
        this.applyTheme();
        this.setupSystemThemeListener();
    }

    public static getInstance(): ThemeService {
        if (!ThemeService.instance) {
            ThemeService.instance = new ThemeService();
        }
        return ThemeService.instance;
    }

    private loadTheme(): Theme {
        try {
            const saved = localStorage.getItem(THEME_STORAGE_KEY);
            if (saved) {
                return { ...this.getDefaultTheme(), ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Failed to load theme:', error);
        }
        return this.getDefaultTheme();
    }

    private getDefaultTheme(): Theme {
        return {
            mode: 'auto',
            accent: 'blue',
            fontSize: 'medium',
            reducedMotion: false,
            highContrast: false
        };
    }

    private saveTheme(): void {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(this.theme));
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    }

    private setupSystemThemeListener(): void {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
            if (this.theme.mode === 'auto') {
                this.applyTheme();
                this.notifyCallbacks();
            }
        });

        // Listen for reduced motion preference
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        motionQuery.addEventListener('change', (e) => {
            this.theme.reducedMotion = e.matches;
            this.applyTheme();
            this.notifyCallbacks();
        });

        // Listen for high contrast preference
        const contrastQuery = window.matchMedia('(prefers-contrast: high)');
        contrastQuery.addEventListener('change', (e) => {
            this.theme.highContrast = e.matches;
            this.applyTheme();
            this.notifyCallbacks();
        });
    }

    private getEffectiveMode(): 'light' | 'dark' {
        if (this.theme.mode === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return this.theme.mode;
    }

    private applyTheme(): void {
        const mode = this.getEffectiveMode();
        const colors = this.getThemeColors();
        const root = document.documentElement;

        // Apply CSS custom properties
        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });

        // Apply theme class
        root.classList.remove('light', 'dark');
        root.classList.add(mode);

        // Apply font size
        root.classList.remove('text-small', 'text-medium', 'text-large');
        root.classList.add(`text-${this.theme.fontSize}`);

        // Apply motion preference
        if (this.theme.reducedMotion) {
            root.classList.add('reduce-motion');
        } else {
            root.classList.remove('reduce-motion');
        }

        // Apply contrast preference
        if (this.theme.highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }

        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', colors.primary);
        }
    }

    private getThemeColors(): ThemeColors {
        const mode = this.getEffectiveMode();
        const baseColors = mode === 'dark' ? { ...darkTheme } : { ...lightTheme };
        
        // Apply accent color
        const accentColor = accentColors[this.theme.accent];
        baseColors.primary = accentColor[mode];
        
        // Adjust for high contrast
        if (this.theme.highContrast) {
            if (mode === 'dark') {
                baseColors.text = '#ffffff';
                baseColors.background = '#000000';
                baseColors.border = '#ffffff';
            } else {
                baseColors.text = '#000000';
                baseColors.background = '#ffffff';
                baseColors.border = '#000000';
            }
        }

        return baseColors;
    }

    private notifyCallbacks(): void {
        const colors = this.getThemeColors();
        this.callbacks.forEach(callback => callback(this.theme, colors));
    }

    // Public API
    public getTheme(): Theme {
        return { ...this.theme };
    }

    public getColors(): ThemeColors {
        return this.getThemeColors();
    }

    public setMode(mode: ThemeMode): void {
        this.theme.mode = mode;
        this.saveTheme();
        this.applyTheme();
        this.notifyCallbacks();
    }

    public setAccent(accent: AccentColor): void {
        this.theme.accent = accent;
        this.saveTheme();
        this.applyTheme();
        this.notifyCallbacks();
    }

    public setFontSize(fontSize: Theme['fontSize']): void {
        this.theme.fontSize = fontSize;
        this.saveTheme();
        this.applyTheme();
        this.notifyCallbacks();
    }

    public setReducedMotion(reducedMotion: boolean): void {
        this.theme.reducedMotion = reducedMotion;
        this.saveTheme();
        this.applyTheme();
        this.notifyCallbacks();
    }

    public setHighContrast(highContrast: boolean): void {
        this.theme.highContrast = highContrast;
        this.saveTheme();
        this.applyTheme();
        this.notifyCallbacks();
    }

    public subscribe(callback: (theme: Theme, colors: ThemeColors) => void): () => void {
        this.callbacks.push(callback);
        // Immediately call with current theme
        callback(this.theme, this.getThemeColors());
        
        return () => {
            this.callbacks = this.callbacks.filter(cb => cb !== callback);
        };
    }

    public exportTheme(): string {
        return JSON.stringify(this.theme, null, 2);
    }

    public importTheme(themeJson: string): boolean {
        try {
            const importedTheme = JSON.parse(themeJson);
            this.theme = { ...this.getDefaultTheme(), ...importedTheme };
            this.saveTheme();
            this.applyTheme();
            this.notifyCallbacks();
            return true;
        } catch (error) {
            console.error('Failed to import theme:', error);
            return false;
        }
    }

    public resetTheme(): void {
        this.theme = this.getDefaultTheme();
        this.saveTheme();
        this.applyTheme();
        this.notifyCallbacks();
    }
}

// Export singleton instance
export const themeService = ThemeService.getInstance();