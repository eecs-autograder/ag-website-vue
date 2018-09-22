<template>
  <div class="hello">

    <div class="outside">
      <button type="button" @click="add_tab()">Add tab</button>

      <br> <br>
      <div class="shrink-tabs">
        <p> Current Tab Index = {{current_tab_index}}</p>
        <tabs ref="tabs" v-model="current_tab_index"
              tab_active_class="no-border-active"
              tab_inactive_class="no-border-inactive">
          <tab ref="tabby" v-on:click="log_event"
               v-for="(tab_val, index) in tab_labels" :key="tab_val">
            <template slot="header">
              <div class="tab-label">
                <p class="tab-heading"> Tab {{tab_val}} </p>
                <i class="fas fa-times close_x"
                   @click="$event.stopPropagation(); remove_tab(index)"></i>
              </div>
            </template>
            <template slot="body">
              <div class="tab-body">
                {{tab_val}}
              </div>
            </template>
          </tab>
        </tabs>

        <tabs ref="tabs2"
              tab_active_class="white-theme-active"
              tab_inactive_class="white-theme-inactive">
          <tab ref="tabby" v-on:click="log_event">
            <template slot="header">
              <div class="tab-label">
                <p class="tab-heading"> Cat Tab </p>
              </div>
            </template>
            <template slot="body">
              <div class="tab-body2">
              </div>
            </template>
          </tab>
          <tab ref="tabby" v-on:click="log_event">
            <template slot="header">
              <div class="tab-label">
                <p class="tab-heading"> Dog Tab </p>
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
  import ViewFile from '@/components/view_file.vue';

  @Component({
    components: {Tabs, Tab, ViewFile}
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
