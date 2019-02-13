<template>
  <div id="instructor-files-component">
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
        <div v-for="instructor_file_wrapper of instructor_file_wrappers"
             @click="view_file(instructor_file_wrapper.file)"
             class="single-file">
          <div class="file-div file-name">
            <span v-if="instructor_file_wrapper.editing">
              <div class="validated-input-wrapper">
              <validated-input ref='validated_input_2'
                               spellcheck="false"
                               v-model="instructor_file_wrapper.new_file_name"
                               :validators="[]"
                               input_style="border-radius: 2px;
                                            border: 0px solid hsl(220, 30%, 72%);
                                            padding: 3px 5px;"
              ></validated-input>
              </div>
              <div class="update-file-name-button"
                   @click="rename_file(instructor_file_wrapper)"> Update </div>
            </span>
            <span v-else>
              {{instructor_file_wrapper.file.name}} {{instructor_file_wrapper.file.pk}}
              <div class="icon-holder">
                <i class="fas fa-file-download download-file"
                   @click.stop="download_file(instructor_file_wrapper.file)"></i>
                <i class="fas fa-pencil-alt edit-file-name"
                   @click="instructor_file_wrapper.editing = true"></i>
              </div>
            </span>
          </div>
          <i class="fas fa-times delete-file"
             @click.stop="open_delete_file_modal(instructor_file_wrapper)">
          </i>
          <div class="file-div display-timestamp">
            {{(new Date(instructor_file_wrapper.file.last_modified)).toLocaleString(
            'en-US', last_modified_format
            )}}
          </div>
        </div>
      </div>
      <div id="instructor-file-viewer-wrapper" :style="{left: collapsed ? '0' : '390px'}">
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

    <modal ref="delete_instructor_file_modal"
           size="large"
           :include_closing_x="false">
      <div id="modal-header">Confirm Deletion</div>
      <hr>
      <div id="modal-body"> Are you sure you want to delete the file
        <b class="file-to-delete">
          {{file_to_delete_wrapper ? file_to_delete_wrapper.file.name : ''}}</b>?
        This action cannot be undone, and any test cases that rely on this file may have
        to be updated before they run correctly again.
      </div>

      <div id="modal-button-container">
        <div class="modal-delete-button"
             @click="delete_file_permanently"> Delete </div>
        <div class="modal-cancel-button"
             @click="cancel_deletion"> Cancel </div>
      </div>
    </modal>

  </div>
</template>


<script lang="ts">
  import { array_get_unique, array_has_unique } from '@/utils';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import { InstructorFile, Project } from 'ag-client-typescript';

  import FileUpload from '@/components/file_upload.vue';
  import Modal from '@/components/modal.vue';
  import MultiFileViewer from '@/components/multi_file_viewer.vue';
  import ValidatedInput from '@/components/validated_input.vue';

  interface InstructorFileWrapper {
    file: InstructorFile;
    new_file_name: string;
    editing: boolean;
  }

  @Component({
    components: {
      FileUpload,
      Modal,
      MultiFileViewer,
      ValidatedInput
    }
  })
  export default class InstructorFiles extends Vue {

    instructor_file_wrappers: InstructorFileWrapper[] = [];
    last_modified_format = {year: 'numeric', month: 'long', day: 'numeric',
                            hour: 'numeric', minute: 'numeric', second: 'numeric'};
    file_to_delete_wrapper: InstructorFileWrapper | null = null;
    collapsed = false;
    num_files_currently_viewing = 0;

    @Prop({required: true, type: Project})
    project!: Project;

    async created() {
      let project_files: InstructorFile[] = await InstructorFile.get_all_from_project(2);
      for (let file of project_files) {
        this.instructor_file_wrappers.push({file: file, new_file_name: file.name, editing: false});
      }
      this.sort_files();
    }

    // Getting 500 error
    async rename_file(file_wrapper: InstructorFileWrapper) {
      let prev_name = file_wrapper.file.name;
      let new_name = file_wrapper.new_file_name;
      await file_wrapper.file.rename(new_name);
      file_wrapper.editing = false;
      let instructor_files_viewer = <MultiFileViewer> this.$refs.instructor_files_viewer;
      instructor_files_viewer.update_name_of_file(new_name, prev_name);
      file_wrapper.new_file_name = file_wrapper.file.name;
    }

    sort_files() {
      this.instructor_file_wrappers.sort(
        (file_a_wrapper: InstructorFileWrapper, file_b_wrapper: InstructorFileWrapper) => {
        if (file_a_wrapper.file.name <= file_b_wrapper.file.name) {
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
      instructor_files_viewer.add_to_viewing(file.name, file_content);
    }

    open_delete_file_modal(file_wrapper: InstructorFileWrapper) {
      this.file_to_delete_wrapper = file_wrapper;
      let delete_instructor_file_modal = <Modal> this.$refs.delete_instructor_file_modal;
      delete_instructor_file_modal.open();
    }

    async delete_file_permanently() {
      try {
        await this.file_to_delete_wrapper!.file.delete();
        this.instructor_file_wrappers.splice(this.instructor_file_wrappers.indexOf(this.file_to_delete_wrapper), 1);
        this.file_to_delete_wrapper = null;
      }
      catch (error) {
        console.log(error);
      }
      let delete_instructor_file_modal = <Modal> this.$refs.delete_instructor_file_modal;
      delete_instructor_file_modal.close();
    }

    cancel_deletion() {
      let delete_instructor_file_modal = <Modal> this.$refs.delete_instructor_file_modal;
      delete_instructor_file_modal.close();
      this.file_to_delete_wrapper = null;
    }

    // underscores are being added to files with spaces in between their words
    async add_instructor_files(files: File[]) {
      for (let file of files) {
        let file_already_exists = array_has_unique(
          this.instructor_file_wrappers,
          file.name,
          (file_wrapper: InstructorFileWrapper, file_name_to_add: string) =>
            file_name_equal(file_wrapper.file.name, file_name_to_add));

        if (file_already_exists) {
          console.log("already exists");
          let file_wrapper_to_update: InstructorFileWrapper = array_get_unique(
            this.instructor_file_wrappers,
            file.name,
            (file_wrapper: InstructorFileWrapper, file_name_to_add: string) =>
              file_name_equal(file_wrapper.file.name, file_name_to_add));
          console.log(file_wrapper_to_update.file.name);
          try {
            let result = await file_wrapper_to_update.file.set_content(file);
            console.log(result);
          }
          catch (e) {
            console.log(e);
          }
        }
        else {
          try {
            console.log(file.name);
            let file_to_add = await InstructorFile.create(2, file.name, file);
            console.log(file_to_add);
            this.instructor_file_wrappers.push(
              {file: file_to_add, new_file_name: file_to_add.name, editing: false}
            );
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

    async download_file(file: InstructorFile) {
      let url = `/api/instructor_files/${file.pk}/content/`;
      // uhhhh?? ?
    }
  }

  function file_name_equal(file_name_a: string, file_name_b: string) {
    console.log("File name A: " + file_name_a);
    console.log("File name B: " + file_name_b);
    console.log(file_name_a === file_name_b);
    return file_name_a === file_name_b;
  }

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import url('https://fonts.googleapis.com/css?family=Quicksand');

$current_language: "Quicksand";

.icon-holder {
  display: inline-block;
  padding-top: 2px;
}

.validated-input-wrapper {
  display: inline-block;
  width: 200px;
  padding-bottom: 2px;
}

.update-file-name-button {
  display: inline-block;
  background-color: hsl(220, 30%, 60%);
  border-radius: 2px;
  padding: 3px 6px 4px 6px;
  color: white;
  margin-left: 12px;
}

.update-file-name-button:hover {
  background-color: hsl(220, 30%, 45%);
}


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

.delete-file {
  position: absolute;
  top: 8px;
  right: 11px;
  color: hsl(220, 20%, 75%);
}

.delete-file:hover {
  color: hsl(220, 20%, 55%);
}

.download-file {
  color: hsl(220, 30%, 60%);
  padding-left: 5px;
}

.download-file:hover {
  color: hsl(220, 30%, 35%);
}

.edit-file-name {
  color: hsl(220, 30%, 60%);
  padding-left: 8px;
}

.edit-file-name:hover {
  color: hsl(220, 30%, 35%);
}

.save-file-name {
  color: hsl(220, 30%, 60%);
  padding-left: 5px;
}

.save-file-name:hover {
  color: hsl(220, 30%, 35%);
}

.file-div {
  display: inline-block;
}

.timestamp {
  padding: 0 0 0 5px;
}

.single-file {
  margin-bottom: 5px;
  cursor: pointer;
  background-color: hsl(220, 40%, 94%);
  width: 380px;
  padding: 10px 82px 10px 10px;
  border-radius: .25rem;
  position: relative;
  box-sizing: border-box;
  word-wrap: break-word;
  word-break: break-word;
}

.file-name {
  font-size: 16px;
  padding-bottom: 1px;
}

.display-timestamp {
  display: block;
  padding-top: 5px;
  color: hsl(220, 20%, 65%);
  font-size: 15px;
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
