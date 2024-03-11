import Vue from 'vue';

type CodeTheme = 'light' | 'dark';

export const CODE_THEME_STORE = Vue.observable({
    current_code_theme: 'light' as CodeTheme, // default
});

export function set_code_theme(code_theme: CodeTheme) {
    CODE_THEME_STORE.current_code_theme = code_theme;
}
