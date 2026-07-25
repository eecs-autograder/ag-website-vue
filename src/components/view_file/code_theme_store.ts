import Vue from "vue";

type CodeTheme = "light" | "dark";

export const CODE_THEME_STORE = Vue.observable({
  current_code_theme: "light" as CodeTheme, // default
  initialized: false,
});

export function set_code_theme(code_theme: CodeTheme) {
  CODE_THEME_STORE.current_code_theme = code_theme;
}

// Seeds the initial theme from the OS color-scheme preference, but only once
// per session so it doesn't overwrite a manual toggle when the component
// remounts (e.g. navigating between submissions).
export function init_code_theme_from_system() {
  if (CODE_THEME_STORE.initialized) {
    return;
  }
  CODE_THEME_STORE.initialized = true;

  const prefers_dark =
    window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  set_code_theme(prefers_dark ? "dark" : "light");
}
