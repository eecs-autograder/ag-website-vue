<template>
  <div id="multi-file-viewer">
    <tabs ref="multi-viewing-tabs"
          v-model="active_tab_index"
          tab_active_class="gray-white-theme-active"
          tab_inactive_class="gray-white-theme-inactive">
      <tab ref="single-tab"
           v-for="(open_file, index) of files_currently_viewing"
           @click="active_tab_index = index">

        <template slot="header">
          <div class="tab-header">
            <p class="tab-label"> {{ open_file.name }} </p>
            <i class="fas fa-times close-x"
               @click="$event.stopPropagation(); remove_from_viewing(index)"></i>
          </div>
        </template>

        <template slot="body">
          <div class="tab-body">

            <view-file
              ref="view_file_component"
              :incoming_filename="open_file.name"
              :incoming_file_contents="open_file.content"
              :incoming_height_specifications="scrollable_height">
            </view-file>

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
  import ViewFile from '@/components/view_file.vue';

  interface OpenFile {
    name: string;
    content: string;
  }

  @Component({
    components: { Tab, Tabs, ViewFile }
  })
  export default class MultiFileViewer extends Vue {

    @Prop({default: () => {}, type: Object})
    height_of_view_file!: object;

    files_currently_viewing: OpenFile[] = [];
    active_tab_index = 0;
    scrollable_height: object = {};

    created() {
      this.scrollable_height = this.height_of_view_file;
    }

    add_to_viewing(filename: string, file_contents: string) {
      let file_exists = this.files_currently_viewing.find(
        open_file => open_file.name === filename
      ) !== undefined;
      if (file_exists) {
        return;
      }

      this.files_currently_viewing.push({name: filename, content: file_contents});
      this.active_tab_index = this.files_currently_viewing.length - 1;
    }

    remove_from_viewing(tab_index: number) {
      if (tab_index < this.active_tab_index) {
        this.active_tab_index -= 1;
      }
      this.files_currently_viewing.splice(tab_index, 1);
    }
  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.close-x {
  color: hsl(0.61, 89%, 71%);
  cursor: pointer;
  display: inline-block;
  margin-bottom: 0;
  position: absolute;
  right: 15px;
  top: 12px;
}

.close-x:hover {
  color: hsl(0.61, 85%, 60%);
}

.tab-body {
  background-color: white;
  border: 2px solid hsl(210, 11%, 90%);
  bottom: 0;
  color: #24292e;
  min-width: 800px;
  position: relative;
}

.tab-header {
  margin: 0;
}

.tab-label {
  display: inline-block;
  font-family: "Helvetica Neue", Helvetica;
  margin: 0;
  padding-right: 25px;
}

</style>
