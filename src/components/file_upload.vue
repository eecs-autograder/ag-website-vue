<template>
  <div id="file-upload-container">
    <input ref="file_input"
           id="file-input"
           type="file"
           @change="add_files_from_button($event)"
           multiple>
    <div id="drag-and-drop"
         :class="{'drag-and-drop-hover': d_files_dragged_over}"
         @dragenter="d_files_dragged_over = true"
         @dragleave="d_files_dragged_over = false"
         @dragover="on_file_hover($event)"
         @drop="add_dropped_files($event)">
      <div id="drag-and-drop-body">

        <div id="drop-here">Drop files here</div>
        <div id="or">- or -</div>
        <button id="add-files"
                class="gray-button"
                @click="$refs.file_input.click()">
          <div>Upload from your computer</div>
        </button>

      </div>
    </div>

    <table class="student-files-uploaded-table">
      <thead>
        <tr>
          <th class="name-of-file-label"><slot name="file_list_label">Files to Upload</slot></th>
          <th class="size-of-file-label">Size</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(file, index) of d_files" :class="table_row_styling(file, index)">
          <td class="name-of-file">{{file.name}}</td>
          <td class="size-of-file">{{file.size}} Bytes</td>
          <td>
            <i class="fas fa-times remove-file-button"
               @click="remove_file_from_upload(file.name, index)"
               :class="file.size === 0 ? 'remove-button-icon-empty-file' :
                                         'remove-button-icon-non-empty-file'">
            </i>
          </td>
        </tr>
      </tbody>
    </table>
    <button class="upload-files-button green-button" @click="attempt_to_upload()">
      <slot name="upload_button_text">Upload</slot>
    </button>

    <modal ref="empty_file_found_in_upload_attempt"
           size="large"
           :include_closing_x="false">
      <h2>Empty Files detected</h2>
      <hr>
      <div class="modal-body">
        <p class="empty-file-list-label">
          The following files are empty:
        </p>
        <ul class="list-of-empty-file-names">
          <li v-for="empty_file of d_empty_filenames">
            <i class="fas fa-exclamation-triangle empty-warning-symbol"></i>
            {{empty_file}}
          </li>
        </ul>
      </div>
      <div class="modal-footer">
        <button class="upload-despite-empty-files-button gray-button"
                @click="continue_with_upload_despite_empty_files()">
          Upload Anyway
        </button>
        <button class="cancel-upload-process-button red-button"
                @click="$refs.empty_file_found_in_upload_attempt.close()">
          Cancel
        </button>
      </div>
    </modal>

  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  import Modal from '@/components/modal.vue';
  import { array_add_unique, array_remove_unique } from '@/utils';

  interface HTMLInputEvent extends Event {
    target: HTMLInputElement & EventTarget;
  }

  @Component({
    components: { Modal }
  })
  export default class FileUpload extends Vue {

    d_files: File[] = [];
    d_files_dragged_over = false;
    d_empty_filenames: string[] = [];

    table_row_styling(file_in: File, row_index: number): string {
      if (file_in.size === 0) {
        return "file-empty-row";
      }
      if (row_index % 2 !== 0) {
        return "file-not-empty-row-odd";
      }
      return "file-not-empty-row-even";
    }

    add_files_from_button(event: HTMLInputEvent) {
      console.log("Adding files");
      if (event.target === null) {
        throw new Error("Target is null");
      }
      if (event.target.files === null) {
        throw new Error("Files property of event target is unexpectedly null");
      }
      for (let file of event.target.files) {
        this.add_or_update_file(file);
        this.check_for_emptiness(file);
      }
      event.target.value = '';
    }

    add_dropped_files(event: DragEvent) {
      event.stopPropagation();
      event.preventDefault();
      if (event.target === null) {
        throw new Error("Target is null");
      }
      for (let file of event.dataTransfer.files) {
        this.add_or_update_file(file);
        this.check_for_emptiness(file);
      }
      this.d_files_dragged_over = false;
    }

    remove_file_from_upload(filename: string, file_index: number) {
      this.d_files.splice(file_index, 1);
      array_remove_unique(this.d_empty_filenames, filename);
    }

    attempt_to_upload() {
      console.log("Uploading");
      if (this.d_empty_filenames.length !== 0) {
        let empty_files_modal = <Modal> this.$refs.empty_file_found_in_upload_attempt;
        empty_files_modal.open();
      }
      else {
        this.$emit('upload_files', this.d_files);
      }
    }

    continue_with_upload_despite_empty_files() {
      console.log("Uploading despite empty");
      this.$emit('upload_files', this.d_files);
      let empty_files_modal = <Modal> this.$refs.empty_file_found_in_upload_attempt;
      empty_files_modal.close();
    }

    add_or_update_file(uploaded_file: File) {
      for (let index = 0; index < this.d_files.length; ++index) {
        if (this.d_files[index].name === uploaded_file.name) {
          Vue.set(this.d_files, index, uploaded_file);
          array_remove_unique(this.d_empty_filenames, uploaded_file.name);
          return;
        }
      }
      this.d_files.push(uploaded_file);
    }

    check_for_emptiness(file: File) {
      if (file.size === 0) {
        array_add_unique(this.d_empty_filenames, file.name);
      }
    }

    on_file_hover(event: DragEvent) {
      event.stopPropagation();
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }

    clear_files() {
      this.d_files = [];
      this.d_empty_filenames = [];
    }
  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';

#file-input {
  display: none;
}

#drag-and-drop {
  align-items: center;
  border-radius: 5px;
  border: 2px solid $ocean-blue;
  display: flex;
  height: 250px;
  justify-content: center;
  position: relative;
  text-align: center;
  width: 100%;
}

.drag-and-drop-hover {
  background-color: $pebble-light;
}

#drop-here {
  font-size: x-large;
}

#or {
  font-size: medium;
  padding: 0 0 5px 0;
}

#add-files {
  border: none;
  font-size: large;
  color: white;
}

.student-files-uploaded-table {
  border-collapse: collapse;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 100%;
}

.student-files-uploaded-table td {
  padding: 10px;
  border-right: 0;
  border-left: 0;
}

.name-of-file, .size-of-file {
  padding-top: 15px;
}

.name-of-file-label, .size-of-file-label {
  border-bottom: none;
  font-size: 18px;
  text-align: left;
  padding: 10px;
}

.file-empty-row, .file-not-empty-row-even, .file-not-empty-row-odd {
  border-top: 0;
  border-bottom: 5px solid white;
}

.file-empty-row {
  background-color: $warning-red;
  color: white;
  border-radius: 10px;
}

.file-not-empty-row-odd {
  background-color: $pebble-light;
}

.file-not-empty-row-even {
  background-color: $pebble-medium;
}

table tbody tr td {
  border-top: 0;
}

.remove-button-icon-empty-file, .remove-button-icon-non-empty-file {
  vertical-align: middle;
  cursor: pointer;
}

.remove-button-icon-non-empty-file {
  color: $warning-red;
}

.remove-button-icon-empty-file {
  color: white;
}

.modal-title {
  text-align: left;
}

.upload-despite-empty-files-button {
  margin-right: 15px;
}

.upload-despite-empty-files-button, .cancel-upload-process-button, .upload-files-button {
  padding: 10px 15px;
  border: 0;
}

.list-of-empty-file-names {
  padding: 0;
  margin-bottom: 0;
}

.empty-warning-symbol {
  color: orange;
  padding-right: 10px;
}

.list-of-empty-file-names li {
  padding-bottom: 5px;
  list-style-type: none;
  margin-bottom: 2px;
  margin-left: 17px;
  color: black;
}

.list-of-empty-file-names li:last-child {
  margin-bottom: 15px;
}

.empty-file-list-label {
  margin-bottom: 15px;
}

</style>
