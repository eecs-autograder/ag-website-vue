<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <!-- Add ref= so that we can select this component instance in tests. -->
    <Toggle id="toggle" v-model="switchy" ref="switchy_toggle"/>
    <Toggle/>
    {{switchy}}

    <div class="icon-poc">
      <i class="fas fa-check"></i>
      <i class="far fa-check-circle"></i>
      <i class="fas fa-angle-down"></i>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import Toggle from './toggle.vue';

@Component({
  components: {Toggle}
})
export default class HelloWorld extends Vue {
  @Prop()
  msg!: string;

  switchy: boolean = true;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
