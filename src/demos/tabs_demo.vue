<template>
  <div class="tabs-demo">

    <div class="outside">
      <button type="button" @click="add_tab()">Add tab</button>

      <br> <br>
      <div class="shrink-tabs">
        <p> Current Tab Index = {{current_tab_index}}</p>
        <p class="tab-styling-theme-label"> GRAY THEME </p>
        <div class="limit-tabs">
        <tabs ref="tabs" v-model="current_tab_index"
              tab_active_class="gray-theme-active"
              tab_inactive_class="gray-theme-inactive">
          <tab v-for="(tab_val, index) in tab_labels" :key="tab_val">
            <tab-header v-on:click="log_event">
              <span class="tab-heading"> Tab {{tab_val}} </span>
              <i class="fas fa-times close_x"
                  @click="$event.stopPropagation(); remove_tab(index)"></i>
            </tab-header>
            <template slot="body">
              <div class="tab-body-gray">
                {{tab_val}}
              </div>
            </template>
          </tab>
        </tabs>
        </div>

        <br>
        <p class="tab-styling-theme-label"> DARK THEME </p>
        <tabs ref="tabs" v-model="current_tab_index"
              tab_active_class="dark-theme-active"
              tab_inactive_class="dark-theme-inactive">
          <tab v-for="(tab_val, index) in tab_labels" :key="tab_val">
            <tab-header v-on:click="log_event">
              <span class="tab-heading"> Tab {{tab_val}} </span>
              <i class="fas fa-times close_x"
                 @click="$event.stopPropagation(); remove_tab(index)"></i>
            </tab-header>
            <template slot="body">
              <div class="tab-body-dark">
                {{tab_val}}
              </div>
            </template>
          </tab>
        </tabs>

        <br>
        <p class="tab-styling-theme-label"> BLUE THEME </p>
        <tabs ref="tabs" v-model="current_tab_index"
              tab_active_class="blue-theme-active"
              tab_inactive_class="blue-theme-inactive">
          <tab v-for="(tab_val, index) in tab_labels" :key="tab_val">
            <tab-header v-on:click="log_event">
              <span class="tab-heading"> Tab {{tab_val}} </span>
              <i class="fas fa-times close_x"
                 @click="$event.stopPropagation(); remove_tab(index)"></i>
            </tab-header>
            <template slot="body">
              <div class="tab-body-blue">
                {{tab_val}}
              </div>
            </template>
          </tab>
        </tabs>

        <br>
        <p class="tab-styling-theme-label"> NO BORDER THEME </p>
        <tabs ref="tabs" v-model="current_tab_index"
              tab_active_class="no-border-active"
              tab_inactive_class="no-border-inactive">
          <tab v-for="(tab_val, index) in tab_labels" :key="tab_val">
            <tab-header v-on:click="log_event">
              <span class="tab-heading"> Tab {{tab_val}} </span>
              <i class="fas fa-times close_x"
                 @click="$event.stopPropagation(); remove_tab(index)"></i>
            </tab-header>
            <template slot="body">
              <div class="tab-body-no-border">
                {{tab_val}}
              </div>
            </template>
          </tab>
        </tabs>

        <br>
        <!-- This one uses the default styling -->
        <p class="tab-styling-theme-label"> WHITE THEME </p>
        <tabs ref="tabs2">
          <tab>
            <tab-header v-on:click="log_event">
              <p class="tab-heading"> Cat Tab </p>
            </tab-header>
            <template slot="body">
              <div class="tab-body-white">
              </div>
            </template>
          </tab>
          <tab>
            <tab-header v-on:click.native="log_event">
              <p class="tab-heading"> Dog Tab </p>
            </tab-header>
            <template slot="body">
              <div class="tab-body-white">
                Bye 2
              </div>
            </template>
          </tab>
          <tab>
            <tab-header @click.native="log_event">
              Bare Text Tab
            </tab-header>
            <template slot="body">
              <div class="tab-body-white">
                The tab header has just text
              </div>
            </template>
          </tab>
        </tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

  import { Component, Vue } from 'vue-property-decorator';

  import Tab from '@/components/tabs/tab.vue';
  import TabHeader from '@/components/tabs/tab_header.vue';
  import Tabs from '@/components/tabs/tabs.vue';
  import ViewFile from '@/components/view_file.vue';

  @Component({
    components: {Tabs, TabHeader, Tab, ViewFile}
  })
  export default class TabsDemo extends Vue {
    log_event(e: Event) {
      console.log(e);
    }

    current_tab_index = 1;

    tab_labels = [1, 2, 3];

    add_tab() {
      this.tab_labels.push(this.tab_labels.length + 1);
      this.current_tab_index = this.tab_labels.length - 1;
    }

    remove_tab(index: number) {
      if (index < this.current_tab_index) {
        this.current_tab_index -= 1;
      }
      this.tab_labels.splice(index, 1);
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  @import '@/styles/colors.scss';

  .close_x:hover {
    color: $warning-red;
    cursor: pointer;
  }

  .tab-body {
    background-color: white;
    bottom: 0;
    height: 500px;
    padding: 10px;
    position: relative;
  }

  .tab-body-gray {
    @extend .tab-body;
    border: 2px solid $stormy-gray-dark;
  }

  .tab-body-dark{
    @extend .tab-body;
    border: 2px solid darken($stormy-gray-dark, 25);
  }

  .tab-body-blue {
    @extend .tab-body;
    border: 2px solid darken($ocean-blue, 15);
  }

  .tab-body-no-border {
    @extend .tab-body;
  }

  .tab-body-white {
    @extend .tab-body;
    border: 2px solid $pebble-dark;
  }

  .tab-heading {
    margin: 0;
    padding-right: 15px;
    font-family: "Helvetica Neue", Helvetica;
  }

  .shrink-tabs {
    width: 80%;
    margin-left: 10%;
    margin-right: 10%;
  }

  .tab-styling-theme-label {
    background-color: $pebble-light;
    padding: 10px;
    display: inline-block;
    border: 2px dashed $pebble-dark;
  }

  .limit-tabs {
    width: 300px;
  }

</style>
