<template>
  <div id="instructor-files-component">
    <FileUpload ref="instructor_files_upload"
                @upload_files="add_instructor_files($event)">
    </FileUpload>

    <p>{{collapsed}}</p>

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
          <div class="file-div file-name">
            <span v-if="instructor_file.editing">
              <div class="validated-input-wrapper">
              <validated-input ref='validated_input_2'
                               spellcheck="false"
                               v-model="instructor_file.name"
                               :validators="[]"
                               input_style="border-radius: 2px;
                                            border: 0px solid hsl(220, 30%, 72%);
                                            padding: 3px 5px;"
              ></validated-input>
              </div>
              <div class="update-file-name-button"
                   @click="instructor_file.editing = false"> Update </div>
            </span>
            <span v-else>
              {{instructor_file.name}}
              <i class="fas fa-file-download download-file"
                 @click.stop="download_file(instructor_file)"></i>
              <i class="fas fa-pencil-alt edit-file-name"
                 @click="instructor_file.editing = true"></i>
            </span>
          </div>
          <div @click.stop="delete_file(instructor_file)"
               class="file-div">
            <i class="fas fa-times delete-file"></i>
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
  import { Component, Prop, Vue } from 'vue-property-decorator';

  // import { InstructorFile, Project } from 'ag-client-typescript';
  import { array_add_unique, array_get_unique, array_has_unique } from '@/utils';

  import FileUpload from '@/components/file_upload.vue';
  import Modal from '@/components/modal.vue';
  import MultiFileViewer from '@/components/multi_file_viewer.vue';
  import ValidatedInput from '@/components/validated_input.vue';

  interface InstructorFile {
    name: string;
    editing: boolean;
  }

  interface InstructorFileStuff {
    file: InstructorFile,
    editing: boolean
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

    // instructor_files: InstructorFile[] = [];
    instructor_files: InstructorFile[] = [
      {
        name: "Player.cpp",
        editing: false
      },
      {
        name: "Player.h",
        editing: false
      },
      {
        name: "Player_ag_tests.cpp",
        editing: false
      },
      {
        name: "Card.h",
        editing: false
      },
      {
        name: "Card.cpp",
        editing: false
      },
      {
        name: "Card_ag_tests.cpp",
        editing: false
      },
      {
        name: "Card_buggy_impls.cpp",
        editing: false
      },
      {
        name: "Card_public_test.cpp",
        editing: false
      },
      {
        name: "euchre_test00.out.correct",
        editing: false
      },
      {
        name: "HumanPlayer_ag_tests.cpp",
        editing: false
      },
      {
        name: "Makefile",
        editing: false
      },
      {
        name: "unit_test_framework.cpp",
        editing: false
      }
    ];
    last_modified_format = {year: 'numeric', month: 'long', day: 'numeric',
                            hour: 'numeric', minute: 'numeric', second: 'numeric'};
    file_to_delete: InstructorFile | null = null;
    collapsed = false;
    loading = true;
    num_files_currently_viewing = 0;

    // @Prop({required: true, type: Project})
    // project!: Project;

    cancel_deletion() {}
    add_instructor_files(files: InstructorFile[]) {}
    delete_file_permanently(file: InstructorFile) {}
    edit_file_name() {}
    view_file(file: InstructorFile) {}
    // async created() {
    //   this.instructor_files = await InstructorFile.get_all_from_project(this.project.pk);
    //   this.instructor_files.sort((file_a: InstructorFile, file_b: InstructorFile) => {
    //     if (file_a.name <= file_b.name) {
    //       return -1;
    //     }
    //     else {
    //       return 1;
    //     }
    //   });
    //   console.log("Created instructor files");
    // }
    //
    // async add_instructor_files(files: File[]) {
    //   for (let file of files) {
    //     let file_already_exists = array_has_unique(
    //       this.instructor_files,
    //       file.name,
    //       (file: InstructorFile, file_name_to_add: string) => file_name_equal(file.name, file_name_to_add));
    //
    //     if (file_already_exists) {
    //       let file_to_update = array_get_unique(
    //         this.instructor_files,
    //         file.name,
    //         (file: InstructorFile, file_name_to_add: string) => file_name_equal(file.name, file_name_to_add));
    //       let updated_content = file;
    //       // How do I turn updated_content into type blob??????
    //       file_to_update.set_content(updated_content);
    //     }
    //     else {
    //       try {
    //         let file_content = file;
    //         let file_to_add = await InstructorFile.create(this.project.pk, file.name, file_content);
    //         this.instructor_files.push(file_to_add);
    //       }
    //       catch (error) {
    //         console.log(error);
    //       }
    //     }
    //   }
    //
    //   let instructor_files_upload = <FileUpload> this.$refs.instructor_files_upload;
    //   instructor_files_upload.clear_files();
    //
    //   this.instructor_files.sort((file_a: InstructorFile, file_b: InstructorFile) => {
    //     if (file_a.name <= file_b.name) {
    //       return -1;
    //     }
    //     else {
    //       return 1;
    //     }
    //   });
    // }
    //
    // async view_file(file: InstructorFile) {
    //   let file_content = await file.get_content();
    //   let instructor_files_viewer = <MultiFileViewer> this.$refs.instructor_files_viewer;
    //   instructor_files_viewer.add_to_viewing(file.name, file_content);
    // }
    //
    // async download_file(file: string) {
    //   // create url?
    // }
    //
    // async rename_file(file: InstructorFile, new_file_name: string) {
    //   await file.rename(new_file_name);
    // }
    //
    // delete_file(file: InstructorFile) {
    //   console.log("Clicked on delete");
    //   this.file_to_delete = file;
    //   let delete_instructor_file_modal = <Modal> this.$refs.delete_instructor_file_modal;
    //   delete_instructor_file_modal.open();
    // }
    //
    // async delete_file_permanently(file: InstructorFile) {
    //   try {
    //     await file.delete();
    //     this.instructor_files.splice(this.instructor_files.indexOf(file, 1));
    //     this.file_to_delete = null;
    //   }
    //   catch(error) {
    //     console.log(error);
    //   }
    // }
    //
    // cancel_deletion() {
    //   let delete_instructor_file_modal = <Modal> this.$refs.delete_instructor_file_modal;
    //   delete_instructor_file_modal.close();
    //   this.file_to_delete = null;
    // }
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

.validated-input-wrapper {
  display: inline-block;
  width: 200px;
  padding-bottom: 2px;
}

.update-file-name-button {
  display: inline-block;
  background-color: hsl(220, 30%, 60%);
  border-radius: 2px;
  /*padding: 3px 8px 5px 8px;*/
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
  padding-left: 5px;
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
  width: 350px;
  padding: 10px 32px 10px 10px;
  border-radius: .25rem;
  position: relative;
  box-sizing: border-box;
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
