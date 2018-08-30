<template>

<div>
  <slot class="outer-tab-header" name="header"></slot>
  <slot class="outer-tab-body" name="body"></slot>
</div>

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Tab extends Vue {}

</script>

<style scoped lang="scss">

</style>
