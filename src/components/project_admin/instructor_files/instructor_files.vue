<template>
  <div id="instructor-files-component">
    <FileUpload ref="instructor_files_upload"
                @upload_files="add_instructor_files($event)">
    </FileUpload>

    <div id="instructor-files-label"> Uploaded Instructor Files
      <div class="collapse-show-area" @click="d_collapsed = !d_collapsed">
        <div :class="['fas',
                       d_collapsed ? 'fa-plus-square' : 'fa-minus-square',
                      'collapse-show-icon']">
        </div>
        <button class="collapse-show-button"
                type="button">
          ( {{d_collapsed? 'Show' : 'Collapse'}} )
        </button>
      </div>
    </div>

    <div id="viewing-area">
      <div id="column-of-files" :style="{display: d_collapsed? 'none' : 'block'}">
        <div v-for="instructor_file of instructor_files" :key="instructor_file.pk">
          <single-instructor-file :file="instructor_file"
                                  @open_file="view_file($event)">
          </single-instructor-file>
        </div>
      </div>
      <div id="instructor-file-viewer-wrapper"
           :style="{left: d_collapsed ? '0' : '390px'}">
        <MultiFileViewer ref="instructor_files_viewer"
                         height_of_view_file="600px"
                         @num_files_viewing_changed="num_files_currently_viewing = $event">
          <div v-if="!d_collapsed" slot="view_files_message" style="min-width: 280px;">
            Click on a file to view its contents.
          </div>
        </MultiFileViewer>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { InstructorFile, InstructorFileObserver, Project } from 'ag-client-typescript';

import FileUpload from '@/components/file_upload.vue';
import MultiFileViewer from '@/components/multi_file_viewer.vue';
import { array_get_unique, array_has_unique, array_remove_unique } from '@/utils';

import SingleInstructorFile from './single_instructor_file.vue';

@Component({
  components: {
    FileUpload,
    MultiFileViewer,
    SingleInstructorFile
  }
})
export default class InstructorFiles extends Vue implements InstructorFileObserver {

  d_collapsed = false;
  instructor_files: InstructorFile[] = [];
  num_files_currently_viewing = 0;

  @Prop({required: true, type: Project})
  project!: Project;

  async created() {
    InstructorFile.subscribe(this);
    this.instructor_files = await InstructorFile.get_all_from_project(this.project.pk);
    this.sort_files();
  }

  destroyed() {
    InstructorFile.unsubscribe(this);
  }

  sort_files() {
    this.instructor_files.sort(
      (file_a: InstructorFile, file_b: InstructorFile) =>
        file_a.name.localeCompare(file_b.name));
  }

  async view_file(file: InstructorFile) {
    (<MultiFileViewer> this.$refs.instructor_files_viewer).add_to_viewing(
      file.name, file.get_content(), file.pk
    );
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
    (<MultiFileViewer> this.$refs.instructor_files_viewer).update_contents_by_name(
      instructor_file.name, Promise.resolve(file_content)
    );
  }

  update_instructor_file_created(instructor_file: InstructorFile) { }

  update_instructor_file_deleted(instructor_file: InstructorFile) {
    array_remove_unique(this.instructor_files, instructor_file.pk, (file, pk) => file.pk === pk);
    (<MultiFileViewer> this.$refs.instructor_files_viewer).remove_by_name(instructor_file.name);
  }

  update_instructor_file_renamed(instructor_file: InstructorFile) {
    let index = this.instructor_files.findIndex((file) => file.pk === instructor_file.pk);
    Vue.set(this.instructor_files, index, instructor_file);
    (<MultiFileViewer> this.$refs.instructor_files_viewer).rename_file(
      instructor_file.pk, instructor_file.name
    );
    this.sort_files();
  }
}

</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";
@import '@/styles/button_styles.scss';

#instructor-files-component {
  box-sizing: border-box;
  width: 95%;
  margin-left: 2.5%;
  margin-right: 2.5%;
  margin-top: 25px;
}

#column-of-files {
  display: inline-block;
  vertical-align: top;
  max-height: 665px;
  overflow: scroll;
  border-radius: .25rem;
  box-sizing: border-box;
}

#instructor-file-viewer-wrapper {
  position: absolute;
  right: 0;
  left: 360px;
  top: -7px;
  margin-bottom: 100px;
  min-width: 50px;
  box-sizing: border-box;
}

::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

#viewing-area {
  position: relative;
}

#instructor-files-label {
  padding: 40px 10px 15px 10px;
  font-weight: 600;
  font-size: 17px;
}

.collapse-show-area {
  display: inline-block;
  cursor: pointer;
  padding-left: 5px;
}

.collapse-show-icon {
  color: $ocean-blue;
  font-size: 20px;
  padding: 0 5px;
  display: inline-block;
  position: relative;
  top: 2px;
}

.collapse-show-icon:hover {
  color: darken($ocean-blue, 10);
}

.collapse-show-button {
  display: none;
}

@media only screen and (min-width: 481px) {
  .collapse-show-button {
    background: white;
    border: none;
    color: $ocean-blue;
    outline: none;
    display: inline;
    padding: 0 5px;
    font-size: 16px;
  }

  .collapse-show-button:hover {
    color: darken($ocean-blue, 10);
  }

  .collapse-show-icon {
    display: none;
  }
}

</style>
