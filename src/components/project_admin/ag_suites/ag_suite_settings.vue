<template>
  <div id="ag-test-suite-settings-component" v-if="d_test_suite !== null">
    <div v-if="!loading">
      <tabs ref="tabs-gray"
            v-model="current_tab_index"
            tab_active_class="white-theme-active"
            tab_inactive_class="white-theme-inactive">

        <!------------------------ Suite Settings Tab ------------------------------------->
        <tab>
          <tab-header>
            <div class="tab-heading"> Settings </div>
          </tab-header>
          <template slot="body">
            <div class="tab-body">
              <validated-form id="suite-settings-form"
                              autocomplete="off"
                              spellcheck="false"
                              @submit.native.prevent="save_ag_test_suite_settings"
                              @form_validity_changed="settings_form_is_valid = $event">

                <div id="name-container">
                  <label class="text-label"> Suite name </label>
                  <validated-input ref="suite_name"
                                   id="input-name"
                                   v-model="d_test_suite.name"
                                   :validators="[is_not_empty]">
                  </validated-input>
                </div>

                <div class="section-container">
                  <fieldset class="fieldset">
                    <legend class="legend"> Grading Related </legend>
                    <div class="sandbox-container">
                      <label class="text-label"> Sandbox environment: </label>

                      <div class="dropdown">
                        <select id="sandbox_environment"
                                v-model="d_test_suite.sandbox_docker_image"
                                class="select">
                          <option v-for="docker_image of docker_images"
                                  :value="docker_image">
                            {{docker_image.display_name}}
                          </option>
                        </select>
                      </div>

                    </div>

                    <div class="toggle-container">
                      <toggle v-model="d_test_suite.deferred">
                        <div slot="on">
                          Deferred
                        </div>
                        <div slot="off">
                          Synchronous
                        </div>
                      </toggle>
                      <i class="fas fa-question-circle input-tooltip">
                        <tooltip width="medium" placement="right">
                          Students can re-submit once all synchronous test suites are finished.
                          Deferred test suites are graded whenever resources are available,
                          but they do not block students from re-submitting.
                        </tooltip>
                      </i>
                    </div>

                    <div class="toggle-container">
                      <toggle v-model="d_test_suite.allow_network_access">
                        <div slot="on">
                          Allow network access
                        </div>
                        <div slot="off">
                          Block network access
                        </div>
                      </toggle>
                    </div>

                  </fieldset>
                </div>

                <div class="section-container">
                  <fieldset class="fieldset">
                    <legend class="legend"> Project Files </legend>
                    <div class="typeahead-search-bar">
                      <dropdown-typeahead ref="project_files_typeahead"
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

                    <div class="instructor-files">
                      <div v-for="(file, index) of d_test_suite.instructor_files_needed"
                           :class="['file', {'odd-index': index % 2 !== 0}]">
                        <span class="file-name"> {{file.name}} </span>
                        <div class="delete-file-icon-container"
                             @click="delete_instructor_file(file)">
                          <span><i class="fas fa-times delete-file"></i></span>
                        </div>
                      </div>
                    </div>

                  </fieldset>
                </div>

                <div class="section-container">
                  <fieldset class="fieldset">
                    <legend class="legend"> Student Files </legend>
                    <div class="typeahead-search-bar">
                      <dropdown-typeahead ref="student_files_typeahead"
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

                    <div class="student-files">
                      <div v-for="(file, index) of d_test_suite.student_files_needed"
                           :class="['file', {'odd-index': index % 2 !== 0}]">
                        <span class="file-name"> {{file.pattern}} </span>
                        <div class="delete-file-icon-container"
                             @click="delete_student_file(file)">
                          <span><i class="fas fa-times delete-file"></i></span>
                        </div>
                      </div>
                    </div>

                  </fieldset>
                </div>

                <div class="section-container">
                  <fieldset class="fieldset">
                    <legend class="legend"> Setup </legend>

                    <div id="setup-command-label-container">
                      <label class="text-label"> Setup command label </label>
                      <validated-input ref="suite_name"
                                       id="setup-command-label"
                                       v-model="d_test_suite.setup_suite_cmd_name"
                                       :validators="[]">
                      </validated-input>
                    </div>

                    <div id="setup-command-container">
                      <label class="text-label"> Setup command </label>
                      <validated-input ref="suite_name"
                                       id="setup-command"
                                       v-model="d_test_suite.setup_suite_cmd"
                                       :validators="[]">
                      </validated-input>
                    </div>

                  </fieldset>
                </div>

                <div class="bottom-of-form">
                  <APIErrors ref="api_errors"></APIErrors>

                  <button type="submit"
                          class="save-button"
                          :disabled="!settings_form_is_valid || saving"> Save Updates
                  </button>

                  <div v-show="!saving" class="last-saved-timestamp">
                    <span> Last Saved: </span>
                    {{(new Date(d_test_suite.last_modified)).toLocaleString(
                    'en-US', last_modified_format
                    )}}
                  </div>

                  <div v-show="saving" class="last-saved-spinner">
                    <i class="fa fa-spinner fa-pulse"></i>
                  </div>
                </div>

              </validated-form>
            </div>
          </template>
        </tab>

        <!------------------------ Command Feedback Tab ------------------------------------->
        <tab>
          <tab-header>
            <div class="tab-heading">
              Feedback
            </div>
          </tab-header>
          <template slot="body">
            <div class="tab-body">

            </div>
          </template>
        </tab>
        <!--------------------------- Danger Zone Tab --------------------------------------->
        <tab>
          <tab-header>
            <div class="tab-heading">
              Danger Zone
            </div>
          </tab-header>
          <template slot="body">
            <div class="tab-body">

              <button class="delete-suite-button"
                      type="button"
                      @click="$refs.delete_suite_modal.open()">
                Delete Suite: <span>{{d_test_suite.name}}</span>
              </button>

              <modal ref="delete_suite_modal"
                     :size="'large'"
                     :include_closing_x="false">
                <div class="modal-header">
                  Confirm Delete
                </div>
                <hr>
                <div class="modal-body">
                  <p> Are you sure you want to delete the suite
                    <span class="item-to-delete">{{d_test_suite.name}}</span>?
                    This will delete all associated test cases and run results.
                    THIS ACTION CANNOT BE UNDONE. </p>
                  <div class="deletion-modal-button-footer">
                    <button class="modal-delete-button"
                            :disabled="saving"
                            @click="delete_ag_test_suite()"> Delete </button>

                    <button class="modal-cancel-button"
                            @click="$refs.delete_suite_modal.close()"> Cancel </button>
                  </div>
                </div>
              </modal>
            </div>
          </template>
        </tab>

      </tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  AGTestSuite,
  ExpectedStudentFile,
  get_sandbox_docker_images,
  InstructorFile,
  Project,
  SandboxDockerImageData
} from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import Modal from '@/components/modal.vue';
import Tab from '@/components/tabs/tab.vue';
import TabHeader from '@/components/tabs/tab_header.vue';
import Tabs from '@/components/tabs/tabs.vue';
import Toggle from '@/components/toggle.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { deep_copy, handle_api_errors_async } from '@/utils';
import { is_not_empty } from '@/validators';

@Component({
  components: {
    APIErrors,
    DropdownTypeahead,
    Modal,
    Tab,
    TabHeader,
    Tabs,
    Toggle,
    Tooltip,
    ValidatedForm,
    ValidatedInput
  }
})
export default class AGSuiteSettings extends Vue {

  @Prop({required: true, type: AGTestSuite})
  test_suite!: AGTestSuite;

  @Prop({required: true, type: Project})
  project!: Project;

  @Watch('test_suite', {deep: true})
  on_test_suite_change(new_test_suite: AGTestSuite, old_test_suite: AGTestSuite) {
    this.d_test_suite = deep_copy(new_test_suite, AGTestSuite);
    if (this.current_tab_index === 2) {
      this.current_tab_index = 0;
    }
  }

  current_tab_index = 0;
  d_test_suite: AGTestSuite | null = null;
  docker_images: SandboxDockerImageData[] = [];
  last_modified_format = {year: 'numeric', month: 'long', day: 'numeric',
                          hour: 'numeric', minute: 'numeric', second: 'numeric'};
  loading = true;
  saving = false;
  settings_form_is_valid = true;

  readonly is_not_empty = is_not_empty;

  async created() {
    this.d_test_suite = deep_copy(this.test_suite, AGTestSuite);
    this.docker_images = await get_sandbox_docker_images();
    this.sort_instructor_files();
    this.sort_student_files();
    this.loading = false;
  }

  get instructor_files_available() {
    return this.project.instructor_files!.filter((instructor_file: InstructorFile) => {
      return this.d_test_suite!.instructor_files_needed.findIndex(
        (file: InstructorFile) => file.pk === instructor_file.pk) === -1;
    });
  }

  get expected_student_files_available() {
    return this.project.expected_student_files.filter(
      (expected_student_file: ExpectedStudentFile) => {
        return this.d_test_suite!.student_files_needed.findIndex(
          (file: ExpectedStudentFile) => file.pk === expected_student_file.pk) === -1;
      }
    );
  }

  sort_instructor_files() {
    this.d_test_suite!.instructor_files_needed.sort(
      (file_a: InstructorFile, file_b: InstructorFile) => {
        return file_a.name.localeCompare(file_b.name, undefined, {numeric: true});
      }
    );
  }

  sort_student_files() {
    this.d_test_suite!.student_files_needed.sort(
      (file_a: ExpectedStudentFile, file_b: ExpectedStudentFile) => {
        return file_a.pattern.localeCompare(file_b.pattern, undefined, {numeric: true});
      }
    );
  }

  add_instructor_file(instructor_file: InstructorFile) {
    this.d_test_suite!.instructor_files_needed.push(instructor_file);
    this.sort_instructor_files();
  }

  add_student_file(student_file: ExpectedStudentFile) {
    this.d_test_suite!.student_files_needed.push(student_file);
    this.sort_student_files();
  }

  delete_instructor_file(instructor_file: InstructorFile) {
    let index = this.d_test_suite!.instructor_files_needed.findIndex(
      (file: InstructorFile) => file.pk === instructor_file.pk
    );
    this.d_test_suite!.instructor_files_needed.splice(index, 1);
  }

  delete_student_file(student_file: ExpectedStudentFile) {
    let index = this.d_test_suite!.student_files_needed.findIndex(
      (file: ExpectedStudentFile) => file.pk === student_file.pk
    );
    this.d_test_suite!.student_files_needed.splice(index, 1);
  }

  async delete_ag_test_suite() {
    await this.d_test_suite!.delete();
  }

  instructor_file_filter_fn(file: InstructorFile, filter_text: string) {
    return file.name.indexOf(filter_text) >= 0;
  }

  expected_student_file_filter_fn(file: ExpectedStudentFile, filter_text: string) {
    return file.pattern.indexOf(filter_text) >= 0;
  }

  @handle_api_errors_async(handle_save_ag_suite_settings_error)
  async save_ag_test_suite_settings() {
    try {
      this.saving = true;
      (<APIErrors> this.$refs.api_errors).clear();
      await this.d_test_suite!.save();
    }
    finally {
      this.saving = false;
    }
  }
}

function handle_save_ag_suite_settings_error(component: AGSuiteSettings, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/components/ag_tests.scss';
@import '@/styles/forms.scss';
$current-lang-choice: "Poppins";

.tab-body {
  box-sizing: border-box;
  padding: 15px;
  height: 700px;
  overflow-y: scroll;
  border-left: 2px solid darken($pebble-light, 1);
}

.network-label {
  padding-right: 15px;
}

#ag-test-suite-settings-component {
  font-family: $current-lang-choice;
  height: 100%;
}

#setup-command-container {
  margin: 15px 0 10px 0;
}

.toggle-container {
  font-size: 14px;
  margin: 12px 5px 3px 3px;
  padding-bottom: 10px;
  min-width: 500px;
}

.instructor-files, .student-files {
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

.delete-suite-button {
  @extend .delete-level-button;
}

.delete-suite-button span {
  margin-left: 5px;
}

.sandbox-container {
  padding: 10px 0 10px 3px;
}

#name-container {
  padding: 0 12px 22px 12px;
}

</style>
