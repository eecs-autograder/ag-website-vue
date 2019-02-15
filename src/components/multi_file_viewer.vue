<template>
  <div id="multi-file-viewer">
    <tabs ref="multi-viewing-tabs"
          v-model="active_tab_index"
          tab_active_class="gray-white-theme-active"
          tab_inactive_class="gray-white-theme-inactive">
       <tab v-for="(open_file, index) of files_currently_viewing">
         <tab-header @click.native="active_tab_index = index">
           <div class="tab-header">
             <p class="tab-label">{{open_file.name}}</p>
             <i class="fas fa-times close-x"
                @click="$event.stopPropagation(); remove_from_viewing(index)"></i>
           </div>
         </tab-header>
         <template slot="body">
           <div class="tab-body">
             <view-file
               ref="view_file_component"
               :filename="open_file.name"
               :file_contents="open_file.content"
               :view_file_height="height_of_view_file">
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
  import TabHeader from '@/components/tabs/tab_header.vue';
  import Tabs from '@/components/tabs/tabs.vue';
  import ViewFile from '@/components/view_file.vue';

  interface OpenFile {
    name: string;
    content: string;
    id: number | null;
  }

  @Component({
    components: { Tab, Tabs, TabHeader, ViewFile }
  })
  export default class MultiFileViewer extends Vue {

    @Prop({default: "", type: String})
    height_of_view_file!: string;

    files_currently_viewing: OpenFile[] = [];
    active_tab_index = 0;

    add_to_viewing(filename: string, file_contents: string, id: number | null = null) {
      let file_exists = this.files_currently_viewing.find(
        open_file => open_file.name === filename
      ) !== undefined;
      if (file_exists) {
        this.active_tab_index = this.files_currently_viewing.findIndex(
          (open_file) => open_file.name === filename
        );
        return;
      }
      this.files_currently_viewing.push({name: filename, content: file_contents, id: id});
      this.active_tab_index = this.files_currently_viewing.length - 1;
      this.$emit('num_files_viewing_changed', this.files_currently_viewing.length);
    }

    rename_file(id: number, new_name: string) {
      let index = this.files_currently_viewing.findIndex((open_file) => open_file.id === id);
      if (index !== -1) {
        Vue.set(this.files_currently_viewing, index, {
          name: new_name,
          content: this.files_currently_viewing[index].content,
          id: id
        });
      }
    }

    remove_from_viewing(tab_index: number) {
      if (tab_index < this.active_tab_index) {
        this.active_tab_index -= 1;
      }
      this.files_currently_viewing.splice(tab_index, 1);
      this.$emit('num_files_viewing_changed', this.files_currently_viewing.length);
    }

    remove_by_name(name: string) {
      let index = this.files_currently_viewing.findIndex((open_file) => open_file.name === name);
      if (index !== -1) {
        this.remove_from_viewing(index);
      }
    }
  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.close-x {
  background-color: inherit;
  color: hsl(220, 20%, 85%);
  cursor: pointer;
  font-size: 16px;
  padding: 12px 15px;
  position: absolute;
  right: 6px;
  top: 5.5px;
}
.close-x:hover {
  color: hsl(220, 20%, 55%);
}

.tab-body {
  background-color: white;
  border: 2px solid hsl(210, 11%, 90%);
  bottom: 0;
  color: #24292e;
  position: relative;
}

.tab-header {
  background-color: inherit;
  margin: 0;
  overflow: hidden;
}

.tab-label {
  display: inline-block;
  margin: 0;
  padding-right: 25px;
}
@media only screen and (min-width: 481px) {
  .close-x {
    background-color: inherit;
    font-size: inherit;
    padding: 3px 5px;
    right: 8px;
    top: 10px;
  }
}

@media only screen and (min-width: 481px) {
  .close-x {
    background-color: inherit;
    font-size: inherit;
    padding: 3px 5px;
    right: 8px;
    top: 10px;
  }
}

</style>
