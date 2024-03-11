import { CODE_THEME_STORE, set_code_theme } from '@/code_theme_store';

describe('CodeThemeStore Tests', () => {
    beforeEach(() => {
        // Reset CODE_THEME_STORE to its default state before each test
        CODE_THEME_STORE.current_code_theme = 'light';
    });

    test('Default code theme is light', () => {
        expect(CODE_THEME_STORE.current_code_theme).toBe('light');
    });

    test('Setting code theme to dark', () => {
        set_code_theme('dark');
        expect(CODE_THEME_STORE.current_code_theme).toBe('dark');
    });

    test('Setting code theme to light', () => {
        set_code_theme('dark'); // Set to dark first
        set_code_theme('light');
        expect(CODE_THEME_STORE.current_code_theme).toBe('light');
    });
});
