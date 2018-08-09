<template>
  <div class="hello">
    <!--<h1>{{ msg }}</h1>-->
    <!-- Add ref= so that we can select this component instance in tests. -->
    <!--:switch_is_on_text="on" :switch_is_off_text="off"-->
    <Toggle id="toggle" v-model="switchy" ref="switchy_toggle"/>

    <Toggle/>
    {{switchy}}

    <div class="icon-poc">
      <i class="fas fa-check"></i>
      <i class="far fa-check-circle"></i>
      <i class="fas fa-angle-down"></i>
    </div>

    <view-file></view-file>

>>>>>>> Moved view_file component over to vue project. Changed the view_file component to use side by side divs instead of a table so that the file contents can be copied without copying the line numbers!
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import Toggle from './toggle.vue';

import ViewFile from './view_file.vue';

@Component({
  components: {Toggle, ViewFile}
})

export default class HelloWorld extends Vue {
  @Prop()
  msg!: string;

  on = "Hello";

  off = "Super Off";

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
