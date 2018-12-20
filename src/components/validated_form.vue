<template>
  <form v-bind="$props">
    <slot></slot>
  </form>
</template>

<script lang="ts">
  import { Component, Provide, Vue } from 'vue-property-decorator';

  import ValidatedInput from '@/components/validated_input.vue';

  @Component
  export default class ValidatedForm extends Vue {
    d_validated_inputs: ValidatedInput[] = [];

    @Provide()
    register = (v_input: ValidatedInput): void => {
      this.d_validated_inputs.push(v_input);
    }

    get is_valid(): boolean {
      for (const v_input of this.d_validated_inputs) {
        if (!v_input.is_valid) {
          return false;
        }
      }

      return true;
    }
  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';
</style>
