
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
        <batch-select v-model="d_suite.instructor_files_needed"
                      :choices="project.instructor_files"
                      :are_items_equal="are_files_equal"
                      :filter_fn="instructor_file_filter_fn"
                      @input="$emit('field_change', d_suite)"
                      v-slot="{ item }">
          {{ item.name }}
        </batch-select>
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
        <batch-select v-model="d_suite.student_files_needed"
                      :choices="project.expected_student_files"
                      :are_items_equal="are_files_equal"
                      :filter_fn="expected_student_file_filter_fn"
                      @input="$emit('field_change', d_suite)"
                      v-slot="{ item }">
          {{ item.pattern }}
        </batch-select>
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

import BatchSelect from '@/components/batch_select.vue';
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

@Component({
  components: {
    DropdownTypeahead,
    BatchSelect,
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

  d_suite: Suite | null = null;

  readonly is_not_empty = is_not_empty;

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

  are_files_equal(
    rhs: InstructorFile | ExpectedStudentFile,
    lhs: InstructorFile | ExpectedStudentFile
  ) {
    return lhs.pk === rhs.pk;
  }

  instructor_file_filter_fn(file: InstructorFile, filter_text: string) {
    return file.name.toLowerCase().indexOf(filter_text.toLowerCase()) >= 0;
  }

  expected_student_file_filter_fn(
    file: ExpectedStudentFile,
    filter_text: string
  ) {
    return file.pattern.toLowerCase().indexOf(filter_text.toLowerCase()) >= 0;
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

* {
  box-sizing: border-box;
  padding: 0;
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
}

</style>
