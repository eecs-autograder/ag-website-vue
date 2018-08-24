<template>
  <div class="hello">

    <h1>{{ msg }}</h1>

    <toggle id="toggle" v-model="switchy"
            :incoming_active_background_color="active_bkgrnd_color"
            ref="switchy_toggle">
      <template slot="on">
        <p> Happy </p>
      </template>
      <template slot="off">
        <p> <i class="fas fa-frown fa-lg"> </i></p>
      </template>
    </toggle>

    <br>

    <div class="icon-poc">
      <i class="fas fa-check"></i>
      <i class="far fa-check-circle"></i>
      <i class="fas fa-angle-down"></i>
    </div>

    <br>
    <view-file :incoming_filename="filename"
               :incoming_file_content="content" ref="viewing_file"></view-file>

    <tabs v-model="current_tab_index">
      <tab>
        <template slot="header">
          Tab 1
        </template>

        <template slot="body">
          Spam
        </template>
      </tab>

      <tab>
        <template slot="header">
          <i>Tab 2</i>
        </template>
        <template slot="body">
          Egg
        </template>
      </tab>
    </tabs>

    {{current_tab_index}}

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import Toggle from './toggle.vue';

import ViewFile from './view_file.vue';

import { Tab, Tabs } from './tabs';

@Component({
  components: {Toggle, ViewFile, Tabs, Tab}
})

export default class HelloWorld extends Vue {
  @Prop()
  msg!: string;

  on = "Hello";

  off = "Super Off";

  filename = "ke$ha.cpp";

  content = "#include \"macklemore.cpp\"\nblah\nblah\nblah\n5coffeeeeeeee\n";

  switchy: boolean = true;

  active_bkgrnd_color = {
    'backgroundColor': 'hotpink'
  };

  current_tab_index = 1;
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
