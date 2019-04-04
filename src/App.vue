<template>
  <div id="app">
    <!--<HelloWorld msg="Hello world!"/>-->
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import HelloWorld from './components/hello_world.vue';

@Component({
  components: {
    HelloWorld
  },
})
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
