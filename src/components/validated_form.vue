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
    validated_input.$on('input_validity_changed', () => {
      this.set_is_valid(this.all_inputs_valid());
    });
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
    return Object.assign({}, this.$listeners, {
      submit: (event: Event) => {
        if (this.is_valid) {
          this.$emit('submit', Object.assign({}, event));
        }
        else { 
          event.preventDefault();
          event.stopPropagation();
        }
      }
    });
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
</style>
