<template>
  <form v-bind="$props">
    <slot></slot>
  </form>
  <!--<div>-->
    <!--hello-->
  <!--</div>-->
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  import ValidatedInput from '@/components/validated_input.vue';

  @Component
  export default class ValidatedForm extends Vue {
    is_valid(): boolean {
      for (let element of this.$slots.default) {
        console.log(element);

        if (element.componentInstance !== undefined) {
          if (!(<ValidatedInput> element.componentInstance).is_valid()) {
            return false;
          }
          // console.log((<ValidatedInput> element.componentInstance).is_valid());
        }
      }

      return true;
    }

    mounted() {
      this.is_valid();
    }
  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';
</style>
