<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import UIDemos from './demos/ui_demos.vue';

@Component
export default class App extends Vue {}
</script>

<style lang="scss">
  body {
    margin: 0;
  }

  body, input {
    font-family: "Helvetica Neue", Helvetica;
  }
</style>
