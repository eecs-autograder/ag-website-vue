<template>
  <div class="hello">

    <div class="outside">
      <button type="button" @click="add_tab()">Add tab</button>


      <br> <br>
      <div class="shrink-tabs">
        <tabs ref="tabs" v-model="current_tab_index"
              tab_active_class="no-border-active"
              tab_inactive_class="no-border-inactive">
          <tab ref="tabby" v-on:click="wee" v-for="(tab_val, index) in tab_labels" :key="tab_val">
            <template slot="header">
              <div class="tab-label">
                <p class="tab-heading"> Tab {{tab_val}} </p>
                <i class="fas fa-times close_x"
                   @click="$event.stopPropagation(); remove_tab(index)"></i>
              </div>
            </template>
            <template slot="body">
              <div class="tab-body">
                Tab {{tab_val}} body
              </div>
            </template>
          </tab>
        </tabs>

        <tabs ref="tabs2" v-model="current_tab_index2"
              tab_active_class="white-theme-active"
              tab_inactive_class="white-theme-inactive">
          <tab ref="tabby" v-on:click="wee">
            <template slot="header">
              <div class="tab-label">
                <p class="tab-heading"> Cat Tab </p>
                <i class="fas fa-times close_x"
                   @click="$event.stopPropagation(); remove_tab(0)"></i>
              </div>
            </template>
            <template slot="body">
              <div class="tab-body2">
                Hi 1
              </div>
            </template>
          </tab>
          <tab ref="tabby" v-on:click="wee">
            <template slot="header">
              <div class="tab-label">
                <p class="tab-heading"> Dog Tab </p>
                <i class="fas fa-times close_x"
                   @click="$event.stopPropagation(); remove_tab(1)"></i>
              </div>
            </template>
            <template slot="body">
              <div class="tab-body2">
                Bye 2
              </div>
            </template>
          </tab>
        </tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import Tab from '@/components/tabs/tab.vue';
  import Tabs from '@/components/tabs/tabs.vue';

  @Component({
    components: {Tabs, Tab}
  })
  export default class TabsDemo extends Vue {
    @Prop()
    msg!: string;

    on = "Hello";

    off = "Super Off";

    filename = "ke$ha.cpp";

    content = "#include \"macklemore.cpp\"\nblah\nblah\nblah\n5coffeeeeeeee\n";

    switchy: boolean = true;

    wee(e: Event) {
      console.log(e);
    }

    current_tab_index = 1;

    current_tab_index2 = 0;

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
  @import '@/styles/colors.scss';

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
    color: $warning-red;
    cursor: pointer;
  }

  .tab-body {
    padding: 10px;
    background-color: white;
    height: 500px;
    position: relative;
    bottom: 0px;
    z-index: 15;
  }

  .tab-body2 {
    padding: 10px;
    background-color: white;
    border: 2px solid $light-gray;
    height: 500px;
    position: relative;
    bottom: 0px;
    z-index: 15;
  }

  .tab-label {
    margin: 0;
  }

  .tab-heading {
    margin: 0;
    padding-right: 15px;
    display: inline-block;
    font-family: "Helvetica Neue", Helvetica;
  }

  .shrink-tabs {
    width: 80%;
    margin-left: 10%;
    margin-right: 10%;
  }

</style>
