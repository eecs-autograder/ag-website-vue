<template>
  <form v-bind="$props">
    <slot></slot>
  </form>
</template>

<script lang="ts">
  import { Component, Provide, Vue, Watch } from 'vue-property-decorator';

  import ValidatedInput from '@/components/validated_input.vue';

  @Component
  export default class ValidatedForm extends Vue {
    d_validated_inputs: ValidatedInput[] = [];

    created() {
      console.log("Form validity is now: " + this.is_valid);
      this.$emit('form_validity_changed', this.is_valid);
    }

    @Provide()
    register = (validated_input: ValidatedInput): void => {
      this.d_validated_inputs.push(validated_input);
    }

    get is_valid(): boolean {
      for (const validated_input of this.d_validated_inputs) {
        if (!validated_input.is_valid) {
          return false;
        }
      }

      return true;
    }

    clear() {
      for (const validated_input of this.d_validated_inputs) {
        validated_input.clear();
      }
    }

    @Watch('is_valid')
    on_form_validity_changed(new_value: boolean, old_value: boolean) {
      console.log("Form validity changed, it is now: " + new_value);
      this.$emit('form_validity_changed', new_value);
    }
  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';
</style>
