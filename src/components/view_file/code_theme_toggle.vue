<template>
  <label class="switch">
    <input
      type="checkbox"
      :checked="is_code_theme_dark"
      @change="switch_code_theme"
      aria-label="Toggle highlighting theme"
    />
    <span class="slider round">
      <i class="fas fa-moon" role="img" aria-label="Dark mode"></i>
      <i class="fas fa-sun" role="img" aria-label="Light mode"></i>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { new_handle_global_errors_async } from "@/error_handling";
import { CODE_THEME_STORE, set_code_theme } from "./code_theme_store";

const CODE_LIGHT_THEME_NAME = "github";
const CODE_DARK_THEME_NAME = "tokyo-night-dark";
const HLJS_LINK_ID = "hljs-code-theme";

// Computed properties
const is_code_theme_dark = computed(() => {
  return CODE_THEME_STORE.current_code_theme === "dark";
});

// Methods
const init_hljs = () => {
  // Check if style link already exists
  const code_theme_elt = document.getElementById(HLJS_LINK_ID);
  if (code_theme_elt !== null) {
    return;
  }

  // Determine initial theme based on user's system preference
  const is_init_theme_dark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  const theme_name = is_init_theme_dark ? "dark" : "light";
  set_code_theme(theme_name);

  // Add link
  const created_link = document.createElement("link");
  created_link.rel = "stylesheet";
  created_link.id = HLJS_LINK_ID;
  created_link.setAttribute("data-theme", theme_name);
  document.head.appendChild(created_link);

  update_hljs_theme();
};

const switch_code_theme = () => {
  const curr_theme = CODE_THEME_STORE.current_code_theme;
  if (curr_theme === "light") {
    set_code_theme("dark");
  } else {
    set_code_theme("light");
  }

  update_hljs_theme();
};

// Get the CDN url for the specified highlight.js theme
const get_hljs_cdn_theme_link = (theme: string) => {
  return `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${theme}.min.css`;
};

// Uses currently set hljs theme to make sure link tag is up-to-date
const update_hljs_theme = () => {
  const link_elt = document.getElementById(HLJS_LINK_ID) as HTMLLinkElement;

  // Add null check to prevent the error
  if (!link_elt) {
    console.warn(`Element with ID '${HLJS_LINK_ID}' not found`);
    return;
  }

  if (CODE_THEME_STORE.current_code_theme === "dark") {
    link_elt.href = get_hljs_cdn_theme_link(CODE_DARK_THEME_NAME);
    link_elt.setAttribute("data-theme", "dark");
  } else {
    link_elt.href = get_hljs_cdn_theme_link(CODE_LIGHT_THEME_NAME);
    link_elt.setAttribute("data-theme", "light");
  }
};

// Lifecycle - wrap with error handling
const initialize = new_handle_global_errors_async(() => {
  init_hljs();
  return Promise.resolve();
});

onMounted(() => {
  void initialize();
});
</script>

<style scoped lang="scss">
@use "sass:math";

$width: 45px;
$height: 26px;
$padding-amt: 4px;

// This is just the boilerplate selectors for a toggle
.switch {
  position: relative;
  display: inline-block;
  width: $width;
  height: $height;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;

  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $padding-amt;
}

.slider i {
  color: white;
}

.slider:before {
  position: absolute;
  content: "";
  height: $height - 2 * $padding-amt;
  width: $height - 2 * $padding-amt;
  left: $padding-amt;
  bottom: $padding-amt;
  background-color: white;
  transition: 0.4s;

  z-index: 1;
}

input:checked + .slider {
  background-color: #1a1b26; // Matches hljs dark mode bg
}

input:checked + .slider:before {
  transform: translateX($width - $height);
}

input:focus + .slider:before {
  outline: medium auto currentColor;
  outline: medium auto invert;
}

.slider.round {
  border-radius: $height;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
