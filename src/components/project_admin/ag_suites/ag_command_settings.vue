<template>
  <div id="ag-test-command-settings-component" v-if="d_ag_test_command !== null">
    <div class="test-name-wrapper">
      <template v-if="!d_editing_test_name">
        <div class="test-name">{{ag_test_case.name}}</div>
        <i @click="d_new_test_name = ag_test_case.name;
                   d_editing_test_name = !d_editing_test_name"
           ref="toggle_name_edit"
           class="fas fa-pencil-alt"></i>
      </template>
      <template v-else>
        <validated-form ref="ag_test_case_name_form" @submit="save_ag_test_case"
                        @form_validity_changed="d_name_form_valid = $event">
          <label class="label"> Test Name </label>
          <validated-input ref="test_case_name"
                           v-model="d_new_test_name"
                           :validators="[is_not_empty]">
          <template slot="suffix">
          <div class="name-form-buttons">
            <button type="submit" class="green-button" :disabled="d_saving || !d_name_form_valid">
              Save
            </button>
            <button type="button" class="white-button" :disabled="d_saving"
                    @click="d_editing_test_name = false">Cancel</button>
          </div>
          </template>
          </validated-input>
        </validated-form>
        <APIErrors ref="ag_test_case_api_errors"></APIErrors>
      </template>
    </div>

    <!------------------- Command Settings ---------------------------->
    <validated-form id="ag-test-command-settings-form"
                    autocomplete="off"
                    spellcheck="false"
                    @submit="save_ag_test_command_settings"
                    @form_validity_changed="d_settings_form_is_valid = $event">

      <div v-if="!case_has_exactly_one_command"
           class="form-field-wrapper">
        <label class="label"> Command Name </label>
        <validated-input ref="command_name"
                         id="input-name"
                         v-model="d_ag_test_command.name"
                         :validators="[is_not_empty]">
        </validated-input>
      </div>

      <div class="form-field-wrapper">
        <label class="label">
          Command
          <tooltip width="large" placement="top">
            Can be any valid bash command. <br>
            Note that if it includes sequencing or piping,
            you will have to increase the process limit.
          </tooltip>
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
        <div class="form-field-wrapper">
          <label class="label"> Stdin source </label>
          <br>
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

        <div v-if="d_ag_test_command.stdin_source === StdinSource.text"
             class="form-field-wrapper">
          <label class="label"> Stdin text </label>
          <validated-input ref="stdin_text"
                           placeholder="Enter the stdin input here."
                           :num_rows="5"
                           v-model="d_ag_test_command.stdin_text"
                           :validators="[]">
          </validated-input>
        </div>

        <div v-if="d_ag_test_command.stdin_source === StdinSource.instructor_file"
             class="form-field-wrapper">
          <label class="label"> File </label>
          <select-object ref="stdin_instructor_file"
                         :items="project.instructor_files"
                         v-model="d_ag_test_command.stdin_instructor_file"
                         id_field="pk">
            <option selected disabled :value="null">-- Select a File --</option>
            <template v-slot:option-text="{item}">
              {{item.name}}
            </template>
          </select-object>
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="legend"> Return Code </legend>
        <div class="form-field-wrapper">
          <label class="label"> Expected Return Code </label>
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
             class="form-field-wrapper correct-incorrect-points-wrapper">
          <div class="form-field-wrapper">
            <label class="label"> Correct return code </label>
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

          <div class="form-field-wrapper">
            <label class="label"> Wrong return code </label>
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
      </fieldset>

      <fieldset class="fieldset">
        <legend class="legend"> Stdout </legend>
        <div class="form-field-wrapper">
          <label class="label"> Check stdout against: </label>
          <br>
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

        <div v-if="d_ag_test_command.expected_stdout_source === ExpectedOutputSource.text"
              class="form-field-wrapper">
          <label class="label"> Expected stdout text: </label>
          <validated-input ref="expected_stdout_text"
                           placeholder="Enter the expected stdout output here."
                           v-model="d_ag_test_command.expected_stdout_text"
                           :num_rows="5"
                           :validators="[]">
          </validated-input>
        </div>

        <div v-if="d_ag_test_command.expected_stdout_source
                   === ExpectedOutputSource.instructor_file"
             class="form-field-wrapper">
          <label class="label"> File </label>
          <select-object ref="expected_stdout_instructor_file"
                        :items="project.instructor_files"
                        v-model="d_ag_test_command.expected_stdout_instructor_file"
                        id_field="pk">
            <option selected disabled :value="null">-- Select a File --</option>
            <template v-slot:option-text="{item}">
              {{item.name}}
            </template>
          </select-object>
        </div>

        <div v-if="d_ag_test_command.expected_stdout_source !== ExpectedOutputSource.none"
              class="form-field-wrapper correct-incorrect-points-wrapper">
          <div class="form-field-wrapper">
            <label class="label"> Correct stdout </label>
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

          <div class="form-field-wrapper">
            <label class="label"> Wrong stdout</label>
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
      </fieldset>

      <fieldset class="fieldset">
        <legend class="legend"> Stderr </legend>
        <div class="form-field-wrapper">
          <label class="label"> Check stderr against: </label>
          <br>
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

        <div v-if="d_ag_test_command.expected_stderr_source === ExpectedOutputSource.text"
             class="form-field-wrapper">
          <label class="label"> Expected stderr text </label>
          <validated-input ref="expected_stderr_text"
                           placeholder="Enter the expected stderr output here."
                           v-model="d_ag_test_command.expected_stderr_text"
                           :num_rows="5"
                           :validators="[]">
          </validated-input>
        </div>

        <div v-if="d_ag_test_command.expected_stderr_source
                   === ExpectedOutputSource.instructor_file"
             class="form-field-wrapper">
          <label class="label"> File </label>
          <select-object ref="expected_stderr_instructor_file"
                        :items="project.instructor_files"
                        v-model="d_ag_test_command.expected_stderr_instructor_file"
                        id_field="pk">
            <option selected disabled :value="null">-- Select a File --</option>
            <template v-slot:option-text="{item}">
              {{item.name}}
            </template>
          </select-object>
        </div>

        <div v-if="d_ag_test_command.expected_stderr_source
                    !== ExpectedOutputSource.none"
              class="form-field-wrapper correct-incorrect-points-wrapper">
          <div class="form-field-wrapper">
            <label class="label"> Correct stderr </label>
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

          <div class="form-field-wrapper">
            <label class="label">  Wrong stderr </label>
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
      </fieldset>

      <fieldset v-if="d_ag_test_command.expected_stdout_source !== ExpectedOutputSource.none
                      || d_ag_test_command.expected_stderr_source !== ExpectedOutputSource.none"
                class="fieldset"
                ref="diff_options">
        <legend class="legend"> Diff Options </legend>
        <div class="checkbox-input-container">
          <label class="checkbox-label">
            <input id="ignore-case"
                   type="checkbox"
                   class="checkbox"
                   v-model="d_ag_test_command.ignore_case">
            Ignore case
          </label>
        </div>

        <div class="checkbox-input-container">
          <label class="checkbox-label">
            <input id="ignore-whitespace"
                   type="checkbox"
                   class="checkbox"
                   v-model="d_ag_test_command.ignore_whitespace">
            Ignore whitespace
          </label>
        </div>

        <div class="checkbox-input-container">
          <label class="checkbox-label">
            <input id="ignore-whitespace-changes"
                   type="checkbox"
                   class="checkbox"
                   v-model="d_ag_test_command.ignore_whitespace_changes">
            Ignore whitespace changes
          </label>
        </div>

        <div class="checkbox-input-container">
          <label class="checkbox-label">
            <input id="ignore-blank-lines"
                   type="checkbox"
                   class="checkbox"
                   v-model="d_ag_test_command.ignore_blank_lines">
            Ignore blank lines
          </label>
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="legend"> Resource Limits </legend>
        <resource-limit-settings
          :resource_limits="d_ag_test_command"
          @field_change="Object.assign(d_ag_test_command, $event)"></resource-limit-settings>
      </fieldset>

      <!------------------------ Feedback ------------------------------------->
      <fieldset class="fieldset">
        <legend class="legend"> Feedback </legend>
        <feedback-config-panel ref="normal_config_panel"
                               v-model="d_ag_test_command.normal_fdbk_config"
                               :preset_options="fdbk_presets">
          <template slot="header">
            {{FeedbackConfigLabel.normal}}
            <tooltip width="large" placement="top">
              {{FeedbackDescriptions.normal}}
            </tooltip>
          </template>
          <template slot="settings">
            <AGTestCommandAdvancedFdbkSettings
              ref="normal_edit_feedback_settings"
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
            {{FeedbackConfigLabel.first_failure}}
            <tooltip width="large" placement="top">
              {{FeedbackDescriptions.first_failure}}
            </tooltip>
          </template>
          <template slot="settings">
            <div id="first-failure-checkbox-wrapper" class="checkbox-input-container">
              <label>
                <input id="first-failure-config-enabled"
                       type="checkbox"
                       @change="toggle_first_failure_feedback"
                       class="checkbox"
                       :checked="d_ag_test_command.first_failed_test_normal_fdbk_config !== null">
                Enabled
              </label>
            </div>
            <AGTestCommandAdvancedFdbkSettings
              ref="first_failure_edit_feedback_settings"
              id="first-failure-settings"
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
              <tooltip width="large" placement="top">
                {{FeedbackDescriptions.ultimate_submission}}
              </tooltip>
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
              <tooltip width="large" placement="top">
                {{FeedbackDescriptions.past_limit}}
              </tooltip>
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
              <tooltip width="large" placement="top">
                {{FeedbackDescriptions.staff_viewer}}
              </tooltip>
            </div>
          </template>
          <template slot="settings">
            <AGTestCommandAdvancedFdbkSettings
              ref="student_lookup_edit_feedback_settings"
              v-model="d_ag_test_command.staff_viewer_fdbk_config"
              :ag_test_case="ag_test_case"
              :config_name="FeedbackConfigLabel.staff_viewer">
            </AGTestCommandAdvancedFdbkSettings>
          </template>
        </feedback-config-panel>
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

        <div v-if="!d_saving" class="last-saved-timestamp">
          Last Saved: {{format_datetime(d_ag_test_command.last_modified)}}
        </div>
        <div v-else class="last-saved-spinner">
          <i class="fa fa-spinner fa-pulse"></i>
        </div>
      </div>

    </validated-form>

    <!--------------------------- Danger Zone --------------------------------------->

    <div class="danger-zone-container">
      <div class="danger-text">
        {{case_has_exactly_one_command ? 'Delete Test Case' : 'Delete Command'}}:
        <span>
          {{case_has_exactly_one_command ? ag_test_case.name : d_ag_test_command.name}}
        </span>
      </div>
      <button class="delete-ag-test-command-button delete-button"
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

        <div class="modal-body">
          Are you sure you want to delete the
          {{case_has_exactly_one_command ? 'test case' : 'command'}}:
          <span class="item-to-delete">
            "{{case_has_exactly_one_command ? ag_test_case.name : d_ag_test_command.name}}"
          </span>? <br><br>
          This will delete all associated run results. <br>
          THIS ACTION CANNOT BE UNDONE.

          <APIErrors ref="delete_errors"></APIErrors>
          <div class="modal-button-footer">
            <button class="modal-delete-button delete-button"
                    :disabled="d_deleting"
                    @click="delete_ag_test_command()"> Delete </button>

            <button class="modal-cancel-button white-button"
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
import {
  AGTestCommandFeedbackPreset,
  FeedbackConfigLabel,
  FeedbackDescriptions,
  hyphenate
} from '@/components/project_admin/feedback_config_panel/feedback_config_utils';
import ResourceLimitSettings from '@/components/project_admin/resource_limit_settings.vue';
import SelectObject from '@/components/select_object.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import {
  handle_api_errors_async,
  handle_global_errors_async,
  make_error_handler_func
} from '@/error_handling';
import { SafeMap } from '@/safe_map';
import { deep_copy, format_datetime, toggle } from '@/utils';
import {
  is_integer,
  is_not_empty,
  make_max_value_validator,
  make_min_value_validator,
  string_to_num,
} from '@/validators';

import FeedbackConfigPanel from '../feedback_config_panel/feedback_config_panel.vue';

@Component({
  components: {
    APIErrors,
    FeedbackConfigPanel,
    Dropdown,
    AGTestCommandAdvancedFdbkSettings,
    Modal,
    ResourceLimitSettings,
    SelectObject,
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

  d_editing_test_name = false;
  d_new_test_name = '';
  d_name_form_valid = false;

  d_saving = false;
  d_num_api_errors = 0;
  d_settings_form_is_valid = true;
  d_deleting = false;
  d_show_delete_ag_test_command_modal = false;

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

  async created() {
    this.d_ag_test_command = deep_copy(this.ag_test_command, AGTestCommand);
  }

  get case_has_exactly_one_command() {
    return this.ag_test_case.ag_test_commands.length === 1;
  }

  @handle_api_errors_async(handle_save_ag_test_case_error)
  save_ag_test_case() {
    let to_save = new AGTestCase(this.ag_test_case);
    to_save.name = this.d_new_test_name;
    return toggle(this, 'd_saving', async () => {
      await to_save.save();
      this.d_editing_test_name = false;
    });
  }

  @handle_api_errors_async(make_error_handler_func('delete_errors'))
  delete_ag_test_command() {
    return toggle(this, 'd_deleting', async () => {
      if (this.case_has_exactly_one_command) {
        await this.ag_test_case!.delete();
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
    if (this.d_ag_test_command!.first_failed_test_normal_fdbk_config === null) {
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

function handle_save_ag_test_case_error(component: AGTestCommandSettings, error: unknown) {
  let api_errors_elt = <APIErrors> component.$refs.ag_test_case_api_errors;
  api_errors_elt.show_errors_from_response(error);
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
@import '@/styles/forms.scss';
@import '@/styles/modal.scss';

@import './ag_tests.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.test-name-wrapper {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: .875rem;

  .test-name, .fa-pencil-alt {
    font-size: 1.25rem;
  }

  .test-name {
    font-weight: bold;
    margin-right: .375rem;
  }

  .fa-pencil-alt {
    color: darken($stormy-gray-dark, 10%);

    &:hover {
      color: $stormy-gray-dark;
      cursor: pointer;
    }
  }

  .name-form-buttons {
    display: flex;
    align-items: center;

    .button {
      margin-left: .375rem;
      padding: .375rem .625rem;
    }
  }
}

.correct-incorrect-points-wrapper {
  display: flex;
  flex-wrap: wrap;
}

.unit-of-measurement {
  padding-left: .625rem;
  font-size: .875rem;
}

#first-failure-checkbox-wrapper {
  margin: .25rem 0;
}

#first-failure-settings {
  padding-top: .375rem;
}

.sticky-save-button {
  @extend .green-button;
  position: fixed;
  bottom: $footer-height;
  right: 0;

  font-size: 1.25rem;
  padding: .375rem .625rem;
  margin: 0!important;

  color: white;

  border-radius: 1px;
}

.danger-zone-container {
  // We want to have ample space between the delete button and the
  // sticky save button
  max-width: 75%;
}

</style>
