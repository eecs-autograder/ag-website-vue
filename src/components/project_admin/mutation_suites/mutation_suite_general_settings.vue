<template>
  <div v-if="d_mutation_test_suite !== null"
       id="mutation-suite-general-settings-component">

    <div id="mutation-test-suite-name-container">
      <label class="text-label"> Suite name </label>
      <validated-input ref="suite_name"
                       id="input-name"
                       v-model="d_mutation_test_suite.name"
                       @input="$emit('input', d_mutation_test_suite)"
                       :validators="[is_not_empty]">
      </validated-input>
    </div>

    <div class="checkbox-input-container synchronous-or-deferred-container">
      <input id="synchronous-or-deferred"
             type="checkbox"
             class="checkbox"
             :checked="!d_mutation_test_suite.deferred"
             @change="d_mutation_test_suite.deferred = !$event.target.checked;
                        $emit('input', d_mutation_test_suite)"/>
      <label class="checkbox-label"
             for="synchronous-or-deferred">
        Suite must finish before students can submit again
      </label>
    </div>

    <div class="sandbox-container">
      <label class="text-label"> Sandbox environment </label>
      <div class="dropdown">
        <dropdown id="sandbox-docker-image"
                  :items="d_docker_images"
                  dropdown_height="250px"
                  @update_item_selected="d_mutation_test_suite.sandbox_docker_image = $event;
                                           $emit('input', d_mutation_test_suite)">
          <template slot="header">
            <div tabindex="1" class="dropdown-header-wrapper">
              <div class="dropdown-header sandbox-docker-image-dropdown">
                {{d_mutation_test_suite.sandbox_docker_image === null ? ' '
                : d_mutation_test_suite.sandbox_docker_image.display_name}}
                <i class="fas fa-caret-down dropdown-caret"></i>
              </div>
            </div>
          </template>
          <div slot-scope="{item}">
              <span>
                {{item.display_name}}
              </span>
          </div>
        </dropdown>
      </div>
    </div>

    <div class="toggle-container">
      <toggle v-model="d_mutation_test_suite.allow_network_access"
              @input="$emit('input', d_mutation_test_suite)"
              ref="allow_network_access"
              id="allow-network-access">
        <div slot="on">
          Allow network access
        </div>
        <div slot="off">
          Block network access
        </div>
      </toggle>
    </div>

    <div class="files-container">
      <label class="text-label"> Instructor Files </label>
      <div class="typeahead-search-bar">
        <dropdown-typeahead ref="instructor_files_typeahead"
                            id="instructor-files-typeahead"
                            placeholder_text="Enter a filename"
                            :choices="instructor_files_available"
                            :filter_fn="instructor_file_filter_fn"
                            @update_item_chosen="add_instructor_file($event)">
          <template slot-scope="{item}">
                  <span class="typeahead-row">
                    {{item.name}}
                  </span>
          </template>
        </dropdown-typeahead>
      </div>

      <div id="instructor-files"
           v-if="d_mutation_test_suite.instructor_files_needed.length !== 0">
        <div v-for="(file, index) of d_mutation_test_suite.instructor_files_needed"
             :class="['file', {'odd-index': index % 2 !== 0}]">
          <span class="file-name"> {{file.name}} </span>
          <div class="delete-file-icon-container"
               @click="delete_instructor_file(file)">
            <span><i class="fas fa-times delete-file"></i></span>
          </div>
        </div>
      </div>
    </div>

    <div class="files-container">
      <label class="text-label"> Student Files </label>
      <div class="typeahead-search-bar">
        <dropdown-typeahead ref="student_files_typeahead"
                            id="student-files-typeahead"
                            placeholder_text="Enter a filename"
                            :choices="expected_student_files_available"
                            :filter_fn="expected_student_file_filter_fn"
                            @update_item_chosen="add_student_file($event)">
          <template slot-scope="{item}">
            <span class="typeahead-row">
              {{item.pattern}}
            </span>
          </template>
        </dropdown-typeahead>
      </div>

      <div id="student-files"
           v-if="d_mutation_test_suite.student_files_needed.length !== 0">
        <div v-for="(file, index) of d_mutation_test_suite.student_files_needed"
             :class="['file', {'odd-index': index % 2 !== 0}]">
          <span class="file-name"> {{file.pattern}} </span>
          <div class="delete-file-icon-container"
               @click="delete_student_file(file)">
            <span><i class="fas fa-times delete-file"></i></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
    ExpectedStudentFile,
    get_sandbox_docker_images,
    InstructorFile,
    MutationTestSuite,
    Project,
    SandboxDockerImageData
} from 'ag-client-typescript';

import Dropdown from '@/components/dropdown.vue';
import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import Toggle from '@/components/toggle.vue';
import ValidatedInput, { ValidatorResponse } from "@/components/validated_input.vue";
import { deep_copy, format_datetime } from '@/utils';
import { is_not_empty } from '@/validators';

@Component({
  components: {
    Dropdown,
    DropdownTypeahead,
    Toggle,
    ValidatedInput
  }
})
export default class MutationSuiteGeneralSettings extends Vue {

  @Prop({required: true, type: MutationTestSuite})
  value!: MutationTestSuite;

  @Prop({required: true, type: Project})
  project!: Project;

  readonly is_not_empty = is_not_empty;
  readonly format_datetime = format_datetime;

  d_docker_images: SandboxDockerImageData[] = [];
  d_loading = true;
  d_mutation_test_suite: MutationTestSuite | null = null;

  @Watch('value')
  on_value_changed(new_test_suite: MutationTestSuite, old_test_suite: MutationTestSuite) {
    this.d_mutation_test_suite = deep_copy(new_test_suite, MutationTestSuite);
  }

  async created() {
    this.d_mutation_test_suite = deep_copy(this.value, MutationTestSuite);
    this.d_docker_images = await get_sandbox_docker_images();
    this.d_loading = false;
  }

  get instructor_files_available() {
    return this.project.instructor_files!.filter((instructor_file: InstructorFile) => {
      return this.d_mutation_test_suite!.instructor_files_needed.findIndex(
        (file: InstructorFile) => file.pk === instructor_file.pk) === -1;
    });
  }

  get expected_student_files_available() {
    return this.project.expected_student_files.filter(
      (expected_student_file: ExpectedStudentFile) => {
        return this.d_mutation_test_suite!.student_files_needed.findIndex(
          (file: ExpectedStudentFile) => file.pk === expected_student_file.pk) === -1;
      }
    );
  }

  add_instructor_file(instructor_file: InstructorFile) {
    this.d_mutation_test_suite!.instructor_files_needed.push(instructor_file);
    this.$emit('input', this.d_mutation_test_suite);
  }

  add_student_file(student_file: ExpectedStudentFile) {
    this.d_mutation_test_suite!.student_files_needed.push(student_file);
    this.$emit('input', this.d_mutation_test_suite);
  }

  delete_instructor_file(instructor_file: InstructorFile) {
    let index = this.d_mutation_test_suite!.instructor_files_needed.findIndex(
      (file: InstructorFile) => file.pk === instructor_file.pk
    );
    this.d_mutation_test_suite!.instructor_files_needed.splice(index, 1);
    this.$emit('input', this.d_mutation_test_suite);
  }

  delete_student_file(student_file: ExpectedStudentFile) {
    let index = this.d_mutation_test_suite!.student_files_needed.findIndex(
      (file: ExpectedStudentFile) => file.pk === student_file.pk
    );
    this.d_mutation_test_suite!.student_files_needed.splice(index, 1);
    this.$emit('input', this.d_mutation_test_suite);
  }

  instructor_file_filter_fn(file: InstructorFile, filter_text: string) {
    return file.name.indexOf(filter_text) >= 0;
  }

  expected_student_file_filter_fn(file: ExpectedStudentFile, filter_text: string) {
    return file.pattern.indexOf(filter_text) >= 0;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';

#mutation-suite-general-settings-component {
  padding: 6px 12px 14px 2px;
}

#mutation-test-suite-name-container {
  width: 50%;
}

.synchronous-or-deferred-container {
  padding: 17px 12px 6px 0;
}

.files-container {
  padding: 5px 0 10px 0;
}

.toggle-container {
  font-size: 14px;
  margin: 12px 5px 3px 0;
  padding-bottom: 10px;
  min-width: 500px;
}

.sandbox-container {
  padding: 10px 0 10px 0;
}

.sandbox-docker-image-dropdown {
  min-width: 400px;
  width: 100%;
}

.typeahead-search-bar {
  width: 50%;
}

#instructor-files, #student-files {
  margin: 10px 0;
  border: 1px solid hsl(210, 20%, 90%);
  display: inline-block;
}

.file {
  padding: 5px 6px 5px 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.file-name {
  color: lighten(black, 40);
  padding-right: 30px;
}

.delete-file {
  color: hsl(220, 20%, 85%);
}

.delete-file-icon-container {
  display: inline-block;
  padding: 0 4px;
}

.delete-file-icon-container:hover {
  cursor: pointer;
  .delete-file {
    color: hsl(220, 20%, 55%);
  }
}

.odd-index {
  background-color: hsl(210, 20%, 96%);
}
</style>
