<template>

<div class="tab-header">
  <slot></slot>
</div>

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class TabHeader extends Vue {}

</script>


<style scoped lang="scss">
@import '@/styles/components/tab_styles.scss';

.tab-header {
  display: inline-block;

  border-radius: 10px 10px 0 0;
  margin-right: 2px;
  margin-top: 4px;
  padding: 10px 15px;
}

.inactive-tab-header:hover {
  cursor: pointer;
}

</style>
