<template>

<div>
  <slot></slot>
  <slot name="body"></slot>
</div>

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Tab extends Vue {}

</script>


<style scoped lang="scss">

</style>
