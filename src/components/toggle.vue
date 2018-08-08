<template>
  <div>
    <button type="button" v-on:click="_toggle">
      <div v-if="is_on">On</div>
      <div v-else>Off</div>
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Toggle extends Vue {
  // Input property. The ! is to make typescript not complain about this not being initialized
  // in the ctor.
  @Prop({default: false, type: Boolean})
  value!: boolean;

  // data must be public and be initialized.
  is_on: boolean = false;

  // Vue doesn't like mutable properties, so we copy the value
  // into a data member.
  created() {
    this.is_on = this.value;
  }

  private _toggle() {
    this.is_on = !this.is_on;
    this.$emit('input', this.is_on);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/styles/colors.scss';

button {
  color: $color-aqua;
}
</style>
