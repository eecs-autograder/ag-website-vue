<template>
  <div class="hello">

    <h1>{{ msg }}</h1>

    <button type="button" @click="switchy = !switchy">things</button>

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

    <!-- <tabs v-model="current_tab_index">
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
    </tabs> -->

    <!-- {{current_tab_index}} -->

<!-- <tabs ref="tabs" v-model="current_tab_index">
  <tab ref="tabby" v-on:click="wee">
    <template slot="header">
      Tab 1
    </template>
    <template slot="body">
     Tab 1 body
    </template>
  </tab>
  <tab>
    <template slot="header">
      Tab 2
    </template>
    <template slot="body">
      Tab 2 body
    </template>
  </tab>
</tabs> -->

<button type="button" @click="add_tab()">Add tab</button>

<tabs ref="tabs" v-model="current_tab_index">
  <tab ref="tabby" v-on:click="wee" v-for="(tab_val, index) in tab_labels" :key="tab_val">
    <template slot="header">
      <span>
        Tab {{tab_val}}
        <i class="fas fa-times close_x"
            @click="$event.stopPropagation(); remove_tab(index)"></i>
      </span>
    </template>
    <template slot="body">
      <div class="tab-body">
        Tab {{tab_val}} body
      </div>
    </template>
  </tab>
</tabs>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import Tab from '@/components/tabs/tab.vue';
import Tabs from '@/components/tabs/tabs.vue';
import Toggle from '@/components/toggle.vue';
import ViewFile from '@/components/view_file.vue';

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

  wee(e: Event) {
    console.log(e);
  }

  current_tab_index = 1;

  tab_labels = [1, 2, 3];

  add_tab() {
    this.tab_labels.push(this.tab_labels.length + 1);
    this.current_tab_index = this.tab_labels.length - 1;
  }

  remove_tab(index: number) {
    this.tab_labels.splice(index, 1);
  }
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

.close_x:hover {
  background-color: lightgray;
  cursor: pointer;
}

.tab-body {
  margin: 10px;
}

</style>
