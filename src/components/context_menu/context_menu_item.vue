<template>
  <div
    class="context-menu-option"
    :class="{ 'hoverable-item': !disabled, 'disabled-item': disabled }"
    @click.stop="handle_click"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
interface PropTypes {
  disabled?: boolean;
}

const props = withDefaults(defineProps<PropTypes>(), {
  disabled: false,
});

const emit = defineEmits<{
  click: [];
}>();

function handle_click() {
  if (!props.disabled) {
    emit("click");
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";

.context-menu-option {
  color: black;
  padding: 0.375rem 0.75rem;
}

.hoverable-item:hover {
  background-color: $pebble-medium;
  cursor: pointer;
}

.disabled-item,
.disabled-item:hover {
  color: $baking-pan;
}
</style>
