<template>

<div>
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

.inactive-tab-header:hover {
  cursor: pointer;
}

</style>
