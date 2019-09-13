<template>
  <div id="instructor-files-component">
    <FileUpload ref="instructor_files_upload"
                @upload_files="add_instructor_files($event)">
    </FileUpload>

    <div class="sidebar-container">
      <div class="sidebar-menu">
        <div :class="['sidebar-header', {'sidebar-header-closed': d_collapsed}]">
          <span class="collapse-show-button" @click="d_collapsed = !d_collapsed">
            <i class="fas fa-bars"></i>
          </span>
          <span class="header-text"
                v-if="!d_collapsed || d_current_filename === null">Uploaded Files</span>
        </div>

        <div class="sidebar-content" v-if="!d_collapsed">
          <single-instructor-file v-for="instructor_file of instructor_files"
                                  :key="instructor_file.pk"
                                  :file="instructor_file"
                                  @click="view_file(instructor_file)"
                                  class="sidebar-item"
                                  :class="{'active': d_current_filename === instructor_file.name}">
          </single-instructor-file>
        </div>
      </div>
      <div :class="['body', {'body-closed': d_collapsed}]" v-if="d_current_filename !== null">
        <view-file :filename="d_current_filename"
                   :file_contents="current_file_contents"></view-file>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { InstructorFile, InstructorFileObserver, Project } from 'ag-client-typescript';

import FileUpload from '@/components/file_upload.vue';
import MultiFileViewer from '@/components/multi_file_viewer.vue';
import ViewFile from '@/components/view_file.vue';
import { SafeMap } from '@/safe_map';
import { array_get_unique, array_has_unique, array_remove_unique, toggle } from '@/utils';

import SingleInstructorFile from './single_instructor_file.vue';

@Component({
  components: {
    FileUpload,
    MultiFileViewer,
    SingleInstructorFile,
    ViewFile,
  }
})
export default class InstructorFiles extends Vue implements InstructorFileObserver {
  @Prop({required: true, type: Project})
  project!: Project;

  d_collapsed = false;
  instructor_files: InstructorFile[] = [];

  d_open_files: SafeMap<string, Promise<string>> = new SafeMap();

  d_current_filename: string | null  = null;

  get current_file_contents() {
    if (this.d_current_filename === null) {
      // istanbul ignore next
      throw new Error('current_file_contents requested when d_current_filename is null');
    }
    return this.d_open_files.get(this.d_current_filename);
  }

  async created() {
    InstructorFile.subscribe(this);
    this.instructor_files = await InstructorFile.get_all_from_project(this.project.pk);
  }

  destroyed() {
    InstructorFile.unsubscribe(this);
  }

  sort_files() {
    this.instructor_files.sort(
      (file_a: InstructorFile, file_b: InstructorFile) =>
        file_a.name.localeCompare(file_b.name));
  }

  view_file(file: InstructorFile) {
    if (!this.d_open_files.has(file.name)) {
      this.d_open_files.set(file.name, file.get_content());
    }
    this.d_current_filename = file.name;
  }

  async add_instructor_files(files: File[]) {
    for (let file of files) {
      let file_already_exists = array_has_unique(
        this.instructor_files,
        file.name,
        (file_a: InstructorFile, file_name_to_add: string) => file_a.name === file_name_to_add
      );

      if (file_already_exists) {
        let file_to_update = array_get_unique(
          this.instructor_files,
          file.name,
          (file_a: InstructorFile, file_name_to_add: string) => file_a.name === file_name_to_add
        );
        await file_to_update.set_content(file);
      }
      else {
          let file_to_add = await InstructorFile.create(this.project.pk, file.name, file);
          this.instructor_files.push(file_to_add);
      }
    }
    (<FileUpload> this.$refs.instructor_files_upload).clear_files();
    this.sort_files();
  }

  update_instructor_file_content_changed(instructor_file: InstructorFile,
                                         file_content: string) {
    let new_open_files = new SafeMap(this.d_open_files);
    new_open_files.set(instructor_file.name, Promise.resolve(file_content));
    this.d_open_files = new_open_files;
  }

  update_instructor_file_created(instructor_file: InstructorFile) { }

  update_instructor_file_deleted(instructor_file: InstructorFile) {
    if (this.d_current_filename === instructor_file.name) {
      this.d_current_filename = null;
    }
    array_remove_unique(this.instructor_files, instructor_file.pk, (file, pk) => file.pk === pk);

    let new_open_files = new SafeMap(this.d_open_files);
    new_open_files.delete(instructor_file.name);
    this.d_open_files = new_open_files;
  }

  update_instructor_file_renamed(instructor_file: InstructorFile) {
    let index = this.instructor_files.findIndex((file) => file.pk === instructor_file.pk);
    Vue.set(this.instructor_files, index, instructor_file);

    this.sort_files();
  }
}

</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";
@import '@/styles/button_styles.scss';
@import '@/styles/collapsible_sidebar.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

$sidebar-header-height: 35px;

@include collapsible-sidebar(
  $sidebar-width: 300px,
  $sidebar-header-height: $sidebar-header-height,
  $border-color: hsl(220, 40%, 94%),
  $background-color: white,
  $active-color: $pebble-light
);

.sidebar-container {
  margin-top: 15px;
}

.sidebar-header {
  height: $sidebar-header-height;
  padding-top: 8px;
  padding-bottom: 8px;
  font-weight: bold;
  font-size: 17px;
}

.collapse-show-button {
  cursor: pointer;
  background: white;
  border: none;
  color: $ocean-blue;
  outline: none;
  padding: 0 8px;
  font-size: 16px;
}

.collapse-show-button:hover {
  color: darken($ocean-blue, 10);
}

.header-text {
  padding-right: 8px;
}

.sidebar-item {
  border-top: 1px solid hsl(220, 40%, 94%);
}

</style>
