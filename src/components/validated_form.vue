<template>
  <form v-bind="$props" v-on="event_listeners">
    <slot></slot>
  </form>
</template>

<script lang="ts">
import { markRaw, watch } from 'vue';
import { Component, Provide, Vue, Watch } from 'vue-property-decorator';

import { RegisteredValidatedInput } from '@/components/validated_input.vue';

@Component
export default class ValidatedForm extends Vue {
  d_validated_inputs: RegisteredValidatedInput[] = [];

  private d_emitted_is_valid: boolean = false;

  created() {
    watch(() => this.is_valid, (value) => {
      if (value !== this.d_emitted_is_valid) {
        this.d_emitted_is_valid = value;
        this.$emit('form_validity_changed', value);
      }
    }, {flush: 'sync'});
  }

  // We want the created hooks for all the validated inputs to
  // run before we check form validity for the first time.
  mounted() {
    this.d_emitted_is_valid = this.is_valid;
    this.$emit('form_validity_changed', this.is_valid);
  }

  @Provide()
  register = (validated_input: RegisteredValidatedInput): void => {
    // Without markRaw, Vue's observer would redefine validated_input's properties as
    // getters that unwrap is_valid, breaking the input's own is_valid.value reads.
    this.d_validated_inputs.push(markRaw(validated_input));
  }

  @Provide()
  unregister = (validated_input: RegisteredValidatedInput): void => {
    let index = this.d_validated_inputs.findIndex((input) => input.uid === validated_input.uid);
    this.d_validated_inputs.splice(index, 1);
  }

  get is_valid(): boolean {
    return this.d_validated_inputs.every((input) => input.is_valid.value);
  }

  enable_warnings() {
    for (const validated_input of this.d_validated_inputs) {
      validated_input.enable_warnings();
    }
  }

  reset_warning_state() {
    for (const validated_input of this.d_validated_inputs) {
      validated_input.reset_warning_state();
    }
  }

  private get event_listeners() {
    let listeners = {...this.$listeners};
    listeners.submit = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      this.enable_warnings();
      if (this.is_valid) {
        this.$emit('submit');
      }
    };

    return listeners;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
</style>
