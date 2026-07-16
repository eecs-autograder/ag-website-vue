<template>
  <button
    type="button"
    ref="context_menu_items"
    class="unstyled-button context-menu-option"
    :class="{
      'hoverable-item': !disabled,
      'disabled-item': disabled,
      'active-descendant': active_descendent_id === id,
    }"
    :disabled="disabled"
    @click.stop="handle_click"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { inject, onMounted } from "vue";

import { assert_not_null, generate_uid } from "@/utils";

const id = `context-menu-item-${generate_uid()}`;

interface PropTypes {
  disabled?: boolean;
}

const props = withDefaults(defineProps<PropTypes>(), {
  disabled: false,
});

const emit = defineEmits<{
  click: [];
}>();

const register = inject<(id: string) => unknown>("register");
onMounted(() => {
  assert_not_null(register);
  register(id);
});
const active_descendent_id = inject("active_descendent_id");

function handle_click() {
  if (!props.disabled) {
    emit("click");
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/button_styles.scss";
@import "@/styles/colors.scss";

.unstyled-button.context-menu-option {
  color: black;
  padding: 0.375rem 0.75rem;
  display: block;
  width: 100%;
  text-align: left;
}

.hoverable-item:hover {
  background-color: $pebble-medium;
  cursor: pointer;
}

.disabled-item,
.disabled-item:hover {
  color: $baking-pan;
}

.active-descendant {
  outline-style: auto;
}
</style>
