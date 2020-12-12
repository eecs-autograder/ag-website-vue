<template>
  <!--
    This component provides a common abstraction for form segments
    that contain data common to all suites (AG test suite, mutation test suite, etc).

    This component does NOT support v-model. See below for usage.

    USAGE:

    <suite-settings :suite="my_suite"
                    :project="my_project"
                    :docker_images="my_docker_images"
                    @field_change="Object.assign(my_suite, $event)"></suite-settings>
  -->

  <div class="suite-settings">
    <div class="form-field-wrapper">
      <label class="label"> Suite name </label>
      <validated-input ref="suite_name"
                       v-model="d_suite.name"
                       @input="$emit('field_change', d_suite)"
                       :validators="[is_not_empty]">
      </validated-input>

      <div class="checkbox-input-container">
        <label class="checkbox-label">
          <input data-testid="synchronous_or_deferred"
                 type="checkbox"
                 class="checkbox"
                 :checked="!d_suite.deferred"
                 @change="d_suite.deferred = !$event.target.checked;
                          $emit('field_change', d_suite)"/>
          Suite must finish before students can submit again
        </label>
      </div>
    </div>

    <fieldset class="fieldset">
      <legend class="legend"> Grading Environment </legend>

      <div class="form-field-wrapper">
        <label class="label"> Sandbox environment </label>

        <select-object :items="docker_images"
                        id_field="pk"
                        v-model="d_suite.sandbox_docker_image"
                        @change="$emit('field_change', d_suite)"
                        ref="sandbox_docker_image">
          <template v-slot:option-text="{item}">
            {{item.display_name}}
          </template>
        </select-object>
      </div>

      <div class="toggle-container form-field-wrapper">
        <toggle v-model="d_suite.allow_network_access"
                @input="$emit('field_change', d_suite)"
                ref="allow_network_access">
          <div slot="on">
            Allow network access
          </div>
          <div slot="off">
            Block network access
          </div>
        </toggle>
      </div>

      <div class="checkbox-input-container">
        <label class="checkbox-label">
          <input data-testid="read_only_instructor_files"
                 type="checkbox"
                 class="checkbox"
                 v-model="d_suite.read_only_instructor_files"
                 @change="$emit('field_change', d_suite)"/>
          Instructor files are read-only
        </label>
      </div>
    </fieldset>

    <fieldset class="fieldset">
      <legend class="legend"> Instructor Files </legend>
      <div class="typeahead-search-bar">
        <dropdown-typeahead ref="instructor_files_typeahead"
                            placeholder_text="Enter a filename"
                            :choices="instructor_files_available"
                            :filter_fn="instructor_file_filter_fn"
                            @item_selected="add_instructor_file($event)">
          <template slot-scope="{item}">
            <span class="typeahead-row">
              {{item.name}}
            </span>
          </template>
        </dropdown-typeahead>
        <button class="button white-button batch-select-button"
                @click="start_batch_selection_mode(BatchModeEnum.INSTRUCTOR_FILES)">
          Batch Select
        </button>
      </div>

      <div class="instructor-files">
        <div v-for="(file, index) of d_suite.instructor_files_needed"
              :class="['file', {'odd-index': index % 2 !== 0}]">
          <span class="file-name"> {{file.name}} </span>
          <div class="remove-file-icon-container"
               @click="d_suite.instructor_files_needed.splice(index, 1);
                       $emit('field_change', d_suite)">
            <span><i class="fas fa-times remove-file"></i></span>
          </div>
        </div>
      </div>

    </fieldset>

    <fieldset class="fieldset">
      <legend class="legend"> Student Files </legend>
      <div class="typeahead-search-bar">
        <dropdown-typeahead ref="student_files_typeahead"
                            placeholder_text="Enter a filename"
                            :choices="expected_student_files_available"
                            :filter_fn="expected_student_file_filter_fn"
                            @item_selected="add_student_file($event)">
          <template slot-scope="{item}">
            <span class="typeahead-row">
              {{item.pattern}}
            </span>
          </template>
        </dropdown-typeahead>
        <button class="button white-button batch-select-button"
                @click="start_batch_selection_mode(BatchModeEnum.STUDENT_FILES)">
          Batch Select
        </button>
      </div>

      <div class="student-files">
        <div v-for="(file, index) of d_suite.student_files_needed"
             :class="['file', {'odd-index': index % 2 !== 0}]">
          <span class="file-name"> {{file.pattern}} </span>
          <div class="remove-file-icon-container"
               @click="d_suite.student_files_needed.splice(index, 1);
                       $emit('field_change', d_suite)">
            <span><i class="fas fa-times remove-file"></i></span>
          </div>
        </div>
      </div>
    </fieldset>

    <div @click.stop>
      <modal v-if="d_show_batch_select_modal"
             @close="d_show_batch_select_modal = false"
             size="large"
             click_outside_to_close>
        <div class="modal-header">Select Files</div>
        <div>
          <ul class="batch-select-card-grid">
            <li class="batch-select-card" :class="d_batch_needed_files.some((el) => el.pk == file.pk) ?
'selected' : ''" v-for="file of d_batch_available_files" :key="file.pk"
@click="batch_toggle_select(file)">
          {{ file.name || file.pattern }}
              </li>
          </ul>
        </div>

        <div class="button-footer-right modal-button-footer">
          <button class="modal-confirm-button"
                  @click="end_batch_selection_mode"> Confirm </button>
          <button class="modal-cancel-button"
                  @click="d_show_batch_select_modal = false"> Cancel </button>
        </div>
      </modal>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  AGTestSuite,
  ExpectedStudentFile,
  InstructorFile,
  MutationTestSuite,
  Project,
  SandboxDockerImageData,
} from 'ag-client-typescript';

import Modal from '@/components/modal.vue';
import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import SelectObject from '@/components/select_object.vue';
import Toggle from '@/components/toggle.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { is_not_empty } from '@/validators';

class Suite {
  name: string;
  sandbox_docker_image: SandboxDockerImageData;
  allow_network_access: boolean;
  deferred: boolean;
  instructor_files_needed: InstructorFile[];
  read_only_instructor_files: boolean;
  student_files_needed: ExpectedStudentFile[];

  constructor(args: Suite) {
    this.name = args.name;
    this.sandbox_docker_image = args.sandbox_docker_image;
    this.allow_network_access = args.allow_network_access;
    this.deferred = args.deferred;
    this.instructor_files_needed = args.instructor_files_needed;
    this.read_only_instructor_files = args.read_only_instructor_files;
    this.student_files_needed = args.student_files_needed;
  }
}

enum BatchModeEnum {
  INSTRUCTOR_FILES,
  STUDENT_FILES
}

@Component({
  components: {
    Modal,
    DropdownTypeahead,
    SelectObject,
    Toggle,
    Tooltip,
    ValidatedInput,
  }
})
export default class SuiteSettings extends Vue {
  @Prop({required: true})
  suite!: Suite;

  @Prop({required: true, type: Project})
  project!: Project;

  @Prop({required: true})
  docker_images!: SandboxDockerImageData[];

  BatchModeEnum = BatchModeEnum;

  d_suite: Suite | null = null;

  readonly is_not_empty = is_not_empty;

  d_show_batch_select_modal = false;
  d_batch_available_files: File[]  = new Array<File>();
  d_batch_needed_files: File[] = new Array<File>();
  d_batch_mode : BatchModeEnum;

  start_batch_selection_mode(mode: BatchModeEnum) {
    this.d_batch_mode = mode;

    this.d_batch_available_files = (mode == BatchModeEnum.INSTRUCTOR_FILES ? this.project.instructor_files!: this.project.expected_student_files!);
    this.d_batch_needed_files = (mode == BatchModeEnum.INSTRUCTOR_FILES ? this.d_suite!.instructor_files_needed: this.d_suite!.student_files_needed!);

    this.d_show_batch_select_modal = true;
  }

  batch_toggle_select(file: File) {
    if(this.d_batch_needed_files.some((el) => el.pk == file.pk)) {
      this.d_batch_needed_files = this.d_batch_needed_files.filter(el => el.pk !== file.pk);
    } else {
      this.d_batch_needed_files.push(file);
    }
  }

  end_batch_selection_mode() {
    if(this.d_batch_mode === BatchModeEnum.INSTRUCTOR_FILES) {
      this.d_suite!.instructor_files_needed = this.d_batch_needed_files
    } else {
      this.d_suite!.student_files_needed = this.d_batch_needed_files
    }
    this.$emit('field_change', this.d_suite);

    this.d_show_batch_select_modal = false;
  }

  created() {
    this.d_suite = new Suite(this.suite);
  }

  @Watch('suite', {deep: true})
  on_suite_changed(new_value: Suite, old_value: Suite) {
    this.d_suite = new Suite(new_value);
  }

  add_instructor_file(instructor_file: InstructorFile) {
    this.d_suite!.instructor_files_needed.push(instructor_file);
    this.$emit('field_change', this.d_suite);
  }

  add_student_file(student_file: ExpectedStudentFile) {
    this.d_suite!.student_files_needed.push(student_file);
    this.$emit('field_change', this.d_suite);
  }

  instructor_file_filter_fn(file: InstructorFile, filter_text: string) {
    return file.name.indexOf(filter_text) >= 0;
  }

  expected_student_file_filter_fn(file: ExpectedStudentFile, filter_text: string) {
    return file.pattern.indexOf(filter_text) >= 0;
  }

  is_in_batch(file) {
    return this.d_batch_needed_files.has(file);
  }

  get instructor_files_available() {
    return this.project.instructor_files!.filter((instructor_file: InstructorFile) => {
      return this.d_suite!.instructor_files_needed.findIndex(
        (file: InstructorFile) => file.pk === instructor_file.pk) === -1;
    });
  }

  get expected_student_files_available() {
    return this.project.expected_student_files.filter(
      (expected_student_file: ExpectedStudentFile) => {
        return this.d_suite!.student_files_needed.findIndex(
          (file: ExpectedStudentFile) => file.pk === expected_student_file.pk) === -1;
      }
    );
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/modal.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.toggle-container {
  font-size: .875rem;
  margin: 1rem 0;
}

.instructor-files, .student-files {
  margin: .625rem 0;
  border: 1px solid hsl(210, 20%, 90%);
  display: inline-block;
}

.file {
  padding: .25rem .375rem .25rem .625rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.file-name {
  color: lighten(black, 40);
  padding-right: 1.875rem;
}

.remove-file {
  color: hsl(220, 20%, 85%);
}

.remove-file-icon-container {
  display: inline-block;
  padding: 0 .25rem;
}

.remove-file-icon-container:hover {
  cursor: pointer;
  .remove-file {
    color: hsl(220, 20%, 55%);
  }
}

.odd-index {
  background-color: hsl(210, 20%, 96%);
}


.typeahead-search-bar {
  display: flex;

  .dropdown-typeahead-container {
    flex: 1;
  }

  .batch-select-button {
    margin-left: 1em;
  }
}


.batch-select-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 0.5em;
  align-items: stretch;
  list-style-type: none;

  .batch-select-card {
    display: block;
    padding: 1em;
    border-radius: 3px;
    background-color: $gray-blue-1;
    cursor: grabbing;

    &.selected {
      background-color: $ocean-blue;
    }
  }
}


/* ---------------- MODAL ---------------- */

.file-to-delete {
  color: darken($ocean-blue, 5%);
  font-weight: bold;
}

.modal-confirm-button {
  @extend .green-button;
}

.modal-cancel-button {
  @extend .red-button;
}
</style>
