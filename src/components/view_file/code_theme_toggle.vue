<template>
  <!-- <div class="code-theme-toggle"> -->
    <label class="switch">
      <input type="checkbox" :checked="is_code_theme_dark" @change="switch_code_theme" />
      <span class="slider round">
        <i class="fas fa-moon"></i>
        <i class="fas fa-sun"></i>
      </span>
    </label>
  <!-- </div> -->
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';

import { handle_global_errors_async } from '@/error_handling';
import { Created } from '@/lifecycle';

import { CODE_THEME_STORE, set_code_theme } from './code_theme_store';

const CODE_LIGHT_THEME_NAME = 'github';
const CODE_DARK_THEME_NAME = 'tokyo-night-dark';
const HLJS_LINK_ID = 'hljs-code-theme';

@Component
export default class CodeThemeToggle extends Vue implements Created {
  @handle_global_errors_async
  async created() {
    this.init_hljs();
  }

  // Let us have an updated state even when another toggle instance is changed
  private get is_code_theme_dark() {
    return CODE_THEME_STORE.current_code_theme === 'dark';
  }

  private init_hljs() {
    // Check if style link already exists
    const code_theme_elt = document.getElementById(HLJS_LINK_ID);
    if (code_theme_elt !== null) {
      return;
    }

    // Determine initial theme based on user's system preference
    const is_init_theme_dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme_name = is_init_theme_dark ? 'dark' : 'light';
    set_code_theme(theme_name);

    // Add link
    const created_link = document.createElement('link');
    created_link.rel = 'stylesheet';
    created_link.id = HLJS_LINK_ID;
    created_link.setAttribute('data-theme', theme_name);
    document.head.appendChild(created_link);

    this.update_hljs_theme();
  }

  private switch_code_theme() {
    const curr_theme = CODE_THEME_STORE.current_code_theme;
    if (curr_theme === 'light') {
      set_code_theme('dark');
    }
    else {
      set_code_theme('light');
    }

    this.update_hljs_theme();
  }

  // Get the CDN url for the specified highlight.js theme
  private get_hljs_cdn_theme_link(theme: string) {
    return `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${theme}.min.css`;
  }

  // Uses currently set hljs theme to make sure link tag is up-to-date
  private update_hljs_theme() {
    const link_elt = <HTMLLinkElement> document.getElementById(HLJS_LINK_ID);

    if (CODE_THEME_STORE.current_code_theme === 'dark') {
      link_elt.href = this.get_hljs_cdn_theme_link(CODE_DARK_THEME_NAME);
      link_elt.setAttribute('data-theme', 'dark');
    }
    else {
      link_elt.href = this.get_hljs_cdn_theme_link(CODE_LIGHT_THEME_NAME);
      link_elt.setAttribute('data-theme', 'light');
    }
  }
}

</script>

<style scoped lang="scss">
@use 'sass:math';

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
  transition: .4s;

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
  transition: .4s;

  z-index: 1;
}

input:checked + .slider {
  background-color: #1a1b26; // Matches hljs dark mode bg
}

input:checked + .slider:before {
  transform: translateX($width - $height);
}

.slider.round {
  border-radius: $height;
}

.slider.round:before {
  border-radius: 50%;
}

</style>
@/components/view_file/code_theme_store