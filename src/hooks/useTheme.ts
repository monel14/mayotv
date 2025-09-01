import { useState, useEffect } from 'react';
import { themeService, type Theme, type ThemeColors } from '../services/themeService';

export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>(themeService.getTheme());
    const [colors, setColors] = useState<ThemeColors>(themeService.getColors());

    useEffect(() => {
        return themeService.subscribe((newTheme, newColors) => {
            setTheme(newTheme);
            setColors(newColors);
        });
    }, []);

    return {
        theme,
        colors,
        setMode: themeService.setMode.bind(themeService),
        setAccent: themeService.setAccent.bind(themeService),
        setFontSize: themeService.setFontSize.bind(themeService),
        setReducedMotion: themeService.setReducedMotion.bind(themeService),
        setHighContrast: themeService.setHighContrast.bind(themeService),
        exportTheme: themeService.exportTheme.bind(themeService),
        importTheme: themeService.importTheme.bind(themeService),
        resetTheme: themeService.resetTheme.bind(themeService)
    };
};