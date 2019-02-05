<template>
  <div id="instructor-files-component">

    <FileUpload ref="instructor_file_upload"
                @upload_files="log_uploaded_files($event)">
    </FileUpload>

    <div id="viewing-area">
      <p id="file-side-title"> Uploaded Files </p>
      <div v-for="instructor_file of instructor_files"
           @click="view_file(instructor_file)"
           class="file-stuff-container">
        <div class="file-div"> {{instructor_file}} </div>
        <div @click="download_file(instructor_file)"
             class="file-div">
          <i class="fas fa-file-download download-file"></i>
        </div>
        <div @click="delete_file(instructor_file)"
             class="file-div">
          <i class="fas fa-trash delete-file"></i>
        </div>
        <div> Timestamp </div>
      </div>
    </div>

    <div id="instructor-file-viewer-wrapper">
      <MultiFileViewer ref="instructor_files_viewer"
                       height_of_view_file="240px">
      </MultiFileViewer>
    </div>


    <modal ref="clone_project_modal"
           size="large"
           click_outside_to_close>
        <h2 v-if="project_to_copy !== null"> HELLO </h2>
        <hr>
        <div> </div>
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

    instructor_files: string[] = ["Player.cpp", "Player.h", "Player_ag_tests.cpp", "unit_test_framework.cpp"];

    log_uploaded_files(files: string[]) {
      console.log(files);
    }

    view_file(file: string) {
      console.log("Viewing File:");
      console.log(file);
      let instructor_file_viewer = <MultiFileViewer> this.$refs.instructor_file_viewer;
    }

    download_file(file: string) {
      console.log("Downloading File:");
      console.log(file);
    }

    delete_file(file: string) {
      console.log("Deleting File:");
      console.log(file);
    }




  }

</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';
  @import url('https://fonts.googleapis.com/css?family=Fira+Sans');
  @import url('https://fonts.googleapis.com/css?family=Quicksand');

  $current_language: "Quicksand";

#instructor-files-component {
  width: 90%;
  margin-left: 5%;
  margin-top: 50px;
  font-family: $current_language;
}

.download-file {
  color: $ocean-blue;
  font-size: 20px;
}

.delete-file {
  color: orange;
  font-size: 20px;
}

.file-div {
  display: inline-block;
}

.file-stuff-container {
  margin-bottom: 20px;
}

#instructor-file-viewer-wrapper {
  /*background-color: purple;*/
}

</style>
