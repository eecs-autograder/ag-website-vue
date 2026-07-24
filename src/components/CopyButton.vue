<template>
  <span
    class="copy-button"
    :class="{ 'opacity-1': show_button }"
    @mouseenter="is_content_hovered = true"
    @mouseleave="is_content_hovered = false"
  >
    <button
      type="button"
      class="copy-button-clickable"
      @click="copy_content_to_clipboard"
      aria-label="Copy contents"
    >
      <i
        :class="{ 'far fa-copy': !is_copying, 'fas fa-check': is_copying }"
        aria-hidden="true"
      ></i>
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

type PropTypes = {
  content_to_copy: string;
  only_show_on_hover?: boolean;
};
const props = withDefaults(defineProps<PropTypes>(), {
  only_show_on_hover: false
});

const is_copying = ref(false);
const is_content_hovered = ref(false);
const show_button = computed(
  () => !props.only_show_on_hover || is_content_hovered.value,
);

async function copy_content_to_clipboard() {
  await navigator.clipboard.writeText(props.content_to_copy);

  is_copying.value = true;

  // Wait to set icon back
  setTimeout(() => {
    is_copying.value = false;
  }, 3000);
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.copy-button {
  opacity: 0;
  transition: opacity 0.2s;

  &.opacity-1 {
    opacity: 1;
  }

  .copy-button-clickable {
    background-color: $white-gray;
    border: 0.0625rem solid black;
    border-radius: 0.375rem;
    position: relative;
    line-height: 1;
    vertical-align: middle;
    padding: 0.5rem;
    cursor: pointer;
  }
}
</style>
