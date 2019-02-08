<template>
  <div id="instructor-files-component">
    <FileUpload ref="instructor_files_upload"
                @upload_files="add_instructor_files($event)">
    </FileUpload>

    <p> {{collapsed}}</p>

    <div id="instructor-files-label"> Uploaded Instructor Files
      <div class="collapse-button"
           @click="collapsed = !collapsed"> ( {{collapsed? 'Show' : 'Collapse'}} ) </div>
    </div>

    <div id="viewing-area">
      <div id="column-of-files"
           v-if="!collapsed">
        <div v-for="instructor_file of instructor_files"
             @click="view_file(instructor_file)"
             class="single-file">
          <div class="file-div file-name">{{instructor_file}}
            <i class="fas fa-file-download download-file"
               @click.stop="download_file(instructor_file)"></i>
          </div>
          <div class="icon-holder">
            <div @click.stop="delete_file(instructor_file)"
                 class="file-div">
              <i class="fas fa-times delete-file"></i>
            </div>
          </div>
          <div class="file-div display-timestamp">
            {{(new Date('2019-02-04T17:53:11.230945Z')).toLocaleString(
            'en-US', last_modified_format
            )}}
          </div>
        </div>
      </div>
      <div id="instructor-file-viewer-wrapper" :style="{left: collapsed ? '0' : '360px'}">
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
           size="large">
      <div id="modal-header">Confirm Deletion</div>
      <hr>
      <div id="modal-body"> Are you sure you want to delete the file
        <b class="file-to-delete">{{file_to_delete}}</b>? This action cannot be undone,
        and any test cases that rely on this file may have to be updated before they run
        correctly again.
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
  import { Component, Vue } from 'vue-property-decorator';

  import FileUpload from '@/components/file_upload.vue';
  import Modal from '@/components/modal.vue';
  import MultiFileViewer from '@/components/multi_file_viewer.vue';

  @Component({
    components: {
      FileUpload,
      Modal,
      MultiFileViewer
    }
  })
  export default class InstructorFiles extends Vue {

    instructor_files: string[] = [];
    last_modified_format = {year: 'numeric', month: 'long', day: 'numeric',
                            hour: 'numeric', minute: 'numeric', second: 'numeric'};
    file_to_delete: string = "";
    collapsed = false;
    loading = true;
    num_files_currently_viewing = 0;

    created() {
      this.instructor_files = ["Player.cpp", "Player.h",
                               "Player_ag_tests.cpp", "unit_test_framework.cpp",
                               "Card_ag_tests.cpp", "HumanPlayer_ag_tests.cpp",
                               "Makefile", "euchre_test50.out.correct",
                               "Card_buggy_impls.cpp", "Card.h",
                               "Butterfly.cpp", "Spider.cpp", "Ant.cpp"];
      this.instructor_files.sort();
      console.log("Created instructor");
    }

    mounted() {
      console.log("Mounted instructor");
    }

    add_instructor_files(files: string[]) {
      console.log(files);
      let instructor_files_upload = <FileUpload> this.$refs.instructor_files_upload;
      instructor_files_upload.clear_files();
      // figure out if updating or adding
      this.instructor_files.sort();
    }

    view_file(file: string) {
      console.log("Viewing File:");
      let file_content = `Hello from file: ${file}`;
      let instructor_files_viewer = <MultiFileViewer> this.$refs.instructor_files_viewer;
      console.log(instructor_files_viewer);
      instructor_files_viewer.add_to_viewing(file, file_content);
    }

    download_file(file: string) {
      console.log("Downloading File:");
      // create url
      // download file call
    }

    delete_file(file: string) {
      console.log("Clicked on delete");
      this.file_to_delete = file;
      let delete_instructor_file_modal = <Modal> this.$refs.delete_instructor_file_modal;
      delete_instructor_file_modal.open();
    }

    delete_file_permanently() {
      this.file_to_delete = "";
      // delete the file in the db
      // delete the file locally using splice.
    }

    cancel_deletion() {
      let delete_instructor_file_modal = <Modal> this.$refs.delete_instructor_file_modal;
      delete_instructor_file_modal.close();
    }
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
  top: 0px;
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

.file-div {
  display: inline-block;
}

.timestamp {
  padding: 0 0 0 5px;
}

.icon-holder {
  position: absolute;
  top: 7px;
  right: 12px;
}

.single-file {
  margin-bottom: 5px;
  cursor: pointer;
  background-color: hsl(220, 40%, 94%);
  width: 280px;
  padding: 10px 60px 10px 10px;
  border-radius: .25rem;
  position: relative;
}

.file-name {
  font-size: 16px;
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
