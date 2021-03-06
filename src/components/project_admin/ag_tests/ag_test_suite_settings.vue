<template>
  <div v-if="d_ag_test_suite !== null">
    <div v-if="!d_loading">
      <!------------------------ Suite Settings ------------------------------------->

      <validated-form data-testid="ag_test_suite_settings_form"
                      autocomplete="off"
                      spellcheck="false"
                      @submit="save_ag_test_suite_settings"
                      @form_validity_changed="d_settings_form_is_valid = $event">
        <suite-settings :suite="d_ag_test_suite"
                        :project="project"
                        :docker_images="d_docker_images"
                        @field_change="Object.assign(d_ag_test_suite, $event)"></suite-settings>

        <fieldset class="fieldset">
          <legend class="legend"> Setup </legend>

          <div class="form-field-wrapper">
            <label class="label">
              Setup command label
              <tooltip width="large" placement="top">
                What to call the setup command when displaying results.<br>
                For example, if the setup command compiles the code, this value
                could be "Compile".
              </tooltip>
            </label>
            <validated-input ref="setup_suite_cmd_name"
                             v-model="d_ag_test_suite.setup_suite_cmd_name"
                             :validators="[]">
            </validated-input>
          </div>

          <div class="form-field-wrapper">
            <label class="label">
              Setup command
              <tooltip width="large" placement="top">
                Leave this field blank to specify no setup command.
              </tooltip>
            </label>
            <validated-input ref="setup_suite_cmd"
                             v-model="d_ag_test_suite.setup_suite_cmd"
                             :validators="[]">
            </validated-input>
          </div>

          <div class="checkbox-input-container">
            <label class="checkbox-label">
              <input data-testid="reject_submission_if_setup_fails"
                     type="checkbox"
                     class="checkbox"
                     v-model="d_ag_test_suite.reject_submission_if_setup_fails"
                     :disabled="!is_first_suite"/>
              Reject submission if setup fails
            </label>
            <tooltip width="large" placement="top">
              If this suite's setup command fails, stop grading the current submission. <br>
              - Only allowed for the FIRST TEST SUITE in a project. <br>
              - The submission will not be counted toward the
              {{project.min_group_size === 1 ? 'student' : 'group'}}'s daily limit. <br>
              - If a bonus submission token was used, it will be refunded. <br>
              - Late day tokens used will NOT be refunded.
            </tooltip>
          </div>

        </fieldset>

        <!------------------------ Feedback Settings ------------------------------------->

        <fieldset class="fieldset">
          <legend class="legend">Feedback</legend>
          <div class="config-panels-container">
            <feedback-config-panel ref="normal_config_panel"
                                   v-model="d_ag_test_suite.normal_fdbk_config"
                                   :preset_options="fdbk_presets">
              <template slot="header">
                <div class="config-name">
                  {{FeedbackConfigLabel.normal}}
                  <tooltip width="large" placement="top">
                    {{FeedbackDescriptions.normal}}
                  </tooltip>
                </div>
              </template>
              <template slot="settings">
                <AGTestSuiteAdvancedFdbkSettings ref="normal_edit_feedback_settings"
                                                 v-model="d_ag_test_suite.normal_fdbk_config"
                                                 :config_name="FeedbackConfigLabel.normal">
                </AGTestSuiteAdvancedFdbkSettings>
              </template>
            </feedback-config-panel>

            <feedback-config-panel ref="final_graded_config_panel"
                                   v-model="d_ag_test_suite.ultimate_submission_fdbk_config"
                                   :preset_options="fdbk_presets">
              <template slot="header">
                <div class="config-name">
                  {{FeedbackConfigLabel.ultimate_submission}}
                  <tooltip width="large" placement="top">
                    {{FeedbackDescriptions.ultimate_submission}}
                  </tooltip>
                </div>
              </template>
              <template slot="settings">
                <AGTestSuiteAdvancedFdbkSettings
                  ref="final_graded_edit_feedback_settings"
                  v-model="d_ag_test_suite.ultimate_submission_fdbk_config"
                  :config_name="FeedbackConfigLabel.ultimate_submission">
                </AGTestSuiteAdvancedFdbkSettings>
              </template>
            </feedback-config-panel>

            <feedback-config-panel ref="past_limit_config_panel"
                                   v-model="d_ag_test_suite.past_limit_submission_fdbk_config"
                                   :preset_options="fdbk_presets">
              <template slot="header">
                <div class="config-name">
                  {{FeedbackConfigLabel.past_limit}}
                  <tooltip width="large" placement="top">
                    {{FeedbackDescriptions.past_limit}}
                  </tooltip>
                </div>
              </template>
              <template slot="settings">
                <AGTestSuiteAdvancedFdbkSettings
                  ref="past_limit_edit_feedback_settings"
                  v-model="d_ag_test_suite.past_limit_submission_fdbk_config"
                  :config_name="FeedbackConfigLabel.past_limit">
                </AGTestSuiteAdvancedFdbkSettings>
              </template>
            </feedback-config-panel>

            <feedback-config-panel ref="student_lookup_config_panel"
                                   v-model="d_ag_test_suite.staff_viewer_fdbk_config"
                                   :preset_options="fdbk_presets">
              <template slot="header">
                <div class="config-name">
                  {{FeedbackConfigLabel.staff_viewer}}
                  <tooltip width="large" placement="top">
                    {{FeedbackDescriptions.staff_viewer}}
                  </tooltip>
                </div>
              </template>
              <template slot="settings">
                <AGTestSuiteAdvancedFdbkSettings ref="student_lookup_edit_feedback_settings"
                                                 v-model="d_ag_test_suite.staff_viewer_fdbk_config"
                                                 :config_name="FeedbackConfigLabel.staff_viewer">
                </AGTestSuiteAdvancedFdbkSettings>
              </template>
            </feedback-config-panel>
          </div>

        </fieldset>

        <APIErrors ref="api_errors" @num_errors_changed="d_num_api_errors = $event"></APIErrors>

        <div class="button-footer">
          <button type="submit"
                  class="save-button"
                  :disabled="!d_settings_form_is_valid || d_saving">Save</button>

          <button type="submit"
                  class="sticky-save-button"
                  :disabled="!d_settings_form_is_valid || d_saving">
            <i v-if="d_num_api_errors === 0" class="far fa-save"></i>
            <i v-else class="fas fa-exclamation-triangle"></i>
          </button>

          <last-saved
            :last_modified="d_ag_test_suite.last_modified"
            :saving="d_saving">
          </last-saved>
        </div>
      </validated-form>

      <!--------------------------- Danger Zone --------------------------------------->

      <div class="danger-zone-container">
        <div class="danger-text">
          Delete Test Suite: <span>{{d_ag_test_suite.name}}</span>
        </div>
        <button class="delete-ag-test-suite-button delete-button"
                type="button"
                @click="d_show_delete_ag_test_suite_modal = true">
          Delete
        </button>

        <modal v-if="d_show_delete_ag_test_suite_modal"
                @close="d_show_delete_ag_test_suite_modal = false"
                ref="delete_ag_test_suite_modal"
                size="large"
                click_outside_to_close>
          <div class="modal-header">
            Confirm Delete
          </div>
          <div class="modal-body">
            Are you sure you want to delete the suite
            <span class="item-to-delete">{{d_ag_test_suite.name}}</span>? <br><br>
            This will delete all associated test cases and run results. <br>
            <b>THIS ACTION CANNOT BE UNDONE.</b>
            <APIErrors ref="delete_errors"></APIErrors>
            <div class="modal-button-footer">
              <button class="modal-delete-button red-button"
                      :disabled="d_deleting"
                      @click="delete_ag_test_suite"> Delete </button>

              <button class="modal-cancel-button white-button"
                      @click="d_show_delete_ag_test_suite_modal = false"> Cancel </button>
            </div>
          </div>
        </modal>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  AGTestSuite,
  ExpectedStudentFile,
  InstructorFile,
  Project,
  SandboxDockerImage,
} from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import Dropdown from '@/components/dropdown.vue';
import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import LastSaved from "@/components/last_saved.vue";
import Modal from '@/components/modal.vue';
import AGTestSuiteAdvancedFdbkSettings from '@/components/project_admin/ag_tests/ag_test_suite_advanced_fdbk_settings.vue';
import { AGTestSuiteFeedbackPreset, FeedbackConfigLabel, FeedbackDescriptions } from '@/components/project_admin/feedback_config_panel/feedback_config_utils';
import SuiteSettings from '@/components/project_admin/suite_settings.vue';
import SelectObject from '@/components/select_object.vue';
import Toggle from '@/components/toggle.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import {
  handle_api_errors_async,
  handle_global_errors_async,
  make_error_handler_func
} from '@/error_handling';
import { SafeMap } from '@/safe_map';
import { deep_copy, format_datetime, toggle } from '@/utils';
import { is_not_empty } from '@/validators';

import FeedbackConfigPanel from '../feedback_config_panel/feedback_config_panel.vue';

@Component({
  components: {
    AGTestSuiteAdvancedFdbkSettings,
    APIErrors,
    DropdownTypeahead,
    FeedbackConfigPanel,
    LastSaved,
    Modal,
    SelectObject,
    SuiteSettings,
    Toggle,
    Tooltip,
    ValidatedForm,
    ValidatedInput,
  }
})
export default class AGTestSuiteSettings extends Vue {

  @Prop({required: true, type: AGTestSuite})
  ag_test_suite!: AGTestSuite;

  @Prop({required: true, type: Project})
  project!: Project;

  @Prop({default: false, type: Boolean})
  is_first_suite!: boolean;

  // {deep: true} is needed so that we detect changes to instructor_files_needed
  // and student_files_needed. Such changes can happen when an InstructorFile
  // or ExpectedStudentFile is deleted. AGTestSuites (this component's parent)
  // observes deletion of those two types and updates the _files_needed arrays.
  @Watch('ag_test_suite', {deep: true})
  on_test_suite_change(new_test_suite: AGTestSuite, old_test_suite: AGTestSuite) {
    this.d_ag_test_suite = deep_copy(new_test_suite, AGTestSuite);
  }

  d_ag_test_suite: AGTestSuite | null = null;
  d_docker_images: SandboxDockerImage[] = [];
  d_loading = true;
  d_saving = false;
  d_num_api_errors = 0;
  d_settings_form_is_valid = true;
  d_deleting = false;
  d_show_delete_ag_test_suite_modal = false;

  readonly FeedbackConfigLabel = FeedbackConfigLabel;
  readonly FeedbackDescriptions = FeedbackDescriptions;
  readonly is_not_empty = is_not_empty;
  readonly format_datetime = format_datetime;

  @handle_global_errors_async
  async created() {
    this.d_ag_test_suite = deep_copy(this.ag_test_suite, AGTestSuite);
    let global_images = await SandboxDockerImage.get_images(null);
    let course_images = await SandboxDockerImage.get_images(this.project.course);
    this.d_docker_images = global_images.concat(course_images);
    this.d_loading = false;
  }

  @handle_api_errors_async(make_error_handler_func('delete_errors'))
  delete_ag_test_suite() {
    return toggle(this, 'd_deleting', async () => {
      await this.d_ag_test_suite!.delete();
      this.d_show_delete_ag_test_suite_modal = false;
    });
  }

  @handle_api_errors_async(handle_save_ag_test_suite_settings_error)
  save_ag_test_suite_settings() {
    return toggle(this, 'd_saving', () => {
      (<APIErrors> this.$refs.api_errors).clear();
      return this.d_ag_test_suite!.save();
    });
  }

  readonly fdbk_presets = new SafeMap<string, AGTestSuiteFeedbackPreset>([
    [
      'Public Setup',
      {
        show_individual_tests: true,
        show_setup_return_code: true,
        show_setup_timed_out: true,
        show_setup_stdout: true,
        show_setup_stderr: true
      }
    ],
    [
      'Pass/Fail Setup',
      {
        show_individual_tests: true,
        show_setup_return_code: true,
        show_setup_timed_out: true,
        show_setup_stdout: false,
        show_setup_stderr: false
      }
    ],
    [
      'Private Setup',
      {
        show_individual_tests: true,
        show_setup_return_code: false,
        show_setup_timed_out: false,
        show_setup_stdout: false,
        show_setup_stderr: false
      }
    ]
  ]);
}

function handle_save_ag_test_suite_settings_error(component: AGTestSuiteSettings, error: unknown) {
  let api_errors_elt = <APIErrors> component.$refs.api_errors;
  api_errors_elt.show_errors_from_response(error);
  if (component.d_num_api_errors !== 0) {
    api_errors_elt.$el.scrollIntoView({behavior: 'smooth'});
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/modal.scss';

@import './ag_tests.scss';

.danger-zone-container {
  // We want to have ample space between the delete button and the
  // sticky save button
  max-width: 75%;
}
</style>
