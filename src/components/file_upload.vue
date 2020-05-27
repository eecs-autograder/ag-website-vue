<template>
  <div class="file-upload-container">
    <input ref="file_input"
           class="file-input"
           type="file"
           @change="add_files_from_button($event)"
           multiple>
    <div class="drag-and-drop"
         :class="{'drag-and-drop-hover': files_dragged_over}"
         @dragenter="d_files_dragged_over_counter += 1"
         @dragleave="d_files_dragged_over_counter -= 1"
         @dragover="on_file_hover($event)"
         @drop="add_dropped_files($event)">
      <div class="drag-and-drop-body">

        <div class="drop-here">Drop files here</div>
        <div class="or">- or -</div>
        <button class="add-files gray-button"
                @click="$refs.file_input.click()">
          <div>Choose files to upload</div>
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
        <tr v-for="(file, index) of d_files.data"
            :class="table_row_styling(file, index)"
            :key="file.name">
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
    <button class="upload-files-button green-button"
            @click="attempt_to_upload()"
            :disabled="disable_upload_button">
      <slot name="upload_button_text">Upload</slot>
    </button>

    <modal v-if="d_show_empty_files_found_in_upload_attempt_modal"
           @close="d_show_empty_files_found_in_upload_attempt_modal = false"
           data-testid="empty_file_found_in_upload_attempt_modal"
           size="large"
           :include_closing_x="false">
      <div class="modal-header">Empty Files detected</div>
      <div class="modal-body">
        <div class="empty-file-list-label">
          The following files are empty:
        </div>
        <ul class="list-of-empty-file-names">
          <li class="list-item" v-for="empty_file of d_empty_filenames.data">
            <i class="fas fa-exclamation-triangle empty-warning-symbol"></i>
            {{empty_file}}
          </li>
        </ul>
      </div>
      <div class="modal-button-footer">
        <button class="upload-despite-empty-files-button orange-button"
                @click="continue_with_upload_despite_empty_files()">
          <slot name="upload_button_text">Upload</slot> Anyway
        </button>
        <button class="cancel-upload-process-button white-button"
                @click="d_show_empty_files_found_in_upload_attempt_modal = false">
          Cancel
        </button>
      </div>
    </modal>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { ArraySet } from '@/array_set';
import Modal from '@/components/modal.vue';

import { assert_not_null } from '../utils';

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

type HasName = {name: string};
function name_less(first: HasName, second: HasName) {
  return first.name < second.name;
}

@Component({
  components: { Modal }
})
export default class FileUpload extends Vue {
  @Prop({default: false, type: Boolean})
  disable_upload_button!: boolean;

  d_files: ArraySet<File, HasName> = new ArraySet<File, HasName>([], {less_func: name_less});
  d_empty_filenames: ArraySet<string> = new ArraySet<string>([]);
  d_show_empty_files_found_in_upload_attempt_modal = false;

  get files_dragged_over() {
    return this.d_files_dragged_over_counter !== 0;
  }

  private d_files_dragged_over_counter = 0;

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
    assert_not_null(event.dataTransfer);
    for (let file of event.dataTransfer.files) {
      this.add_or_update_file(file);
      this.check_for_emptiness(file);
    }
    this.d_files_dragged_over_counter = 0;
  }

  remove_file_from_upload(filename: string, file_index: number) {
    this.d_files.remove({name: filename});
    this.d_empty_filenames.remove(filename, false);
  }

  attempt_to_upload() {
    if (!this.d_empty_filenames.empty()) {
      this.d_show_empty_files_found_in_upload_attempt_modal = true;
    }
    else {
      this.$emit('upload_files', this.d_files.data);
    }
  }

  continue_with_upload_despite_empty_files() {
    this.$emit('upload_files', this.d_files.data);
    this.d_show_empty_files_found_in_upload_attempt_modal = false;
  }

  add_or_update_file(uploaded_file: File) {
    this.d_files.remove(uploaded_file, false);
    this.d_empty_filenames.remove(uploaded_file.name, false);
    this.d_files.insert(uploaded_file);
  }

  check_for_emptiness(file: File) {
    if (file.size === 0) {
      this.d_empty_filenames.insert(file.name);
    }
  }

  on_file_hover(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();
    assert_not_null(event.dataTransfer);
    event.dataTransfer.dropEffect = 'copy';
  }

  clear_files() {
    this.d_files = new ArraySet<File, HasName>([], {less_func: name_less});
    this.d_empty_filenames = new ArraySet<string>([]);
  }
}

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';
@import '@/styles/modal.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.file-input {
  display: none;
}

.drag-and-drop {
  align-items: center;
  border-radius: 5px;
  border: 2px solid $ocean-blue;
  display: flex;
  min-height: 250px;
  max-height: 500px;
  height: 50vh;
  justify-content: center;
  position: relative;
  text-align: center;
  width: 100%;
}

.drag-and-drop-hover {
  background-color: $pebble-light;
}

.drop-here {
  font-size: x-large;
}

.or {
  font-size: medium;
  padding-bottom: .375rem;
}

.add-files {
  border: none;
  font-size: large;
  color: white;
}

.student-files-uploaded-table {
  border-collapse: collapse;
  margin-top: .625rem;
  margin-bottom: .625rem;
  width: 100%;
}

.student-files-uploaded-table td {
  padding: .625rem;
  border-right: 0;
  border-left: 0;
}

.name-of-file, .size-of-file {
  padding-top: 1rem;
}

.name-of-file-label, .size-of-file-label {
  border-bottom: none;
  font-size: 1.125rem;
  text-align: left;
  padding: .625rem;
}

.file-empty-row, .file-not-empty-row-even, .file-not-empty-row-odd {
  border-top: 0;
  border-bottom: 5px solid white;
}

.file-empty-row {
  background-color: $warning-red;
  color: white;
}

.file-not-empty-row-odd {
  background-color: $pebble-light;
}

.file-not-empty-row-even {
  background-color: darken($pebble-medium, 5%);
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

.empty-file-list-label {
  margin-bottom: .25rem;
}

.empty-warning-symbol {
  color: orange;
  padding-right: .25rem;
}

.list-of-empty-file-names .list-item {
  padding-bottom: .25rem;
  list-style-type: none;
  margin-left: 1rem;
  color: black;
}

</style>
