<template>
  <div
    ref="root"
    tabindex="-1"
    class="context-menu-container"
    v-show="is_open"
    @blur="hide_context_menu"
    @keydown.esc="hide_context_menu"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue";

interface MenuCoordinates {
  x: number;
  y: number;
}

const props = defineProps<{
  coordinates: MenuCoordinates;
  is_open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const root = ref<HTMLElement | null>(null);

function hide_context_menu() {
  emit("close");
}

watch(
  () => props.is_open,
  (is_open) => {
    if (!is_open) {
      return;
    }

    // Wait for v-show to make the element visible before measuring and
    // focusing it: focus() is a no-op on a `display: none` element, and the
    // ESC-to-close handler needs the element focused.
    nextTick(() => {
      const el = root.value;
      if (el === null) {
        return;
      }

      el.style.left = "0px";
      el.style.top = "0px";
      const height = el.clientHeight;
      const width = el.clientWidth;

      let left = props.coordinates.x;
      let top = props.coordinates.y;
      if (left + width > document.body.clientWidth) {
        left = left - width - 5;
      }
      if (top + height > document.body.clientHeight) {
        top = top - height - 5;
      }

      el.style.left = `${left}px`;
      el.style.top = `${top}px`;

      el.focus();
    });
  },
);
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";

.context-menu-container {
  background-color: white;
  border: 1px solid lighten($baking-pan, 50%);
  border-radius: 2px;
  box-shadow: 0 0 15px opacify(lighten($baking-pan, 50%), 0.2);
  position: absolute;
  z-index: 1;

  min-width: 100px;
  min-height: 20px;
}

.context-menu-container:focus {
  outline: none;
}
</style>
