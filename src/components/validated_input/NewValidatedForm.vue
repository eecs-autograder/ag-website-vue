<template>
  <form v-bind="$props" v-on="event_listeners">
    <slot></slot>
  </form>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, ref } from "vue";

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
  (e: "submit"): void;
  (e: "submit_invalid"): void;
}
const emit = defineEmits<EmitTypes>();
const is_valid = use_validation_group(emit);

const event_listeners = computed(() => {
  let listeners = {...getCurrentInstance()?.proxy.$listeners};
  listeners.submit = handle_submit;
})

const handle_submit = (e: Event) => {
  e.preventDefault;
  e.stopPropagation;
  if (is_valid.value) {
    emit("submit");
  }
  else {
    emit("submit_invalid");
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
</style>
