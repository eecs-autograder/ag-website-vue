<template>
  <div id="file-upload-container">
    <input ref="file_input"
           id="submit"
           type="file"
           @change="add_files_from_button($event)"
           multiple>
    <div id="drag-and-drop"
      @dragenter="files_dragged_over = true"
      @dragleave="files_dragged_over = false"
      @dragover="on_file_hover($event)"
      @drop="add_dropped_files($event)">
      <div id="drag-and-drop-body">
        
        <div id="drop-here">Drop files here</div>
        <div style="font-size: medium">- or -</div>
        <button id="add-files" class="gray-button">
          <div>Upload from your computer</div>
        </button>
        
      </div>
    </div>

    <table class="table student-files-uploaded-table">
      <thead>
        <tr>
          <th class="name-of-file-label">{{file_list_label}}</th>
          <th class="size-of-file-label">Size</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(file, index) of files">
          <td class="name-of-file">{{file.name}}</td>
          <td class="size-of-file">{{file.size}} Bytes</td>
          <td class="remove-file-button">
            <button></button>
          </td>
        </tr>
      </tbody>
    </table>
    <button class="">{{submit_button_text}}</button>
  </div>
</template>

<script lang="ts">

  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component
  export default class FileUpload extends Vue {

    @Prop({default: "Submit", type: String})
    submit_button_text!: string;

    @Prop({default: "Files to Submit", type: String})
    file_list_label!: string;

    d_submit_button_text = "";
    d_file_list_label = "";

    created() {
      this.d_submit_button_text = this.submit_button_text;
      this.d_file_list_label = this.file_list_label;
    }

    // @Output()
    // submit_click: EventEmitter<any> = new EventEmitter();

    // @ViewChild('empty_file_found_in_submission_attempt')
    // public empty_file_found_in_submission_attempt: ModalDirective;

    files: File[] = [];

    files_dragged_over = false;

    empty_files = new Set();

    table_row_styling(file_in: File, row_index: number): string {
      if (file_in.size === 0) {
        return "file-empty-row";
      }
      if (row_index % 2 !== 0) {
        return "file-not-empty-row-odd";
      }
      return "file-not-empty-row-even";
    }

    add_files_from_button(event: Event) {
      // for (let file of event.target.files) {
      //   this.check_for_emptiness(file);
      //   this.files.push(file);
      // }
      // event.target.value = '';
    }

    add_dropped_files(event: Event) {
      // event.stopPropagation();
      // event.preventDefault();
      // for (let file of event.dataTransfer.files) {
      //   this.check_for_emptiness(file);
      //   this.files.push(file);
      // }
      // this.files_dragged_over = false;
      // event.target.value = '';
    }

    remove_file_from_submission(filename: string, file_index: number) {
      // console.log(`removing file: ${filename}`);
      // this.files.splice(file_index, 1);
      // if (this.empty_files.has(filename)) {
      //   this.empty_files.delete(filename);
      // }
    }

    attempt_to_submit() {
      // if (this.empty_files.size !== 0) {
      //   this.empty_file_found_in_submission_attempt.show();
      // }
      // else {
      //   this.submit_click.emit(this.files);
      // }
    }

    continue_with_submission_despite_empty_files() {
      // this.submit_click.emit(this.files);
    }

    check_for_emptiness(file: File) {
      // if (file.size === 0 && !this.empty_files.has(file.name)) {
      //   this.empty_files.add(file.name);
      // }
    }

    on_file_hover(event: Event) {
      // event.stopPropagation();
      // event.preventDefault();
      // event.dataTransfer.dropEffect = 'copy';
    }

    clear_files() {
      this.files = [];
      this.empty_files.clear();
    }
  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';

#add-files {
  border: none;
  font-size: large;
}

#file-upload-container {
  font-family: Helvetica;
}

#drag-and-drop {
  align-items: center;
  border-radius: 5px;
  border: 2px solid $ocean-blue;
  display: flex;
  height: 200px;
  justify-content: center;
  position: relative;
  text-align: center;
  width: 100%;
}

/*#drag-and-drop:hover {*/
  /*background-color: hotpink;*/
/*}*/

#drop-here {
  font-size: x-large;
}

#submit {
  /*display: none;*/
}

.hover {
  background-color: lightgray;
}

.student-files-uploaded-table {
  margin-top: 10px;
  margin-bottom: 10px;
}

.name-of-file, .size-of-file {
  padding-top: 15px;
}

.name-of-file-label, .size-of-file-label {
  border-bottom: none;
  font-size: 18px;
}

.remove-button-icon-non-empty-file {
  color: $warning-red;
}

.remove-button-icon-empty-file {
  color: white;
}

.submit-files-button {
  background-color: $save-green;
  color: white;
}

.file-empty-row {
  background-color: $warning-red;
  color: white;
}

.file-not-empty-row-odd {
  background-color: $pebble-medium;
}

.file-not-empty-row-even {
  background-color: $pebble-light;
}

.file-empty-row, .file-not-empty-row-even, .file-not-empty-row-odd {
  border-top: 0px;
  border-bottom: 5px solid white;
}

table tbody tr td {
  border-top: 0px;
}

.modal-title {
  text-align: left;
}

.submit-despite-empty-files-button {
  background-color: $baking-pan;
  margin-right: 15px;
}

.cancel-submission-process-button {
  background-color: $warning-red;
}

.submit-despite-empty-files-button, .cancel-submission-process-button {
  color: white;
  border-radius: 4px;
  padding: 10px 15px;
  border: 0px;
}

.list-of-empty-file-names {
  padding: 0px;
  margin-bottom: 0px;
}

.list-of-empty-file-names li:before {
  font-family: 'FontAwesome';
  font-size: 13px;
  margin-right: 8px;
  content: '\f071';
  color: orange;
}

.list-of-empty-file-names li {
  padding-bottom: 5px;
  list-style-type: none;
  margin-bottom: 2px;
  margin-left: 17px;
  color: black;
}

.empty-file-list-label {
  margin-bottom: 15px;
}

</style>
