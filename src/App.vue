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
  body, #app {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
  }

  html {
    height: 100%;
  }

  body, input {
    font-family: "Helvetica Neue", Helvetica;
  }
</style>
