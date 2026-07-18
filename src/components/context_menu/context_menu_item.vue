<template>
  <li
    role="presentation"
    :id="id"
    :class="{ 'active-descendant': active_descendent_id === id }"
  >
    <button
      role="menuitem"
      tabindex="-1"
      type="button"
      ref="context_menu_items"
      class="unstyled-button context-menu-option"
      :class="{
        'hoverable-item': !disabled,
        'disabled-item': disabled,
      }"
      :disabled="disabled"
      @click="on_item_selected"
    >
      <slot></slot>
    </button>
  </li>
</template>

<script setup lang="ts">
import { ComputedRef, inject, onMounted } from "vue";

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

const register =
  inject<
    (id: string, update_item_activated_with_keyboard: () => unknown) => unknown
  >("register");
onMounted(() => {
  assert_not_null(register);
  register(id, () => {
    console.log("item receieved update");
    console.log(active_descendent_id, id);
    assert_not_null(active_descendent_id);
    if (active_descendent_id.value === id) {
      emit("click");
    }
  });
});
const active_descendent_id = inject<ComputedRef<string | null>>(
  "active_descendent_id",
);

const update_item_selected = inject<() => unknown>("update_item_selected");

function on_item_selected() {
  emit("click");
  assert_not_null(update_item_selected);
  update_item_selected();
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
