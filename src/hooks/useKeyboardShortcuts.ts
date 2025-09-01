import { useEffect } from 'react';
import { keyboardService, type KeyboardShortcut } from '../services/keyboardService';

export const useKeyboardShortcuts = (shortcuts: Omit<KeyboardShortcut, 'key'>[]): void => {
    useEffect(() => {
        // Register shortcuts
        shortcuts.forEach(shortcut => {
            keyboardService.register(shortcut as KeyboardShortcut);
        });

        // Cleanup on unmount
        return () => {
            shortcuts.forEach(shortcut => {
                keyboardService.unregister(shortcut.id);
            });
        };
    }, [shortcuts]);
};