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
import {
  CODE_THEME_STORE,
  set_code_theme,
  init_code_theme_from_system,
} from "./code_theme_store";

const is_code_theme_dark = computed(
  () => CODE_THEME_STORE.current_code_theme === "dark",
);

const switch_code_theme = () => {
  set_code_theme(is_code_theme_dark.value ? "light" : "dark");
};

onMounted(() => {
  init_code_theme_from_system();
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
  background-color: hsl(0, 0%, 17%); // Matches a11y-dark bg
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
