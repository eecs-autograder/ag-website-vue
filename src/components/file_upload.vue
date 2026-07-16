<template>
  <div class="file-upload-container">
    <input
      ref="file_input"
      class="file-input"
      type="file"
      @change="add_files_from_button($event)"
      multiple
    />
    <div
      class="drag-and-drop"
      :class="{ 'drag-and-drop-hover': files_dragged_over }"
      @dragenter="state.files_dragged_over_counter += 1"
      @dragleave="state.files_dragged_over_counter -= 1"
      @dragover="on_file_hover($event)"
      @drop="add_dropped_files($event)"
    >
      <div class="drag-and-drop-body">
        <div class="drop-here">Drop files here</div>
        <div class="or">- or -</div>
        <button
          type="button"
          class="add-files gray-button"
          @click="open_file_picker()"
        >
          <div>Choose files to upload</div>
        </button>
      </div>
    </div>

    <table class="student-files-uploaded-table">
      <thead>
        <tr>
          <th class="name-of-file-label">
            <slot name="file_list_label">Files to Upload</slot>
          </th>
          <th class="size-of-file-label">Size</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(file, index) of state.files.data"
          :class="table_row_styling(file, index)"
          :key="file.name"
        >
          <td class="name-of-file">{{ file.name }}</td>
          <td class="size-of-file">{{ file.size }} Bytes</td>
          <td>
            <button
              type="button"
              class="remove-file-button unstyled-button"
              :aria-label="`Remove file ${file.name}`"
              @click="remove_file_from_upload(file.name, index)"
            >
              <i
                class="fas fa-times"
                aria-hidden="true"
                :class="
                  file.size === 0
                    ? 'remove-button-icon-empty-file'
                    : 'remove-button-icon-non-empty-file'
                "
              ></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div>
      <slot name="before_upload_button"></slot>
    </div>
    <button
      type="button"
      class="upload-files-button green-button"
      @click="attempt_to_upload()"
      :disabled="disable_upload_button"
    >
      <slot name="upload_button_text">Upload</slot>
    </button>

    <modal
      v-if="state.show_empty_files_found_in_upload_attempt_modal"
      @close="state.show_empty_files_found_in_upload_attempt_modal = false"
      data-testid="empty_file_found_in_upload_attempt_modal"
      size="large"
      :include_closing_x="false"
    >
      <div class="modal-header">Empty Files detected</div>
      <div class="modal-body">
        <div class="empty-file-list-label">The following files are empty:</div>
        <ul class="list-of-empty-file-names">
          <li
            class="list-item"
            v-for="empty_file of state.empty_filenames.data"
            :key="empty_file"
          >
            <i
              class="fas fa-exclamation-triangle empty-warning-symbol"
              aria-hidden="true"
            ></i>
            {{ empty_file }}
          </li>
        </ul>
      </div>
      <div class="modal-button-footer">
        <button
          type="button"
          class="upload-despite-empty-files-button orange-button"
          @click="continue_with_upload_despite_empty_files()"
        >
          <slot name="upload_button_text">Upload</slot> Anyway
        </button>
        <button
          type="button"
          class="cancel-upload-process-button white-button"
          @click="state.show_empty_files_found_in_upload_attempt_modal = false"
        >
          Cancel
        </button>
      </div>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";

import { ArraySet } from "@/array_set";
import Modal from "@/components/modal.vue";

import { assert_not_null } from "../utils";

type HasName = { name: string };
function name_less(first: HasName, second: HasName) {
  return first.name < second.name;
}

withDefaults(
  defineProps<{
    disable_upload_button?: boolean;
  }>(),
  {
    disable_upload_button: false,
  },
);

const emit = defineEmits<{
  upload_files: [files: File[]];
}>();

const file_input = ref<HTMLInputElement>();

const state = reactive({
  files: new ArraySet<File, HasName>([], { less_func: name_less }),
  empty_filenames: new ArraySet<string>([]),
  show_empty_files_found_in_upload_attempt_modal: false,
  files_dragged_over_counter: 0,
});

const files_dragged_over = computed(
  () => state.files_dragged_over_counter !== 0,
);

function table_row_styling(file_in: File, row_index: number): string {
  if (file_in.size === 0) {
    return "file-empty-row";
  }
  if (row_index % 2 !== 0) {
    return "file-not-empty-row-odd";
  }
  return "file-not-empty-row-even";
}

function open_file_picker() {
  file_input.value?.click();
}

function add_files_from_button(event: Event) {
  assert_not_null(event.target, "Target is null");
  const target = event.target as HTMLInputElement;
  assert_not_null(
    target.files,
    "Files property of event target is unexpectedly null",
  );
  for (let file of target.files) {
    add_or_update_file(file);
    check_for_emptiness(file);
  }
  target.value = "";
}

function add_dropped_files(event: DragEvent) {
  event.stopPropagation();
  event.preventDefault();
  if (event.target === null) {
    throw new Error("Target is null");
  }
  assert_not_null(event.dataTransfer);
  for (let file of event.dataTransfer.files) {
    add_or_update_file(file);
    check_for_emptiness(file);
  }
  state.files_dragged_over_counter = 0;
}

function remove_file_from_upload(filename: string, file_index: number) {
  state.files.remove({ name: filename });
  state.empty_filenames.remove(filename, false);
}

function attempt_to_upload() {
  if (!state.empty_filenames.empty()) {
    state.show_empty_files_found_in_upload_attempt_modal = true;
  } else {
    emit("upload_files", state.files.data);
  }
}

function continue_with_upload_despite_empty_files() {
  emit("upload_files", state.files.data);
  state.show_empty_files_found_in_upload_attempt_modal = false;
}

function add_or_update_file(uploaded_file: File) {
  state.files.remove(uploaded_file, false);
  state.empty_filenames.remove(uploaded_file.name, false);
  state.files.insert(uploaded_file);
}

function check_for_emptiness(file: File) {
  if (file.size === 0) {
    state.empty_filenames.insert(file.name);
  }
}

function on_file_hover(event: DragEvent) {
  event.stopPropagation();
  event.preventDefault();
  assert_not_null(event.dataTransfer);
  event.dataTransfer.dropEffect = "copy";
}

function clear_files() {
  state.files = new ArraySet<File, HasName>([], { less_func: name_less });
  state.empty_filenames = new ArraySet<string>([]);
}

defineExpose({
  state,
  files_dragged_over,
  clear_files,
  add_files_from_button,
  add_dropped_files,
  check_for_emptiness,
});
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";
@import "@/styles/button_styles.scss";
@import "@/styles/forms.scss";
@import "@/styles/modal.scss";

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
  padding-bottom: 0.375rem;
}

.add-files {
  border: none;
  font-size: large;
  color: white;
}

.student-files-uploaded-table {
  border-collapse: collapse;
  margin-top: 0.625rem;
  margin-bottom: 0.625rem;
  width: 100%;
}

.student-files-uploaded-table td {
  padding: 0.625rem;
  border-right: 0;
  border-left: 0;
}

.name-of-file,
.size-of-file {
  padding-top: 1rem;
}

.name-of-file-label,
.size-of-file-label {
  border-bottom: none;
  font-size: 1.125rem;
  text-align: left;
  padding: 0.625rem;
}

.file-empty-row,
.file-not-empty-row-even,
.file-not-empty-row-odd {
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

.remove-button-icon-empty-file,
.remove-button-icon-non-empty-file {
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
  margin-bottom: 0.25rem;
}

.empty-warning-symbol {
  color: orange;
  padding-right: 0.25rem;
}

.list-of-empty-file-names .list-item {
  padding-bottom: 0.25rem;
  list-style-type: none;
  margin-left: 1rem;
  color: black;
}
</style>
