<template>
  <!-- <form v-bind="$props" v-on="event_listeners"> -->
  <form v-bind="$props" @submit="handle_submit">
    <slot></slot>
  </form>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

import { use_validation_group, ValidatorEmitTypes } from '@/composables/use_validation';

// TODO: A limitation of the vue SFC compiler is that emit types need to be known
// at compile time. As of 3.3, however, imported types can be used to define emits.
// Once we upgrade to 3.3, this can be changed to the following to reduce coupling:
//
// type EmitTypes = ObserverEmitTypes & {
//   (e: "submit"): void
// }
type EmitTypes = {
  (e: "validity_changed", value: boolean): void;
  (e: "submit"): void
}
const emit = defineEmits<EmitTypes>();

const is_valid = use_validation_group(emit);

const handle_submit = (e: Event) => {
  e.preventDefault;
  e.stopPropagation;
  if (is_valid.value) {
    emit("submit");
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
</style>
