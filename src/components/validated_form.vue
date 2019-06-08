<template>
  <form v-bind="$props" v-on="event_listeners">
    <slot></slot>
  </form>
</template>

<script lang="ts">
import { Component, Provide, Vue, Watch } from 'vue-property-decorator';

import ValidatedInput from '@/components/validated_input.vue';

@Component
export default class ValidatedForm extends Vue {
  d_validated_inputs: ValidatedInput[] = [];

  private d_is_valid: boolean = false;

  // We want the created hooks for all the validated inputs to
  // run before we check form validity for the first time.
  mounted() {
    this.d_is_valid = this.all_inputs_valid();
    this.$emit('form_validity_changed', this.is_valid);
  }

  @Provide()
  register = (validated_input: ValidatedInput): void => {
    this.d_validated_inputs.push(validated_input);
    validated_input.$on('input_validity_changed',
                        () => this.set_is_valid(this.all_inputs_valid()));
    // Note: ValidatedInputs emit a validity change event after they register themselves.
  }

  @Provide()
  unregister = (validated_input: ValidatedInput): void => {
    let index = this.d_validated_inputs.findIndex((input) => input.uid === validated_input.uid);
    this.d_validated_inputs.splice(index, 1);

    // Since ValidatedInputs unregister themselves when they're destroyed, we know that they
    // won't emit any input_validity_changed events after they unregister.
    //
    // We do, however, need to re-evaluate the form validity in case the unregistered input
    // was making the form invalid.
    this.set_is_valid(this.all_inputs_valid());
  }

  get is_valid(): boolean {
    return this.d_is_valid;
  }

  private set_is_valid(value: boolean) {
    let value_changed = value !== this.d_is_valid;
    if (value_changed) {
      this.d_is_valid = value;
      this.$emit('form_validity_changed', this.d_is_valid);
    }
  }

  private all_inputs_valid() {
    for (const validated_input of this.d_validated_inputs) {
      if (!validated_input.is_valid) {
        return false;
      }
    }
    return true;
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
