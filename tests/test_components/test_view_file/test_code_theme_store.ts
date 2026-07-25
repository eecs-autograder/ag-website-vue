import {
    CODE_THEME_STORE,
    init_code_theme_from_system,
    set_code_theme,
} from '@/components/view_file/code_theme_store';

function set_system_dark_pref(is_dark: boolean) {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
            matches: is_dark,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
}

describe('CodeThemeStore Tests', () => {
    beforeEach(() => {
        CODE_THEME_STORE.current_code_theme = 'light';
        CODE_THEME_STORE.initialized = false;
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

    test('init_code_theme_from_system picks dark when the OS prefers dark', () => {
        set_system_dark_pref(true);
        init_code_theme_from_system();
        expect(CODE_THEME_STORE.current_code_theme).toBe('dark');
    });

    test('init_code_theme_from_system picks light when the OS prefers light', () => {
        set_system_dark_pref(false);
        init_code_theme_from_system();
        expect(CODE_THEME_STORE.current_code_theme).toBe('light');
    });

    test('init_code_theme_from_system only applies once per session', () => {
        set_system_dark_pref(false);
        init_code_theme_from_system();

        set_system_dark_pref(true);
        init_code_theme_from_system();

        expect(CODE_THEME_STORE.current_code_theme).toBe('light');
    });
});
