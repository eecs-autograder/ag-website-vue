<template>
  <div class="tabs-demo">

    <div class="outside">
      <button type="button" @click="add_tab()">Add tab</button>

      <br> <br>
      <div class="shrink-tabs">
        <p> Current Tab Index = {{current_tab_index}}</p>
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
              <div class="tab-body">
                {{tab_val}}
              </div>
            </template>
          </tab>
        </tabs>

        <!-- This one uses the default styling -->
        <tabs ref="tabs2">
          <tab>
            <tab-header v-on:click="log_event">
              <p class="tab-heading"> Cat Tab </p>
            </tab-header>
            <template slot="body">
              <div class="tab-body2">
              </div>
            </template>
          </tab>
          <tab>
            <tab-header v-on:click.native="log_event">
              <p class="tab-heading"> Dog Tab </p>
            </tab-header>
            <template slot="body">
              <div class="tab-body2">
                Bye 2
              </div>
            </template>
          </tab>
          <tab>
            <tab-header @click.native="log_event">
              Bare Text Tab
            </tab-header>
            <template slot="body">
              <div class="tab-body2">
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

  import { Component, Prop, Vue } from 'vue-property-decorator';

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
    padding: 10px;
    background-color: white;
    height: 500px;
    position: relative;
    bottom: 0;
    z-index: 15;
  }

  .tab-body2 {
    padding: 10px;
    background-color: white;
    border: 2px solid $pebble-dark;
    height: 500px;
    position: relative;
    bottom: 0;
    z-index: 15;
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

</style>
