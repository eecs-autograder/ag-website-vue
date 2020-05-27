<template>
  <div class="collapsible">
    <div class="header" @click="d_is_open = !d_is_open">
      <i v-if="include_caret"
         class="caret fas"
         :class="d_is_open ? 'fa-caret-down' : 'fa-caret-right'"></i>
      <slot name="header"></slot>
    </div>
    <div v-show="d_is_open" data-testid="collapsible_body">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Collapsible extends Vue {
  @Prop({default: false, type: Boolean})
  start_open!: boolean;

  @Prop({default: true, type: Boolean})
  include_caret!: boolean;

  d_is_open = this.start_open;
}
</script>

<style scoped lang="scss">

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.header {
  display: flex;
  cursor: pointer;
  align-items: center;
}

.caret {
  margin-right: .125rem;
}
</style>
