<template>
  <div id="ag-test-suite-settings-component" v-if="d_ag_test_suite !== null">
    <div v-if="!d_loading">
      <tabs ref="tabs-gray"
            v-model="d_current_tab_index"
            tab_active_class="white-theme-active"
            tab_inactive_class="white-theme-inactive">

        <!------------------------ Suite Settings Tab ------------------------------------->
        <tab>
          <tab-header>
            <div class="tab-heading"> Settings </div>
          </tab-header>
          <template slot="body">
            <div class="tab-body">

              <validated-form id="ag-test-suite-settings-form"
                              autocomplete="off"
                              spellcheck="false"
                              @submit="save_ag_test_suite_settings"
                              @form_validity_changed="d_settings_form_is_valid = $event">

                <div id="ag-test-suite-name-container">
                  <label class="text-label"> Suite name </label>
                  <validated-input ref="suite_name"
                                   id="input-name"
                                   v-model="d_ag_test_suite.name"
                                   :validators="[is_not_empty]">
                  </validated-input>
                </div>

                <div class="checkbox-container">
                  <input id="synchronous-or-deferred"
                         type="checkbox"
                         class="checkbox"
                         :checked="!d_ag_test_suite.deferred"
                         @change="d_ag_test_suite.deferred = !$event.target.checked"/>
                  <label class="checkbox-label"
                         for="synchronous-or-deferred">
                    Suite must finish before students can submit again
                  </label>
                </div>

                <div class="section-container">
                  <fieldset class="fieldset">
                    <legend class="legend"> Grading Environment </legend>
                    <div class="sandbox-container">
                      <label class="text-label"> Sandbox environment </label>
                      <div class="dropdown">
                        <dropdown id="sandbox-docker-image"
                                  :items="d_docker_images"
                                  dropdown_height="250px"
                                  @update_item_selected="
                                    d_ag_test_suite.sandbox_docker_image = $event">
                          <template slot="header">
                            <div tabindex="1" class="dropdown-header-wrapper">
                              <div class="dropdown-header sandbox-docker-image-dropdown">
                                {{d_ag_test_suite.sandbox_docker_image === null ? ' '
                                : d_ag_test_suite.sandbox_docker_image.display_name}}
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
                      <toggle v-model="d_ag_test_suite.allow_network_access"
                              ref="allow_network_access">
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
                    <legend class="legend"> Instructor Files </legend>
                    <div class="typeahead-search-bar">
                      <dropdown-typeahead ref="instructor_files_typeahead"
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
                      <div v-for="(file, index) of d_ag_test_suite.instructor_files_needed"
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
                      <div v-for="(file, index) of d_ag_test_suite.student_files_needed"
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
                                       v-model="d_ag_test_suite.setup_suite_cmd_name"
                                       :validators="[]">
                      </validated-input>
                    </div>

                    <div id="setup-command-container">
                      <label class="text-label"> Setup command </label>
                      <validated-input ref="suite_name"
                                       id="setup-command"
                                       v-model="d_ag_test_suite.setup_suite_cmd"
                                       :validators="[]">
                      </validated-input>
                    </div>

                  </fieldset>
                </div>

                <div class="bottom-of-form">
                  <APIErrors ref="api_errors"></APIErrors>

                  <button type="submit"
                          class="save-button"
                          :disabled="!d_settings_form_is_valid || d_saving">Save</button>

                  <div v-show="!d_saving" class="last-saved-timestamp">
                    <span> Last Saved: </span> {{format_datetime(d_ag_test_suite.last_modified)}}
                  </div>

                  <div v-show="d_saving" class="last-saved-spinner">
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

              <button class="delete-ag-test-suite-button"
                      type="button"
                      @click="$refs.delete_ag_test_suite_modal.open()">
                Delete Test Suite: <span>{{d_ag_test_suite.name}}</span>
              </button>

              <modal ref="delete_ag_test_suite_modal"
                     :size="'large'"
                     :include_closing_x="false">
                <div class="modal-header">
                  Confirm Delete
                </div>
                <hr>
                <div class="modal-body">
                  <p> Are you sure you want to delete the suite
                    <span class="item-to-delete">{{d_ag_test_suite.name}}</span>?
                    This will delete all associated test cases and run results.
                    THIS ACTION CANNOT BE UNDONE. </p>
                  <div class="deletion-modal-button-footer">
                    <button class="modal-delete-button"
                            :disabled="d_saving"
                            @click="delete_ag_test_suite()"> Delete </button>

                    <button class="modal-cancel-button"
                            @click="$refs.delete_ag_test_suite_modal.close()"> Cancel </button>
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
import Dropdown from '@/components/dropdown.vue';
import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import Modal from '@/components/modal.vue';
import Tab from '@/components/tabs/tab.vue';
import TabHeader from '@/components/tabs/tab_header.vue';
import Tabs from '@/components/tabs/tabs.vue';
import Toggle from '@/components/toggle.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { deep_copy, format_datetime, handle_api_errors_async } from '@/utils';
import { is_not_empty } from '@/validators';

@Component({
  components: {
    APIErrors,
    Dropdown,
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
  ag_test_suite!: AGTestSuite;

  @Prop({required: true, type: Project})
  project!: Project;

  @Watch('ag_test_suite')
  on_test_suite_change(new_test_suite: AGTestSuite, old_test_suite: AGTestSuite) {
    this.d_ag_test_suite = deep_copy(new_test_suite, AGTestSuite);
    if (this.d_current_tab_index === 2) {
      this.d_current_tab_index = 0;
    }
  }

  d_current_tab_index = 0;
  d_ag_test_suite: AGTestSuite | null = null;
  d_docker_images: SandboxDockerImageData[] = [];
  d_loading = true;
  d_saving = false;
  d_settings_form_is_valid = true;

  readonly is_not_empty = is_not_empty;
  readonly format_datetime = format_datetime;

  async created() {
    this.d_ag_test_suite = deep_copy(this.ag_test_suite, AGTestSuite);
    this.d_docker_images = await get_sandbox_docker_images();
    this.d_loading = false;
  }

  get instructor_files_available() {
    return this.project.instructor_files!.filter((instructor_file: InstructorFile) => {
      return this.d_ag_test_suite!.instructor_files_needed.findIndex(
        (file: InstructorFile) => file.pk === instructor_file.pk) === -1;
    });
  }

  get expected_student_files_available() {
    return this.project.expected_student_files.filter(
      (expected_student_file: ExpectedStudentFile) => {
        return this.d_ag_test_suite!.student_files_needed.findIndex(
          (file: ExpectedStudentFile) => file.pk === expected_student_file.pk) === -1;
      }
    );
  }

  add_instructor_file(instructor_file: InstructorFile) {
    this.d_ag_test_suite!.instructor_files_needed.push(instructor_file);
  }

  add_student_file(student_file: ExpectedStudentFile) {
    this.d_ag_test_suite!.student_files_needed.push(student_file);
  }

  delete_instructor_file(instructor_file: InstructorFile) {
    let index = this.d_ag_test_suite!.instructor_files_needed.findIndex(
      (file: InstructorFile) => file.pk === instructor_file.pk
    );
    this.d_ag_test_suite!.instructor_files_needed.splice(index, 1);
  }

  delete_student_file(student_file: ExpectedStudentFile) {
    let index = this.d_ag_test_suite!.student_files_needed.findIndex(
      (file: ExpectedStudentFile) => file.pk === student_file.pk
    );
    this.d_ag_test_suite!.student_files_needed.splice(index, 1);
  }

  async delete_ag_test_suite() {
    await this.d_ag_test_suite!.delete();
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
      this.d_saving = true;
      (<APIErrors> this.$refs.api_errors).clear();
      await this.d_ag_test_suite!.save();
    }
    finally {
      this.d_saving = false;
    }
  }
}

function handle_save_ag_suite_settings_error(component: AGSuiteSettings, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/components/ag_tests.scss';
@import '@/styles/forms.scss';

.tab-body {
  padding: 15px;
}

.sandbox-docker-image-dropdown {
  min-width: 400px;
  width: 100%;
}

#setup-command-container {
  margin: 15px 0 10px 0;
}

.checkbox-container {
  padding: 0 12px 22px 12px;
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

.delete-ag-test-suite-button {
  @extend .delete-level-button;
}

.delete-ag-test-suite-button span {
  margin-left: 5px;
}

.sandbox-container {
  padding: 10px 0 10px 3px;
}

#ag-test-suite-name-container {
  padding: 0 12px 22px 12px;
}

</style>
