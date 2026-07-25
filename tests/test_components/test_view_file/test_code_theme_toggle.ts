import { mount, Wrapper } from '@vue/test-utils';

import Vue from 'vue';

import { CODE_THEME_STORE } from '@/components/view_file/code_theme_store';
import CodeThemeToggle from '@/components/view_file/code_theme_toggle.vue';

const CHECKBOX_SELECTOR = 'input[type="checkbox"]';

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

describe('CodeThemeToggle tests', () => {
    let wrapper: Wrapper<Vue>;

    beforeEach(() => {
        CODE_THEME_STORE.current_code_theme = 'light';
        CODE_THEME_STORE.initialized = false;
        set_system_dark_pref(false);
    });

    afterEach(() => {
        wrapper?.destroy();
    });

    test('Checkbox reflects the current theme', () => {
        CODE_THEME_STORE.initialized = true; // suppress mount-time auto-init
        CODE_THEME_STORE.current_code_theme = 'dark';

        wrapper = mount(CodeThemeToggle);

        const checkbox = wrapper.find(CHECKBOX_SELECTOR).element as HTMLInputElement;
        expect(checkbox.checked).toBe(true);
    });

    test('Test change theme from light', async () => {
        CODE_THEME_STORE.initialized = true;
        CODE_THEME_STORE.current_code_theme = 'light';

        wrapper = mount(CodeThemeToggle);

        await wrapper.find(CHECKBOX_SELECTOR).trigger('change');
        expect(CODE_THEME_STORE.current_code_theme).toBe('dark');
    });

    test('Test change theme from dark', async () => {
        CODE_THEME_STORE.initialized = true;
        CODE_THEME_STORE.current_code_theme = 'dark';

        wrapper = mount(CodeThemeToggle);

        await wrapper.find(CHECKBOX_SELECTOR).trigger('change');
        expect(CODE_THEME_STORE.current_code_theme).toBe('light');
    });

    test('Initializes to dark when the OS prefers dark', () => {
        set_system_dark_pref(true);

        wrapper = mount(CodeThemeToggle);

        expect(CODE_THEME_STORE.current_code_theme).toBe('dark');
    });

    test('Initializes to light when the OS prefers light', () => {
        set_system_dark_pref(false);

        wrapper = mount(CodeThemeToggle);

        expect(CODE_THEME_STORE.current_code_theme).toBe('light');
    });
});
