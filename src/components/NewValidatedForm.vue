<template>
  <!-- <form v-bind="$props" v-on="event_listeners"> -->
  <form v-bind="$props" @submit="handle_submit">
    <slot></slot>
  </form>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

import { use_validation_group, ValidatorEmitTypes } from '@/composables/use_validation';

// TODO: when we upgrade to Vue>=3.3, components using use_validation_group can
// just import ValidatedInputEmitTypes to define the components emits (can be used to
// define an intersection type for emits as well).
// i.e.
// type EmitTypes = ValidatorEmitTypes & {
//   (e: "submit"): void
// }
// See https://vuejs.org/guide/typescript/composition-api.html#syntax-limitations
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
