<template>
  <div id="ag-test-command-settings-component" v-if="d_ag_test_command !== null">

<!------------------------ Command Settings ------------------------------------->
    <validated-form id="ag-test-command-settings-form"
                    autocomplete="off"
                    spellcheck="false"
                    @submit="save_ag_test_command_settings"
                    @form_validity_changed="d_settings_form_is_valid = $event">
      <div id="ag-test-command-name-container" v-if="!case_has_exactly_one_command">
        <label class="text-label"> Name </label>
        <validated-input ref="command_name"
                         id="input-name"
                         v-model="d_ag_test_command.name"
                         :validators="[is_not_empty]">
        </validated-input>
      </div>

      <div id="ag-test-command-container">
        <label class="text-label">
          Command
          <i class="fas fa-question-circle input-tooltip">
            <tooltip width="large" placement="right">
              Can be any valid bash command. <br>
              Note that if it includes sequencing or piping,
              you will have to increase the process limit.
            </tooltip>
          </i>
        </label>
        <validated-input ref="cmd"
                         id="input-cmd"
                         v-model="d_ag_test_command.cmd"
                         :num_rows="2"
                         :validators="[is_not_empty]">
        </validated-input>
      </div>

      <fieldset class="fieldset">
        <legend class="legend"> Stdin </legend>
        <div class="ag-test-command-input-container file-dropdown-adjacent">
          <label class="text-label"> Stdin source: </label>

          <div class="dropdown">
            <select id="stdin-source"
                    v-model="d_ag_test_command.stdin_source"
                    class="select">

              <option :value="StdinSource.none">
                No input
              </option>

              <option :value="StdinSource.text">
                Text
              </option>

              <option :value="StdinSource.instructor_file">
                Instructor file content
              </option>
            </select>
          </div>

        </div>

        <div v-if="d_ag_test_command.stdin_source === StdinSource.text"
              class="text-container">
          <label class="text-label"> Stdin source text: </label>
          <validated-input ref="stdin_text"
                           placeholder="Enter the stdin input here."
                           :num_rows="5"
                           v-model="d_ag_test_command.stdin_text"
                           :validators="[]">
          </validated-input>
        </div>

        <div v-if="d_ag_test_command.stdin_source === StdinSource.instructor_file"
              class="file-dropdown-container">
          <label class="text-label"> File name: </label>

          <div>
            <dropdown id="stdin-instructor-file"
                      :items="project.instructor_files"
                      dropdown_height="250px"
                      @update_item_selected="d_ag_test_command.stdin_instructor_file
                                              = $event">
              <template slot="header">
                <div tabindex="0" class="dropdown-header-wrapper">
                  <div class="dropdown-header instructor-file-dropdown">
                    {{d_ag_test_command.stdin_instructor_file === null ? ' '
                      : d_ag_test_command.stdin_instructor_file.name}}
                    <i class="fas fa-caret-down dropdown-caret"></i>
                  </div>
                </div>
              </template>
              <div slot-scope="{item}">
                <span>
                  {{item.name}}
                </span>
              </div>
            </dropdown>
          </div>
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="legend"> Return Code </legend>
        <div class="ag-test-command-input-container">
          <label class="text-label"> Expected Return Code: </label>
          <div class="dropdown">
            <select id="expected-return-code"
                    v-model="d_ag_test_command.expected_return_code"
                    class="select">
              <option :value="ExpectedReturnCode.none">
                Don't Check
              </option>
              <option :value="ExpectedReturnCode.zero">
                Zero
              </option>
              <option :value="ExpectedReturnCode.nonzero">
                Nonzero
              </option>
            </select>
          </div>
        </div>

        <div v-if="d_ag_test_command.expected_return_code !== ExpectedReturnCode.none"
              class="point-assignment-container">
          <div class="add-points-container">
            <label class="text-label"> Correct return code </label>
            <div>
              <validated-input ref="points_for_correct_return_code"
                               v-model="d_ag_test_command.points_for_correct_return_code"
                               :validators="[
                                 is_not_empty,
                                 is_integer,
                                 is_greater_than_or_equal_to_zero
                               ]"
                               input_style="width: 80px;"
                               :from_string_fn="string_to_num">
                <div slot="suffix" class="unit-of-measurement"> points </div>
              </validated-input>
            </div>
          </div>

          <div class="subtract-points-container">
            <label class="text-label"> Wrong return code </label>
            <div>
              <validated-input ref="deduction_for_wrong_return_code"
                               v-model="
                               d_ag_test_command.deduction_for_wrong_return_code"
                               :validators="[
                                 is_not_empty,
                                 is_integer,
                                 is_less_than_or_equal_to_zero
                               ]"
                               input_style="width: 80px;"
                               :from_string_fn="string_to_num">
                <div slot="suffix" class="unit-of-measurement"> points </div>
              </validated-input>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="legend"> Stdout </legend>
        <div class="ag-test-command-input-container file-dropdown-adjacent">
          <label class="text-label"> Check stdout against: </label>
          <div class="dropdown">
            <select id="expected-stdout-source"
                    v-model="d_ag_test_command.expected_stdout_source"
                    class="select">
              <option :value="ExpectedOutputSource.none">
                Don't Check
              </option>
              <option :value="ExpectedOutputSource.text">
                Text
              </option>
              <option :value="ExpectedOutputSource.instructor_file">
                Instructor file content
              </option>
            </select>
          </div>
        </div>

        <div v-if="d_ag_test_command.expected_stdout_source
                    === ExpectedOutputSource.text"
              class="text-container">
          <label class="text-label"> Expected stdout text: </label>
          <validated-input ref="expected_stdout_text"
                           placeholder="Enter the expected stdout output here."
                           v-model="d_ag_test_command.expected_stdout_text"
                           :num_rows="5"
                           :validators="[]">
          </validated-input>
        </div>

        <div v-if="d_ag_test_command.expected_stdout_source
                    === ExpectedOutputSource.instructor_file"
              class="file-dropdown-container">
          <label class="text-label"> File name: </label>

          <div>
            <dropdown id="expected-stdout-instructor-file"
                      :items="project.instructor_files"
                      dropdown_height="250px"
                      @update_item_selected="
                          d_ag_test_command.expected_stdout_instructor_file = $event">
              <template slot="header">
                <div tabindex="0" class="dropdown-header-wrapper">
                  <div class="dropdown-header instructor-file-dropdown">
                    {{d_ag_test_command.expected_stdout_instructor_file === null ? ' '
                    : d_ag_test_command.expected_stdout_instructor_file.name}}
                    <i class="fas fa-caret-down dropdown-caret"></i>
                  </div>
                </div>
              </template>
              <div slot-scope="{item}">
                <span>
                  {{item.name}}
                </span>
              </div>
            </dropdown>
          </div>
        </div>

        <div v-if="d_ag_test_command.expected_stdout_source
                    !== ExpectedOutputSource.none"
              class="point-assignment-container">
          <div class="add-points-container">
            <label class="text-label"> Correct stdout </label>
            <div>
              <validated-input ref="points_for_correct_stdout"
                               v-model="d_ag_test_command.points_for_correct_stdout"
                               :validators="[
                                 is_not_empty,
                                 is_integer,
                                 is_greater_than_or_equal_to_zero
                               ]"
                               input_style="width: 80px;"
                               :from_string_fn="string_to_num">
                <div slot="suffix" class="unit-of-measurement"> points </div>
              </validated-input>
            </div>
          </div>

          <div class="subtract-points-container">
            <label class="text-label"> Wrong stdout</label>

            <div>
              <validated-input ref="deduction_for_wrong_stdout"
                               v-model="d_ag_test_command.deduction_for_wrong_stdout"
                               :validators="[
                                 is_not_empty,
                                 is_integer,
                                 is_less_than_or_equal_to_zero
                               ]"
                               input_style="width: 80px;"
                               :from_string_fn="string_to_num">
                <div slot="suffix" class="unit-of-measurement"> points </div>
              </validated-input>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="legend"> Stderr </legend>
        <div class="ag-test-command-input-container file-dropdown-adjacent">
          <label class="text-label"> Check stderr against: </label>
          <div class="dropdown">
            <select id="expected-stderr-source"
                    v-model="d_ag_test_command.expected_stderr_source"
                    class="select">
              <option :value="ExpectedOutputSource.none">
                Don't Check
              </option>
              <option :value="ExpectedOutputSource.text">
                Text
              </option>
              <option :value="ExpectedOutputSource.instructor_file">
                Instructor file content
              </option>
            </select>
          </div>
        </div>

        <div v-if="d_ag_test_command.expected_stderr_source
                    === ExpectedOutputSource.text"
              class="text-container">
          <label class="text-label"> Expected stderr text: </label>
          <validated-input ref="expected_stderr_text"
                           placeholder="Enter the expected stderr output here."
                           v-model="d_ag_test_command.expected_stderr_text"
                           :num_rows="5"
                           :validators="[]">
          </validated-input>
        </div>

        <div v-if="d_ag_test_command.expected_stderr_source
                    === ExpectedOutputSource.instructor_file"
              class="file-dropdown-container">
          <label class="text-label"> File name: </label>

          <div>
            <dropdown id="expected-stderr-instructor-file"
                      :items="project.instructor_files"
                      dropdown_height="250px"
                      @update_item_selected="
                          d_ag_test_command.expected_stderr_instructor_file = $event">
              <template slot="header">
                <div tabindex="0" class="dropdown-header-wrapper">
                  <div class="dropdown-header instructor-file-dropdown">
                    {{d_ag_test_command.expected_stderr_instructor_file === null ? ' '
                    : d_ag_test_command.expected_stderr_instructor_file.name}}
                    <i class="fas fa-caret-down dropdown-caret"></i>
                  </div>
                </div>
              </template>
              <div slot-scope="{item}">
                <span>
                  {{item.name}}
                </span>
              </div>
            </dropdown>
          </div>
        </div>

        <div v-if="d_ag_test_command.expected_stderr_source
                    !== ExpectedOutputSource.none"
              class="point-assignment-container">
          <div class="add-points-container">
            <label class="text-label"> Correct stderr </label>
            <div>
              <validated-input ref="points_for_correct_stderr"
                               v-model="d_ag_test_command.points_for_correct_stderr"
                               :validators="[
                                 is_not_empty,
                                 is_integer,
                                 is_greater_than_or_equal_to_zero
                               ]"
                               input_style="width: 80px;"
                               :from_string_fn="string_to_num">
                <div slot="suffix" class="unit-of-measurement"> points </div>
              </validated-input>
            </div>
          </div>

          <div class="subtract-points-container">
            <label class="text-label">  Wrong stderr </label>
            <div>
              <validated-input ref="deduction_for_wrong_stderr"
                               v-model="d_ag_test_command.deduction_for_wrong_stderr"
                               :validators="[
                                 is_not_empty,
                                 is_integer,
                                 is_less_than_or_equal_to_zero
                               ]"
                               input_style="width: 80px;"
                               :from_string_fn="string_to_num">
                <div slot="suffix" class="unit-of-measurement"> points </div>
              </validated-input>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset v-if="d_ag_test_command.expected_stdout_source !== ExpectedOutputSource.none
                || d_ag_test_command.expected_stderr_source !== ExpectedOutputSource.none"
                class="fieldset diff-options">
        <legend class="legend"> Diff Options </legend>
        <div class="checkbox-input-container">
          <input id="ignore-case"
                  type="checkbox"
                  class="checkbox"
                  v-model="d_ag_test_command.ignore_case">
          <label class="checkbox-label"
                  for="ignore-case"> Ignore case sensitivity
          </label>
        </div>

        <div class="checkbox-input-container">
          <input id="ignore-whitespace"
                  type="checkbox"
                  class="checkbox"
                  v-model="d_ag_test_command.ignore_whitespace">
          <label class="checkbox-label"
                  for="ignore-whitespace"> Ignore whitespace
          </label>
        </div>

        <div class="checkbox-input-container">
          <input id="ignore-whitespace-changes"
                  type="checkbox"
                  class="checkbox"
                  v-model="d_ag_test_command.ignore_whitespace_changes">
          <label class="checkbox-label"
                  for="ignore-whitespace-changes"> Ignore whitespace changes
          </label>
        </div>

        <div class="checkbox-input-container">
          <input id="ignore-blank-lines"
                  type="checkbox"
                  class="checkbox"
                  v-model="d_ag_test_command.ignore_blank_lines">
          <label class="checkbox-label"
                  for="ignore-blank-lines"> Ignore blank lines
          </label>
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="legend"> Resource Limits </legend>
        <div id="time-and-virtual">
          <div id="time-limit-container">
            <label class="text-label"> Time limit </label>
            <div class="resource-input">
              <validated-input ref="time_limit"
                               id="input-time-limit"
                               v-model="d_ag_test_command.time_limit"
                               input_style="width: 150px;"
                               :validators="[
                                 is_not_empty,
                                 is_integer,
                                 is_greater_than_or_equal_to_one
                               ]"
                               :from_string_fn="string_to_num">
                <div slot="suffix" class="unit-of-measurement"> seconds </div>
              </validated-input>
            </div>
          </div>

          <div id="virtual-memory-container">
            <label class="text-label"> Virtual memory limit </label>
            <div class="resource-input">
              <validated-input ref="virtual_memory_limit"
                               id="input-virtual-memory-limit"
                               v-model="d_ag_test_command.virtual_memory_limit"
                               input_style="width: 150px;"
                               :validators="[
                                 is_not_empty,
                                 is_integer,
                                 is_greater_than_or_equal_to_one
                               ]"
                               :from_string_fn="string_to_num">
                <div slot="suffix" class="unit-of-measurement"> bytes </div>
              </validated-input>
            </div>
          </div>
        </div>

        <div id="stack-and-process">

          <div id="stack-size-container">
            <label class="text-label"> Stack size limit </label>
            <div class="resource-input">
              <validated-input ref="stack_size_limit"
                               id="input-stack-size-limit"
                               v-model="d_ag_test_command.stack_size_limit"
                               input_style="width: 150px;"
                               :validators="[
                                 is_not_empty,
                                 is_integer,
                                 is_greater_than_or_equal_to_one
                               ]"
                               :from_string_fn="string_to_num">
                <div slot="suffix" class="unit-of-measurement"> bytes </div>
              </validated-input>
            </div>
          </div>

          <div id="process-spawn-container">
            <label class="text-label"> Process spawn limit </label>
            <div class="resource-input">
              <validated-input ref="process_spawn_limit"
                               id="input-process-spawn-limit"
                               v-model="d_ag_test_command.process_spawn_limit"
                               input_style="width: 150px;"
                               :validators="[
                                 is_not_empty,
                                 is_integer,
                                 is_greater_than_or_equal_to_zero
                               ]"
                               :from_string_fn="string_to_num">
                <div slot="suffix" class="unit-of-measurement"> child processes </div>
              </validated-input>
            </div>
          </div>

        </div>
      </fieldset>

      <!------------------------ Feedback ------------------------------------->
      <fieldset class="fieldset">
        <legend class="legend"> Feedback </legend>
        <div class="config-panels-container">
          <feedback-config-panel ref="normal_config_panel"
                                 v-model="d_ag_test_command.normal_fdbk_config"
                                 :preset_options="fdbk_presets">
            <template slot="header">
              <div class="config-name">
                {{FeedbackConfigLabel.normal}}
                <i class="fas fa-question-circle input-tooltip">
                  <tooltip width="large" placement="right">
                    {{FeedbackDescriptions.normal}}
                  </tooltip>
                </i>
              </div>
            </template>
            <template slot="settings">
              <AGTestCommandAdvancedFdbkSettings ref="normal_edit_feedback_settings"
                                             v-model="d_ag_test_command.normal_fdbk_config"
                                             :ag_test_case="ag_test_case"
                                             :config_name="FeedbackConfigLabel.normal">
              </AGTestCommandAdvancedFdbkSettings>
            </template>
          </feedback-config-panel>

          <feedback-config-panel ref="first_failure_config_panel"
                                 v-model="d_ag_test_command.first_failed_test_normal_fdbk_config"
                                 :preset_options="fdbk_presets">
            <template slot="header">
              <div class="config-name">
                {{FeedbackConfigLabel.first_failure}}
                <i class="fas fa-question-circle input-tooltip">
                  <tooltip width="large" placement="right">
                    {{FeedbackDescriptions.first_failure}}
                  </tooltip>
                </i>
              </div>
            </template>
            <template slot="settings">
              <div class="checkbox-input-container">
                <input id="first-failure-config-enabled"
                       type="checkbox"
                       @change="toggle_first_failure_feedback"
                       class="checkbox"
                       v-model="d_first_failed_config_is_enabled">
                <label for="first-failure-config-enabled">
                  Enabled
                </label>
              </div>
              <AGTestCommandAdvancedFdbkSettings
                ref="first_failure_edit_feedback_settings"
                v-model="d_ag_test_command.first_failed_test_normal_fdbk_config"
                :ag_test_case="ag_test_case"
                :config_name="FeedbackConfigLabel.first_failure">
              </AGTestCommandAdvancedFdbkSettings>
            </template>
          </feedback-config-panel>

          <feedback-config-panel ref="final_graded_config_panel"
                                 v-model="d_ag_test_command.ultimate_submission_fdbk_config"
                                 :preset_options="fdbk_presets">
            <template slot="header">
              <div class="config-name">
                {{FeedbackConfigLabel.ultimate_submission}}
                <i class="fas fa-question-circle input-tooltip">
                  <tooltip width="large" placement="right">
                    {{FeedbackDescriptions.ultimate_submission}}
                  </tooltip>
                </i>
              </div>
            </template>
            <template slot="settings">
              <AGTestCommandAdvancedFdbkSettings
                ref="final_graded_edit_feedback_settings"
                v-model="d_ag_test_command.ultimate_submission_fdbk_config"
                :ag_test_case="ag_test_case"
                :config_name="FeedbackConfigLabel.ultimate_submission">
              </AGTestCommandAdvancedFdbkSettings>
            </template>
          </feedback-config-panel>

          <feedback-config-panel ref="past_limit_config_panel"
                                 v-model="d_ag_test_command.past_limit_submission_fdbk_config"
                                 :preset_options="fdbk_presets">
            <template slot="header">
              <div class="config-name">
                {{FeedbackConfigLabel.past_limit}}
                <i class="fas fa-question-circle input-tooltip">
                  <tooltip width="large" placement="right">
                    {{FeedbackDescriptions.past_limit}}
                  </tooltip>
                </i>
              </div>
            </template>
            <template slot="settings">
              <AGTestCommandAdvancedFdbkSettings
                ref="past_limit_edit_feedback_settings"
                  v-model="d_ag_test_command.past_limit_submission_fdbk_config"
                :ag_test_case="ag_test_case"
                :config_name="FeedbackConfigLabel.past_limit">
              </AGTestCommandAdvancedFdbkSettings>
            </template>
          </feedback-config-panel>

          <feedback-config-panel ref="student_lookup_config_panel"
                                 v-model="d_ag_test_command.staff_viewer_fdbk_config"
                                 :preset_options="fdbk_presets">
            <template slot="header">
              <div class="config-name">
                {{FeedbackConfigLabel.staff_viewer}}
                <i class="fas fa-question-circle input-tooltip">
                  <tooltip width="large" placement="right">
                    {{FeedbackDescriptions.staff_viewer}}
                  </tooltip>
                </i>
              </div>
            </template>
            <template slot="settings">
              <AGTestCommandAdvancedFdbkSettings ref="student_lookup_edit_feedback_settings"
                                             v-model="d_ag_test_command.staff_viewer_fdbk_config"
                                             :ag_test_case="ag_test_case"
                                             :config_name="FeedbackConfigLabel.staff_viewer">
              </AGTestCommandAdvancedFdbkSettings>
            </template>
          </feedback-config-panel>
        </div>

      </fieldset>

      <div class="bottom-of-form">
        <APIErrors ref="api_errors" @num_errors_changed="d_num_api_errors = $event"></APIErrors>

        <button type="submit"
                class="save-button"
                :disabled="!d_settings_form_is_valid || d_saving">Save</button>

        <button type="submit"
                class="sticky-save-button"
                :disabled="!d_settings_form_is_valid || d_saving">
          <i v-if="d_num_api_errors === 0" class="far fa-save"></i>
          <i v-else class="fas fa-exclamation-triangle"></i>
        </button>

        <div v-if="!d_saving" class="last-saved-timestamp">
          <span> Last Saved: </span> {{format_datetime(d_ag_test_command.last_modified)}}
        </div>

        <div v-else class="last-saved-spinner">
          <i class="fa fa-spinner fa-pulse"></i>
        </div>
      </div>

    </validated-form>

<!--------------------------- Danger Zone --------------------------------------->

    <div id="danger-zone-container">
      <div id="danger-text">
        {{case_has_exactly_one_command ? 'Delete Test Case' : 'Delete Command'}}:
        <span>
          {{case_has_exactly_one_command ? d_ag_test_case.name : d_ag_test_command.name}}
        </span>
      </div>
      <button class="delete-ag-test-command-button"
              type="button"
              @click="d_show_delete_ag_test_command_modal = true">
        Delete
      </button>

      <modal v-if="d_show_delete_ag_test_command_modal"
              @close="d_show_delete_ag_test_command_modal = false"
              ref="delete_ag_test_command_modal"
              size="large"
              click_outside_to_close>
        <div class="modal-header">
          Confirm Delete
        </div>
        <hr>
        <div class="modal-body">
          <p>
          Are you sure you want to delete the
          {{case_has_exactly_one_command ? 'test case' : 'command'}}:
          <span class="item-to-delete">
            "{{case_has_exactly_one_command ? d_ag_test_case.name : d_ag_test_command.name}}"
          </span>? <br>

          <span v-if="case_has_exactly_one_command">
            This will delete all associated run results. <br>
            THIS ACTION CANNOT BE UNDONE.
          </span>

          <span v-if="!case_has_exactly_one_command">
            This will delete all associated run results. <br>
            THIS ACTION CANNOT BE UNDONE. </span>
          </p>
          <div class="deletion-modal-button-footer">
            <button class="modal-delete-button"
                    :disabled="d_deleting"
                    @click="delete_ag_test_command()"> Delete </button>

            <button class="modal-cancel-button"
                    @click="d_show_delete_ag_test_command_modal = false"> Cancel </button>
          </div>
        </div>
      </modal>
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  AGTestCase,
  AGTestCommand,
  AGTestCommandFeedbackConfig,
  ExpectedOutputSource,
  ExpectedReturnCode,
  Project,
  StdinSource,
  ValueFeedbackLevel,
} from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import Dropdown from '@/components/dropdown.vue';
import Modal from '@/components/modal.vue';
import AGTestCommandAdvancedFdbkSettings from '@/components/project_admin/ag_suites/ag_test_command_advanced_fdbk_settings.vue';
import FeedbackConfigPanel from '@/components/project_admin/feedback_config_panel.vue';
import {
  AGTestCommandFeedbackPreset,
  FeedbackConfigLabel,
  FeedbackDescriptions,
  hyphenate
} from '@/components/project_admin/feedback_config_utils.ts';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { SafeMap } from '@/safe_map';
import { deep_copy, format_datetime, handle_api_errors_async, toggle } from '@/utils';
import {
  is_integer,
  is_not_empty,
  make_max_value_validator,
  make_min_value_validator,
  string_to_num,
} from '@/validators';

@Component({
  components: {
    APIErrors,
    FeedbackConfigPanel,
    Dropdown,
    AGTestCommandAdvancedFdbkSettings,
    Modal,
    Tooltip,
    ValidatedForm,
    ValidatedInput
  }
})
export default class AGTestCommandSettings extends Vue {

  @Prop({required: true, type: AGTestCommand})
  ag_test_command!: AGTestCommand;

  @Prop({required: true, type: AGTestCase})
  ag_test_case!: AGTestCase;

  @Prop({required: true, type: Project})
  project!: Project;

  d_ag_test_command: AGTestCommand | null = null;
  d_ag_test_case: AGTestCase | null = null;

  d_saving = false;
  d_num_api_errors = 0;
  d_settings_form_is_valid = true;
  d_deleting = false;
  d_show_delete_ag_test_command_modal = false;

  d_first_failed_config_is_enabled = false;
  d_latest_first_failed_config_value: AGTestCommandFeedbackConfig | null = null;

  readonly is_not_empty = is_not_empty;
  readonly is_integer = is_integer;
  readonly is_greater_than_or_equal_to_zero = make_min_value_validator(0);
  readonly is_greater_than_or_equal_to_one = make_min_value_validator(1);
  readonly is_less_than_or_equal_to_zero = make_max_value_validator(0);
  readonly string_to_num = string_to_num;
  readonly StdinSource = StdinSource;
  readonly ExpectedOutputSource = ExpectedOutputSource;
  readonly ExpectedReturnCode = ExpectedReturnCode;
  readonly FeedbackConfigLabel = FeedbackConfigLabel;
  readonly FeedbackDescriptions = FeedbackDescriptions;
  readonly format_datetime = format_datetime;

  @Watch('ag_test_command')
  on_test_command_change(new_test_command: AGTestCommand, old_test_command: AGTestCommand) {
    this.d_ag_test_command = deep_copy(new_test_command, AGTestCommand);
  }

  // We need a deep watcher to pick up on the deletion of commands from the ag_suites component
  @Watch('ag_test_case', {deep: true})
  on_test_case_change(new_ag_test_case: AGTestCase, old_ag_test_case: AGTestCase) {
    this.d_ag_test_case = deep_copy(new_ag_test_case, AGTestCase);
  }

  async created() {
    this.d_ag_test_command = deep_copy(this.ag_test_command, AGTestCommand);
    this.d_ag_test_case = deep_copy(this.ag_test_case, AGTestCase);
  }

  get case_has_exactly_one_command() {
    return this.d_ag_test_case!.ag_test_commands.length === 1;
  }

  delete_ag_test_command() {
    return toggle(this, 'd_deleting', async () => {
      if (this.case_has_exactly_one_command) {
        await this.d_ag_test_case!.delete();
      }
      else {
        await this.d_ag_test_command!.delete();
      }
      this.d_show_delete_ag_test_command_modal = false;
    });
  }

  @handle_api_errors_async(handle_save_ag_command_settings_error)
  save_ag_test_command_settings() {
    return toggle(this, 'd_saving', () => {
      (<APIErrors> this.$refs.api_errors).clear();
      return this.d_ag_test_command!.save();
    });
  }

  toggle_first_failure_feedback() {
    if (this.d_first_failed_config_is_enabled) {
      this.d_ag_test_command!.first_failed_test_normal_fdbk_config = {
        visible: true,
        return_code_fdbk_level: ValueFeedbackLevel.expected_and_actual,
        stdout_fdbk_level: ValueFeedbackLevel.expected_and_actual,
        stderr_fdbk_level: ValueFeedbackLevel.expected_and_actual,
        show_points: true,
        show_actual_return_code: true,
        show_actual_stdout: true,
        show_actual_stderr: true,
        show_whether_timed_out: true
      };
    }
    else {
      this.d_ag_test_command!.first_failed_test_normal_fdbk_config = null;
    }
  }

  readonly fdbk_presets = new SafeMap<string, AGTestCommandFeedbackPreset>([
    [
      'Public',
      {
        return_code_fdbk_level: ValueFeedbackLevel.expected_and_actual,
        stdout_fdbk_level: ValueFeedbackLevel.expected_and_actual,
        stderr_fdbk_level: ValueFeedbackLevel.expected_and_actual,
        show_points: true,
        show_actual_return_code: true,
        show_actual_stdout: true,
        show_actual_stderr: true,
        show_whether_timed_out: true
      }
    ],
    [
      'Pass/Fail + Output',
      {
        return_code_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
        stdout_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
        stderr_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
        show_points: true,
        show_actual_return_code: true,
        show_actual_stdout: true,
        show_actual_stderr: true,
        show_whether_timed_out: true
      }
    ],
    [
      'Pass/Fail + Diff',
      {
        return_code_fdbk_level: ValueFeedbackLevel.expected_and_actual,
        stdout_fdbk_level: ValueFeedbackLevel.expected_and_actual,
        stderr_fdbk_level: ValueFeedbackLevel.expected_and_actual,
        show_points: true,
        show_actual_return_code: true,
        show_actual_stdout: false,
        show_actual_stderr: false,
        show_whether_timed_out: true
      }
    ],
    [
      'Pass/Fail + Exit Status',
      {
        return_code_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
        stdout_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
        stderr_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
        show_points: true,
        show_actual_return_code: true,
        show_actual_stdout: false,
        show_actual_stderr: false,
        show_whether_timed_out: true
      }
    ],
    [
      'Pass/Fail',
      {
        return_code_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
        stdout_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
        stderr_fdbk_level: ValueFeedbackLevel.correct_or_incorrect,
        show_points: true,
        show_actual_return_code: false,
        show_actual_stdout: false,
        show_actual_stderr: false,
        show_whether_timed_out: false
      }
    ],
    [
      'Private',
      {
        return_code_fdbk_level: ValueFeedbackLevel.no_feedback,
        stdout_fdbk_level: ValueFeedbackLevel.no_feedback,
        stderr_fdbk_level: ValueFeedbackLevel.no_feedback,
        show_points: false,
        show_actual_return_code: false,
        show_actual_stdout: false,
        show_actual_stderr: false,
        show_whether_timed_out: false
      }
    ]
  ]);
}

function handle_save_ag_command_settings_error(component: AGTestCommandSettings, error: unknown) {
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
@import '@/styles/components/feedback_config.scss';
@import '@/styles/forms.scss';

@import './ag_tests.scss';

.ag-test-command-input-container {
  padding: 10px 0 10px 0;
}

#ag-test-command-name-container {
  padding: 10px 14px 12px 14px;
}

#ag-test-command-container {
  padding: 10px 14px 22px 14px;
}

.file-dropdown-container {
  display: inline-block;
  vertical-align: top;
  margin-top: 10px;
}

.file-dropdown-adjacent {
  display: inline-block;
  width: 200px;
  margin-right: 5px;
  vertical-align: top;
}

.instructor-file-dropdown {
  min-width: 400px;
  width: 100%;
}

.add-points-container div, .subtract-points-container div {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.plus-sign, .minus-sign {
  display: flex;
  padding-right: 10px;
  flex-direction: row;
  justify-content: flex-start;
}

.plus-sign {
  color: $ocean-blue;
}

.minus-sign {
  color: $orange;
}

.text-container {
  margin-top: 10px;
}

.point-assignment-container {
  padding: 10px 0 0 0;
}

.add-points-container {
  display: block;
  box-sizing: border-box;
  width: 200px;
  margin-right: 5px;
}

.subtract-points-container {
  display: block;
}

.unit-of-measurement {
  padding-left: 10px;
  font-size: 14px;
}

#time-limit-container {
  display: inline-block;
  margin-right: 50px;
  padding-bottom: 20px;
  vertical-align: top;
}

#virtual-memory-container {
  display: inline-block;
  padding-bottom: 20px;
  vertical-align: top;
}

#stack-size-container {
  display: inline-block;
  margin-right: 50px;
  padding-bottom: 20px;
  vertical-align: top;
}

#process-spawn-container {
  display: inline-block;
  padding-bottom: 25px;
  vertical-align: top;
}

#time-limit-and-stack-size {
  padding: 0;
}

.sticky-save-button {
  @extend .green-button;
  position: fixed;
  bottom: $footer-height;
  right: 0;

  font-size: 20px;
  padding: 5px 10px;

  color: white;

  border-radius: 1px;
}

@media only screen and (min-width: 481px) {
  .point-assignment-container {
    padding: 10px 0 0 0;
    min-width: 500px;
  }

  .add-points-container, .subtract-points-container {
    display: inline-block;
  }

  #time-limit-container {
    width: 300px;
  }

  #virtual-memory-container {
    width: 300px;
  }

  #stack-size-container {
    width: 300px;
  }

  #process-spawn-container {
    width: 300px;
  }
}
</style>
