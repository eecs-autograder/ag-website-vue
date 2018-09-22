<template>
  <div id="multi-file-viewer">
    <tabs ref="multi-viewing-tabs"
          v-model="active_tab_index"
          tab_active_class="gray-white-theme-active"
          tab_inactive_class="gray-white-theme-inactive">
       <tab ref="single-tab"
            v-for="(filename, index) of Array.from(files_currently_viewing)"
            @click="update_viewing(index)">

         <template slot="header">
           <div class="tab-header">
             <p class="tab-label"> {{ filename }} </p>
             <i class="fas fa-times close-x"
                @click="$event.stopPropagation(); remove_from_viewing(filename, index)"></i>
           </div>
         </template>

         <template slot="body">
           <div class="tab-body">

             <view-file
               ref="view_file_component"
               :incoming_filename="filename"
               :incoming_file_contents="get_contents(filename)"
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

  @Component({
    components: { Tab, Tabs, ViewFile }
  })

  export default class MultiFileViewer extends Vue {

    @Prop({default: () => {}, type: Object})
    height_of_view_file!: object;

    file_names_and_content = new Map<string, string>();
    files_currently_viewing: string[] = [];
    active_tab_index = -1;
    scrollable_height: object = {};

    created() {
      this.scrollable_height = this.height_of_view_file;
    }

    get_contents(filename: string) {
      return this.file_names_and_content.get(filename);
    }

    update_viewing(index: number) {
      this.active_tab_index = index;
    }

    add_to_viewing(filename: string, file_contents: string) {
      if (!this.file_names_and_content.has(filename)) {
        let names_and_content_copy = new Map(this.file_names_and_content);
        let currently_viewing_copy = this.files_currently_viewing;
        names_and_content_copy.set(filename, file_contents);
        currently_viewing_copy.push(filename);
        this.file_names_and_content = names_and_content_copy;
        this.files_currently_viewing = currently_viewing_copy;
        this.active_tab_index = this.files_currently_viewing.length - 1;
      }
    }

    remove_from_viewing(filename_to_delete: string, tab_index: number) {
      let names_and_content_copy = new Map(this.file_names_and_content);
      let currently_viewing_copy = this.files_currently_viewing;
      let old_size = this.file_names_and_content.size;
      let old_active_index = this.active_tab_index;
      let is_rightmost_tab = (old_size - 1) === old_active_index;

      names_and_content_copy.delete(filename_to_delete);
      currently_viewing_copy.splice(tab_index, 1);
      this.file_names_and_content = names_and_content_copy;
      this.files_currently_viewing = currently_viewing_copy;
      if (tab_index < this.active_tab_index && !is_rightmost_tab) {
        this.active_tab_index -= 1;
      }
    }

  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.close-x {
  color: $none-correct-color;
  cursor: pointer;
  display: inline-block;
  margin-bottom: 0;
  position: absolute;
  right: 15px;
  top: 12px;
}

.close-x:hover {
  color: $none-correct-hover-color;
}

.tab-body {
  background-color: white;
  border: 2px solid hsl(210, 11%, 90%);
  bottom: 0;
  color: #24292e;
  min-width: 800px;
  position: relative;
  z-index: 15;
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
