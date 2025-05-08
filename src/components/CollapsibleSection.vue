<template>
  <div>
    <div
      class="collapsible-section-label"
      data-testid="collapsible-section-header"
      @click="toggle_is_open"
    >
      <i v-if="is_open" class="fas fa-caret-down caret-down"></i>
      <i v-else class="fas fa-caret-right caret-right"></i>

      <div class="collapsible-section-header-slot">
        <slot name="header"></slot>
      </div>
    </div>

    <div v-if="is_open" class="collapsible-section-body-slot">
      <slot name="body"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const is_open = ref(false);

function toggle_is_open() {
  is_open.value = !is_open.value;
}
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";
@import "@/styles/section_header.scss";

.collapsible-section-label {
  @include collapsible-section-header(
    $line-color: rgba(0, 0, 0, 0.1),
    $text-color: $navy-blue
  );

  box-sizing: border-box;
  font-size: 1rem;
  cursor: pointer;

  .collapsible-section-header-slot {
    padding: 0 0.125rem;
    box-sizing: border-box;
  }
}

.collapsible-section-body-slot {
  padding-left: 0.375rem;
  padding-top: 0.375rem;
}
</style>
