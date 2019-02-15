<template>
  <div id="instructor-files-component" v-if="project !== null">
    <FileUpload ref="instructor_files_upload"
                @upload_files="add_instructor_files($event)">
    </FileUpload>

    <div id="instructor-files-label"> Uploaded Instructor Files
      <div class="collapse-button"
           @click="collapsed = !collapsed"> ( {{collapsed? 'Show' : 'Collapse'}} ) </div>
    </div>

    <div id="viewing-area">
      <div id="column-of-files"
           v-if="!collapsed">
        <div v-for="instructor_file of instructor_files" :key="instructor_file.pk">
          <single-file :file="instructor_file"
                       @open_file="view_file($event)">
          </single-file>
        </div>
      </div>
      <div id="instructor-file-viewer-wrapper"
           :style="{left: collapsed ? '0' : '390px'}">
        <MultiFileViewer ref="instructor_files_viewer"
                         height_of_view_file="600px"
                         @num_files_viewing_changed="num_files_currently_viewing = $event">
        </MultiFileViewer>
        <div v-if="num_files_currently_viewing === 0"
             class="helpful-message">
          Click on a file to view its contents.
        </div>
      </div>
    </div>

  </div>
</template>


<script lang="ts">
  import { array_get_unique, array_has_unique, array_remove_unique } from '../../utils';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import { InstructorFile, InstructorFileObserver, Project } from 'ag-client-typescript';

  import FileUpload from '@/components/file_upload.vue';
  import Modal from '@/components/modal.vue';
  import MultiFileViewer from '@/components/multi_file_viewer.vue';
  import SingleFile from '@/components/instructor_files/single_file.vue';
  import ValidatedInput from '@/components/validated_input.vue';

  @Component({
    components: {
      FileUpload,
      Modal,
      MultiFileViewer,
      SingleFile,
      ValidatedInput
    }
  })
  export default class InstructorFiles extends Vue implements InstructorFileObserver {

    instructor_files: InstructorFile[] = [];
    last_modified_format = {year: 'numeric', month: 'long', day: 'numeric',
                            hour: 'numeric', minute: 'numeric', second: 'numeric'};
    collapsed = false;
    num_files_currently_viewing = 0;

    @Prop({required: true, type: Project})
    project!: Project;

    async created() {
      InstructorFile.subscribe(this);
      this.instructor_files = await InstructorFile.get_all_from_project(this.project.pk);
      this.sort_files();
      console.log("Created instructor files");
    }

    destroyed() {
      InstructorFile.unsubscribe(this);
    }

    rename_file_in_multi_file_viewer(names: string[]) {
      let instructor_files_viewer = <MultiFileViewer> this.$refs.instructor_files_viewer;
      instructor_files_viewer.update_name_of_file(names[0], names[1]);
      this.sort_files();
    }

    sort_files() {
      this.instructor_files.sort(
        (file_a: InstructorFile, file_b: InstructorFile) => {
        if (file_a.name <= file_b.name) {
          return -1;
        }
        else {
          return 1;
        }
      });
    }

    async view_file(file: InstructorFile) {
      let file_content = await file.get_content();
      let instructor_files_viewer = <MultiFileViewer> this.$refs.instructor_files_viewer;
      instructor_files_viewer.add_to_viewing(file.name, file_content, file.pk);
    }

    open_delete_file_modal(file: InstructorFile) {
      this.file_to_delete = file;
      let delete_instructor_file_modal = <Modal> this.$refs.delete_instructor_file_modal;
      delete_instructor_file_modal.open();
    }

    cancel_deletion() {
      let delete_instructor_file_modal = <Modal> this.$refs.delete_instructor_file_modal;
      delete_instructor_file_modal.close();
      this.file_to_delete = null;
    }

    async add_instructor_files(files: File[]) {
      for (let file of files) {
        let file_already_exists = array_has_unique(
          this.instructor_files,
          file.name,
          (file: InstructorFile, file_name_to_add: string) =>
            file_name_equal(file.name, file_name_to_add)
        );

        if (file_already_exists) {
          console.log("already exists");
          let file_to_update = array_get_unique(
            this.instructor_files,
            file.name,
            (file: InstructorFile, file_name_to_add: string) =>
              file_name_equal(file.name, file_name_to_add)
          );
          console.log(file_to_update.name);
          try {
            let result = await file_to_update.set_content(file);
          }
          catch (e) {
            console.log(e);
          }
        }
        else {
          try {
            console.log("New file: " + file.name);
            let file_to_add = await InstructorFile.create(this.project.pk, file.name, file);
            this.instructor_files.push(file_to_add);
          }
          catch (error) {
            console.log(error);
          }
        }
      }

      let instructor_files_upload = <FileUpload> this.$refs.instructor_files_upload;
      instructor_files_upload.clear_files();
      this.sort_files();
    }

    update_instructor_file_content_changed(instructor_file: InstructorFile): void {
    }

    update_instructor_file_created(instructor_file: InstructorFile): void {
    }

    update_instructor_file_deleted(instructor_file: InstructorFile): void {
      array_remove_unique(this.instructor_files, instructor_file.pk, (file, pk) => file.pk === pk);
      (<MultiFileViewer> this.$refs.instructor_files_viewer).remove_by_name(instructor_file.name);
    }

    update_instructor_file_renamed(instructor_file: InstructorFile): void {
      console.log("Here");
      let index = this.instructor_files.findIndex((file) => file.pk === instructor_file.pk);
      if (index !== -1) {
        console.log("There");
        this.instructor_files[index] = instructor_file;
        (<MultiFileViewer> this.$refs.instructor_files_viewer).rename_file(
          instructor_file.pk, instructor_file.name
        );
        console.log(instructor_file.name);
      }
    }
  }

  function file_name_equal(file_name_a: string, file_name_b: string) {
    return file_name_a === file_name_b;
  }

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import url('https://fonts.googleapis.com/css?family=Quicksand');

$current_language: "Quicksand";

.file-to-delete {
  background-color: hsl(220, 20%, 85%);
  letter-spacing: 1px;
}

#modal-header {
  padding: 5px 10px;
  font-family: $current-language;
}

#modal-body {
  padding: 10px 10px 20px 10px;
  font-family: $current-language;
}

#modal-button-container {
  text-align: right;
  padding: 10px;
}

.modal-cancel-button, .modal-delete-button {
  border-radius: 2px;
  font-family: $current-language;
  font-size: 15px;
  font-weight: bold;
}

.modal-cancel-button {
  @extend .gray-button;
}

.modal-delete-button {
  @extend .red-button;
  margin-right: 20px;
}

.collapse-button {
  display: inline;
  padding-left: 5px;
  color: hsl(220, 30%, 60%);
  cursor: pointer;
}

.collapse-button:hover {
  color: hsl(220, 30%, 35%);
}

.helpful-message {
  box-sizing: border-box;
  text-align: center;
  padding: 10px;
  position: absolute;
  width: 100%;
  min-width: 250px;
  top: 0;
}

#instructor-files-component {
  box-sizing: border-box;
  width: 95%;
  margin-left: 2.5%;
  margin-right: 2.5%;
  margin-top: 50px;
  font-family: $current_language;
}

#column-of-files {
  display: inline-block;
  vertical-align: top;
  height: 665px;
  overflow: scroll;
  border-radius: .25rem;
}

#instructor-file-viewer-wrapper {
  position: absolute;
  right: 0;
  left: 360px;
  top: -7px;
  margin-bottom: 100px;
  min-width: 50px;
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

</style>
