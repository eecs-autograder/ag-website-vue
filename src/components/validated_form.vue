<template>
  <form v-bind="$props" v-on="event_listeners">
    <slot></slot>
  </form>
</template>

<script lang="ts">
import Vue from 'vue';

import { RegisteredValidatedInput } from '@/components/validated_input.vue';

export default {
  name: "ValidatedForm",
}

export interface ValidatedFormExposed extends Vue {
  d_validated_inputs: RegisteredValidatedInput[];
  is_valid: boolean;
  enable_warnings(): void;
  reset_warning_state(): void;
}
</script>

<script setup lang="ts">
import { computed, getCurrentInstance, markRaw, onMounted, provide, ref, Ref, watch } from 'vue';

const d_validated_inputs: Ref<RegisteredValidatedInput[]> = ref([]);
let d_emitted_is_valid = false;
const is_valid =  computed(() =>
  d_validated_inputs.value.every(input => input.is_valid.value)
);

const emit = defineEmits<{
  (event: 'form_validity_changed', value: boolean): void,
  (event: 'submit'): void
}>()

watch(is_valid, (value) => {
  if (value !== d_emitted_is_valid) {
    d_emitted_is_valid = value;
    emit('form_validity_changed', value);
  }
}, {flush: 'sync'});

onMounted(() => {
  d_emitted_is_valid = is_valid.value;
  emit('form_validity_changed', is_valid.value);
});

function enable_warnings() {
  for (const validated_input of d_validated_inputs.value) {
    validated_input.enable_warnings();
  }
}

function reset_warning_state() {
  for (const validated_input of d_validated_inputs.value) {
    validated_input.reset_warning_state();
  }
}

provide('register', (validated_input: RegisteredValidatedInput): void => {
  // Without markRaw, Vue's observer would redefine validated_input's properties as
  // getters that unwrap is_valid, breaking the input's own is_valid.value reads.
  d_validated_inputs.value.push(markRaw(validated_input));
});

provide('unregister', (validated_input: RegisteredValidatedInput): void => {
  let index = d_validated_inputs.value.findIndex((input) => input.uid === validated_input.uid);
  d_validated_inputs.value.splice(index, 1);
});

const instance = getCurrentInstance()!;

const event_listeners = computed(() => ({
  ...instance.proxy.$listeners,
  submit: (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    enable_warnings();
    if (is_valid.value) {
      emit('submit');
    }
  },
}));

defineExpose({d_validated_inputs, is_valid, reset_warning_state, enable_warnings});
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
</style>
