import { mount, Wrapper } from '@vue/test-utils';

import * as sinon from 'sinon';

import * as code_theme_store from '@/code_theme_store';
import CodeThemeToggle from '@/components/code_theme_toggle.vue';

const HLJS_LINK_SELECTOR = '#hljs-code-theme';
const CHECKBOX_SELECTOR = 'input[type="checkbox"]';

describe('CodeThemeToggle tests', () => {
    let wrapper: Wrapper<CodeThemeToggle>;
    let set_code_theme_mock: sinon.SinonStub;

    beforeEach(async () => {
        set_code_theme_mock = sinon.stub(code_theme_store, 'set_code_theme');
    });

    afterEach(async () => {
        set_code_theme_mock.reset();

        // Remove whatever link tags was inserted during the test
        document.head.querySelector(HLJS_LINK_SELECTOR)?.remove();
    });

    describe('Test default themes', () => {
        const set_user_pref_dark_mode = (is_pref_dark: boolean) => {
            // See bottom of https://jestjs.io/docs/manual-mocks
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: jest.fn().mockImplementation(query => ({
                    matches: is_pref_dark,
                    media: query,
                    onchange: null,
                    addListener: jest.fn(), // deprecated
                    removeListener: jest.fn(), // deprecated
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn(),
                })),
            });
        };

        test('User preference is dark theme', async () => {
            set_user_pref_dark_mode(true);

            wrapper = mount(CodeThemeToggle);

            expect(set_code_theme_mock.callCount).toBe(1);
            expect(set_code_theme_mock.getCall(0).args[0]).toBe('dark');
        });

        test('User preference is light theme', async () => {
            set_user_pref_dark_mode(false);

            wrapper = mount(CodeThemeToggle);

            expect(set_code_theme_mock.calledOnce).toBe(true);
            expect(set_code_theme_mock.getCall(0).args[0]).toBe('light');
        });
    });

    test('Multiple instances only create one link tag', async () => {
        // Mount 2 components
        mount(CodeThemeToggle);
        mount(CodeThemeToggle);

        expect(document.querySelectorAll(HLJS_LINK_SELECTOR).length).toBe(1);
    });

    test('Test change theme from light', async () => {
        const code_theme_mock = sinon.stub(
            code_theme_store.CODE_THEME_STORE,
            'current_code_theme'
        );
        code_theme_mock.get(() => 'light');

        wrapper = mount(CodeThemeToggle);
        expect(wrapper.find(CHECKBOX_SELECTOR).exists()).toBe(true);

        set_code_theme_mock.reset(); // set to only track update
        await wrapper.find(CHECKBOX_SELECTOR).trigger('change');
        expect(set_code_theme_mock.callCount).toBe(1);
        expect(set_code_theme_mock.getCall(0).args[0]).toBe('dark');
    });

    test('Test change theme from dark', async () => {
        const code_theme_mock = sinon.stub(
            code_theme_store.CODE_THEME_STORE,
            'current_code_theme'
        );
        code_theme_mock.get(() => 'dark');

        wrapper = mount(CodeThemeToggle);
        expect(wrapper.find(CHECKBOX_SELECTOR).exists()).toBe(true);

        set_code_theme_mock.reset(); // set to only track update
        await wrapper.find(CHECKBOX_SELECTOR).trigger('change');
        expect(set_code_theme_mock.callCount).toBe(1);
        expect(set_code_theme_mock.getCall(0).args[0]).toBe('light');
    });
});
