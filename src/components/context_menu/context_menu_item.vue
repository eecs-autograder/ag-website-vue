<template>
  <button type="button"
          class="context-menu-option unstyled-button"
          :class="{'hoverable-item': !disabled, 'disabled-item': disabled}"
          :disabled="disabled"
          @click.stop="handle_click">
    <slot></slot>
  </button>
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
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';

.context-menu-option {
  color: black;
  padding: .375rem .75rem;
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
</style>
