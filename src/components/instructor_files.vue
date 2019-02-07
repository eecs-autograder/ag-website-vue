<template>
  <div id="instructor-files-component">

    <FileUpload ref="instructor_file_upload"
                @upload_files="log_uploaded_files($event)">
    </FileUpload>

    <p id="file-side-title"> Uploaded Files </p>
    <div id="viewing-area">

      <div id="container-of-files">
        <div v-for="instructor_file of instructor_files"
             @click="view_file(instructor_file)"
             class="file-stuff-container">

          <div class="file-div file-name"> {{instructor_file}} </div>

          <div class="icon-holder">
            <!--<div @click.stop="download_file(instructor_file)"-->
            <!--class="file-div">-->
            <!--<i class="fas fa-file-download download-file" title="Download"></i>-->
            <!--</div>-->

            <div @click.stop="delete_file(instructor_file)"
                 class="file-div">
              <!--<i class="fas fa-trash delete-file"></i>-->
              <i class="fas fa-times delete-file"></i>
            </div>
          </div>

          <!--<div class="file-div display-timestamp">-->
          <!--<i class="far fa-clock" title="2019-02-04T17:53:11.230945Z"></i>-->
          <!--</div>-->

          <div class="file-div display-timestamp">
            {{(new Date('2019-02-04T17:53:11.230945Z')).toLocaleString(
                'en-US', last_modified_format
            )}}
            <!--<i class="far fa-clock"></i>-->
          </div>
        </div>
      </div>

      <div id="instructor-file-viewer-wrapper">
        <MultiFileViewer ref="instructor_files_viewer"
        height_of_view_file="240px">
        </MultiFileViewer>
      </div>

    </div>


    <modal ref="clone_project_modal"
           size="large"
           click_outside_to_close>
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

    instructor_files: string[] = [];
    last_modified_format = {year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric'};

    created() {
      // load Files associated with this project
      // sort Files
      this.instructor_files = ["Player.cpp", "Player.h",
                               "Player_ag_tests.cpp", "unit_test_framework.cpp",
                               "Card_ag_tests.cpp", "HumanPlayer_ag_tests.cpp",
                               "Makefile", "euchre_test50.out.correct",
                               "Card_buggy_impls.cpp", "Card.h"];
      this.instructor_files.sort();
      console.log("Created");
    }

    log_uploaded_files(files: string[]) {
      // make http call --> does it update the files?
      // sort files again
      console.log(files);
    }

    view_file(file: string) {
      console.log("Viewing File:");
      // console.log(file);
      // let instructor_file_viewer = <MultiFileViewer> this.$refs.instructor_file_viewer;
    }

    download_file(file: string) {
      console.log("Downloading File:");
      // console.log(file);
    }

    delete_file(file: string) {
      console.log("Deleting File:");
      // console.log(file);
    }




  }

</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';
  /*@import url('https://fonts.googleapis.com/css?family=Fira+Sans');*/
  /*@import url('https://fonts.googleapis.com/css?family=Quicksand');*/

  $current_language: "Quicksand";

#instructor-files-component {
  width: 95%;
  margin-left: 2.5%;
  margin-top: 50px;
  font-family: $current_language;
}

.download-file, .delete-file, .timestamp {
  //color: $ocean-blue;
  /*color: black;*/
  font-size: 16px;
  padding: 0 5px;
  /*padding: 4px 10px 2px 10px;*/
}


.delete-file {
  color: hsl(220, 20%, 85%);
}

.delete-file:hover {
  color: black;
}

.timestamp {
  padding: 0 0 0 5px;
}

.download-file {
  /*padding: 2px 10px 2px 2px;*/
}

.file-div {
  display: inline-block;
}

.icon-holder {
  position: absolute;
  top: 10px;
  right: 10px;
}

.file-stuff-container {
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

.file-name:hover {
  color: $ocean-blue;
}

.display-timestamp {
  display: block;
  padding-top: 5px;
  color: hsl(220, 20%, 70%);
  font-size: 15px;
}

#container-of-files {
  display: inline-block;
  vertical-align: top;
  height: 600px;
  overflow: scroll;
  border-radius: .25rem;
}

#instructor-file-viewer-wrapper {
  height: 600px;
  /*width: 500px;*/
  background-color: hsl(220, 40%, 98%);
  position: absolute;
  right: 0;
  left: 360px;
  top: 0;
  margin-bottom: 100px;
}

::-webkit-scrollbar {
  width: 0;  /* remove scrollbar space */
  background: transparent;  /* optional: just make scrollbar invisible */
}

#viewing-area {
  position: relative;
}

#file-side-title {
  padding-top: 20px;
  padding-left: 10px;
  font-weight: 600;
}

</style>
