<template>
  <div class="context-menu-mask" v-show="is_open" @click.self="$emit('close')">
    <menu
      ref="root"
      class="context-menu-container"
      tabindex="0"
      :aria-activedescendant="active_descendent_id"
      @keydown.enter="broadcast_item_activated_with_keyboard"
      @keydown.space.prevent="broadcast_item_activated_with_keyboard"
      @keydown.tab.exact="$emit('close')"
      @keydown.tab.shift="$emit('close')"
      @keydown.esc="$emit('close')"
      @keydown.right.prevent.stop="focus_next_item"
      @keydown.down.prevent.stop="focus_next_item"
      @keydown.left.prevent.stop="focus_prev_item"
      @keydown.up.prevent.stop="focus_prev_item"
    >
      <!--
        Items rendered in this slot must stay mounted for the lifetime
        of the menu and not be reordered.
      -->
      <slot></slot>
    </menu>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch, provide } from "vue";

interface MenuCoordinates {
  x: number;
  y: number;
}

interface MenuItem {
  id: string;
  update_item_activated_with_keyboard: () => unknown;
}

const props = defineProps<{
  coordinates: MenuCoordinates;
  is_open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const active_index = ref(0);

const root = ref<HTMLElement | null>(null);

const items = ref<MenuItem[]>([]);

provide(
  "register",
  (id: string, update_item_activated_with_keyboard: () => unknown) => {
    items.value.push({ id, update_item_activated_with_keyboard });
  },
);
const active_descendent_id = computed(() => {
  if (items.value.length !== 0) {
    return items.value[active_index.value].id;
  }
  return null;
});
provide("active_descendent_id", active_descendent_id);

provide<() => unknown>("update_item_selected", () => emit("close"));

function broadcast_item_activated_with_keyboard() {
  for (const menu_item of items.value) {
    menu_item.update_item_activated_with_keyboard();
  }
}

function focus_next_item() {
  active_index.value = (active_index.value + 1) % items.value.length;
}

function focus_prev_item() {
  active_index.value =
    (active_index.value - 1 + items.value.length) % items.value.length;
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

.context-menu-mask {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.context-menu-container {
  background-color: white;
  border: 1px solid lighten($baking-pan, 50%);
  border-radius: 2px;
  box-shadow: 0 0 15px opacify(lighten($baking-pan, 50%), 0.2);
  position: absolute;
  z-index: 1;
  min-width: 100px;
  min-height: 20px;
  padding: 0;
  list-style: none;
}

.context-menu-container:focus {
  outline: none;
}
</style>
