<template>
  <transition name="modal">
    <div
      class="modal-mask"
      @click.self="
        () => {
          click_outside_to_close ? $emit('close') : null;
        }
      "
      @keydown.esc="$emit('close')"
    >
      <div
        ref="container"
        class="modal-container"
        :class="size"
        :style="custom_width ? { width: custom_width } : ''"
        role="dialog"
        aria-modal="true"
        :aria-label="aria_label"
        :aria-labelledby="aria_labelledby"
        :aria-describedby="aria_describedby"
        tabindex="-1"
      >
        <slot></slot>
        <button
          v-if="include_closing_x"
          type="button"
          class="close-button unstyled-button"
          @click="$emit('close')"
          aria-label="Close dialog"
        >
          &#10005;
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { use_focus_trap } from "@/composables/use_focus_trap";
import { assert_not_null } from "@/utils";

// Props
type PropTypes = {
  click_outside_to_close?: boolean;
  include_closing_x?: boolean;
  size?: string;
  custom_width?: string;
  // It is required to define exactly one of aria_label and aria_labelledby.
  // When we migrate to vue 3.3+, we can enforce this with a union type.
  aria_label?: string;
  aria_labelledby?: string;
  aria_describedby?: string;
  /**
   * CSS selector, resolved within the modal, for the element to focus when
   * the modal opens. Defaults to the first tabbable element. The target must
   * be focusable (e.g., a heading needs `tabindex="-1"`); otherwise focus
   * falls back to the default.
   */
  initial_focus?: string;
};

const props = withDefaults(defineProps<PropTypes>(), {
  click_outside_to_close: false,
  include_closing_x: true,
  size: "large",
});

// Emits
const emit = defineEmits<{
  close: [];
}>();

const container = ref<HTMLElement | null>(null);

function get_container() {
  const element = container.value;
  assert_not_null(element);
  return element;
}

function get_initial_focus() {
  if (props.initial_focus === undefined) {
    return undefined;
  }
  const element = get_container().querySelector<HTMLElement>(
    props.initial_focus,
  );
  assert_not_null(
    element,
    `initial_focus "${props.initial_focus}" matched no element`,
  );
  return element;
}

use_focus_trap(container, {
  initialFocus: get_initial_focus,
  // If no focusable elements in the modal, focus the modal itself.
  fallbackFocus: get_container,

  // Escape and outside clicks are handled above.
  escapeDeactivates: false,
  allowOutsideClick: true,
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "@/styles/button_styles.scss";
@import "@/styles/colors.scss";

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: block;
  transition: opacity 0.3s ease;
}

.modal-container {
  /* Center in middle of screen */
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);

  padding: 1rem;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;

  max-height: 80%;
  overflow: auto;
}

.small {
  width: 35%;

  @media only screen and (min-width: 700px) {
    width: 25%;
  }

  @media only screen and (min-width: 900px) {
    width: 15%;
  }
}

.medium {
  width: 55%;

  @media only screen and (min-width: 700px) {
    width: 45%;
  }

  @media only screen and (min-width: 900px) {
    width: 35%;
  }
}

.large {
  width: 90%;

  @media only screen and (min-width: 700px) {
    width: 70%;
  }

  @media only screen and (min-width: 900px) {
    width: 60%;
    max-width: 700px;
  }
}

.close-button {
  position: absolute;
  top: 4px;
  right: 4px;

  font-size: 1.25rem;
  line-height: 1;

  &:hover {
    color: darken($stormy-gray-dark, 15%);
  }
}

/* Transition styles */
.modal-enter,
.modal-leave-active {
  opacity: 0;
}
</style>
