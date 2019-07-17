<template>
  <div class="feedback-config-container">
    <div class="inner">
      <div class="config-panels-container">

        <config-panel :ref="FeedbackConfigLabel.normal"
                      :config_name="FeedbackConfigLabel.normal"
                      v-model="d_ag_test_command.normal_fdbk_config"
                      @apply_preset="apply_preset($event,
                                                  d_ag_test_command.normal_fdbk_config,
                                                  fdbk_presets)"
                      :get_preset_fn="get_current_preset_fn"
                      :preset_options="fdbk_presets">
          <template slot="settings">
            <EditFeedbackSettingsAGCommand v-model="d_ag_test_command.normal_fdbk_config"
                                           :config_name="FeedbackConfigLabel.normal"
                                           @input="update_config_settings(
                                             d_ag_test_command.normal_fdbk_config,
                                             d_ag_test_case.normal_fdbk_config,
                                             $event
                                           )">
            </EditFeedbackSettingsAGCommand>
          </template>
        </config-panel>

        <config-panel :ref="FeedbackConfigLabel.first_failure"
                      :config_name="FeedbackConfigLabel.first_failure"
                      v-model="d_ag_test_command.first_failed_test_normal_fdbk_config"
                      @apply_preset="apply_preset(
                        $event,
                        d_ag_test_command.first_failed_test_normal_fdbk_config,
                        fdbk_presets
                      )"
                      :get_preset_fn="get_current_preset_fn"
                      :preset_options="fdbk_presets">
          <template slot="settings">
            <div class="checkbox-input-container">
              <input id="first-failed-config-enabled"
                     type="checkbox"
                     @change="d_ag_test_command.first_failed_test_normal_fdbk_config
                              = first_failed_config_is_enabled ? default_config : null"
                     class="checkbox"
                     v-model="first_failed_config_is_enabled">
              <label for="first-failed-config-enabled"> Enabled </label>
            </div>
            <EditFeedbackSettingsAGCommand v-model="
                                           d_ag_test_command.first_failed_test_normal_fdbk_config"
                                           :config_name="FeedbackConfigLabel.first_failure"
                                           @input="update_config_settings(
                                           d_ag_test_command.first_failed_test_normal_fdbk_config,
                                           null,
                                           $event)">
            </EditFeedbackSettingsAGCommand>
          </template>
        </config-panel>

        <config-panel :ref="FeedbackConfigLabel.ultimate_submission"
                      :config_name="FeedbackConfigLabel.ultimate_submission"
                      v-model="d_ag_test_command.ultimate_submission_fdbk_config"
                      @apply_preset="apply_preset(
                        $event,
                        d_ag_test_command.ultimate_submission_fdbk_config,
                        fdbk_presets
                      )"
                      :get_preset_fn="get_current_preset_fn"
                      :preset_options="fdbk_presets">
          <template slot="settings">
            <EditFeedbackSettingsAGCommand v-model="
                                             d_ag_test_command.ultimate_submission_fdbk_config"
                                           :config_name="FeedbackConfigLabel.ultimate_submission"
                                           @input="update_config_settings(
                                             d_ag_test_command.ultimate_submission_fdbk_config,
                                             d_ag_test_case.ultimate_submission_fdbk_config,
                                             $event
                                           )">
            </EditFeedbackSettingsAGCommand>
          </template>
        </config-panel>

        <config-panel :ref="FeedbackConfigLabel.past_limit"
                      :config_name="FeedbackConfigLabel.past_limit"
                      v-model="d_ag_test_command.past_limit_submission_fdbk_config"
                      @apply_preset="apply_preset(
                        $event,
                        d_ag_test_command.past_limit_submission_fdbk_config,
                        fdbk_presets
                      )"
                      :get_preset_fn="get_current_preset_fn"
                      :preset_options="fdbk_presets">
          <template slot="settings">
            <EditFeedbackSettingsAGCommand v-model="
                                             d_ag_test_command.past_limit_submission_fdbk_config"
                                           :config_name="FeedbackConfigLabel.past_limit"
                                           @input="update_config_settings(
                                             d_ag_test_command.past_limit_submission_fdbk_config,
                                             d_ag_test_case.past_limit_submission_fdbk_config,
                                             $event
                                           )">
            </EditFeedbackSettingsAGCommand>
          </template>
        </config-panel>

        <config-panel :ref="FeedbackConfigLabel.staff_viewer"
                      :config_name="FeedbackConfigLabel.staff_viewer"
                      v-model="d_ag_test_command.staff_viewer_fdbk_config"
                      @apply_preset="apply_preset($event,
                                                  d_ag_test_command.staff_viewer_fdbk_config,
                                                  fdbk_presets)"
                      :get_preset_fn="get_current_preset_fn"
                      :preset_options="fdbk_presets">
          <template slot="settings">
            <EditFeedbackSettingsAGCommand v-model="d_ag_test_command.staff_viewer_fdbk_config"
                                           :config_name="FeedbackConfigLabel.staff_viewer"
                                           @input="update_config_settings(
                                             d_ag_test_command.staff_viewer_fdbk_config,
                                             d_ag_test_case.staff_viewer_fdbk_config,
                                             $event
                                           )">
            </EditFeedbackSettingsAGCommand>
          </template>
        </config-panel>
      </div>

    </div>

    <div class="button-footer">
      <APIErrors ref="api_errors"> </APIErrors>

      <button class="save-feedback-config-settings"
              :disabled="d_saving"
              @click="save_feedback_config_settings()"> Save Settings
      </button>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
  AGTestCase, AGTestCaseFeedbackConfig,
  AGTestCommand,
  AGTestCommandFeedbackConfig,
  ValueFeedbackLevel
} from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import ConfigPanel from '@/components/feedback_config/config_panel/config_panel.vue';
import EditFeedbackSettingsAGCommand from '@/components/feedback_config/edit_feedback_settings/edit_feedback_settings_ag_command.vue';
import { FeedbackConfigLabel, hyphenated_config_name } from '@/components/feedback_config/feedback_config/feedback_config_utils.ts';
import { SafeMap } from '@/safe_map';
import { handle_api_errors_async, safe_assign } from '@/utils';

interface AGTestCommandFeedbackPreset {
  return_code_fdbk_level: ValueFeedbackLevel;
  stdout_fdbk_level: ValueFeedbackLevel;
  stderr_fdbk_level: ValueFeedbackLevel;
  show_points: boolean;
  show_actual_return_code: boolean;
  show_actual_stdout: boolean;
  show_actual_stderr: boolean;
  show_whether_timed_out: boolean;
}
@Component({
  components: {
    APIErrors,
    EditFeedbackSettingsAGCommand,
    ConfigPanel
  }
})
export default class FeedbackConfigAGCommand extends Vue {
  @Prop({required: true, type: AGTestCommand})
  ag_test_command!: AGTestCommand;

  @Prop({required: true, type: AGTestCase})
  ag_test_case!: AGTestCase;

  safe_assign = safe_assign;
  readonly FeedbackConfigLabel = FeedbackConfigLabel;
  hyphenated_config_name = hyphenated_config_name;


  d_ag_test_case: AGTestCase | null = null;
  d_ag_test_command: AGTestCommand | null = null;
  default_config: AGTestCommandFeedbackConfig = {
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
  d_saving = false;
  fdbk_presets = new SafeMap<string, AGTestCommandFeedbackPreset>([
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
  first_failed_config_is_enabled = false;

  update_config_settings(command_config_to_apply_changes_to: AGTestCommandFeedbackConfig,
                         case_config_to_apply_changes_to: AGTestCaseFeedbackConfig | null,
                         config: AGTestCommandFeedbackConfig) {
    safe_assign(command_config_to_apply_changes_to, config);
    if (this.d_ag_test_case!.ag_test_commands.length === 1
        && case_config_to_apply_changes_to !== null) {
      case_config_to_apply_changes_to.show_individual_commands =
        command_config_to_apply_changes_to.visible;
    }
  }

  created() {
    this.d_ag_test_case = this.ag_test_case;
    this.d_ag_test_command = this.ag_test_command;
    this.first_failed_config_is_enabled =
      this.d_ag_test_command!.first_failed_test_normal_fdbk_config !== null;
  }

  @handle_api_errors_async(handle_save_ag_command_feedback_config_settings)
  async save_feedback_config_settings() {
    try {
      this.d_saving = true;
      await this.d_ag_test_command!.save();
    }
    finally {
      this.d_saving = false;
    }
  }

  apply_preset(preset_selected: string,
               config_to_apply_changes_to: AGTestCommandFeedbackConfig,
               fdbk_presets: SafeMap<string, AGTestCommandFeedbackPreset>) {
    if (preset_selected !== "Custom") {
      let preset = fdbk_presets.get(preset_selected);
      safe_assign(config_to_apply_changes_to, preset);
    }
  }

  get_current_preset_fn(current_config: AGTestCommandFeedbackConfig | null,
                        preset_options: SafeMap<string, AGTestCommandFeedbackPreset>) {
    if (current_config !== null) {
      for (let [preset_label, potential_match] of preset_options) {
        if ((potential_match.return_code_fdbk_level ===
             current_config!.return_code_fdbk_level) &&
            (potential_match.stdout_fdbk_level ===
             current_config!.stdout_fdbk_level) &&
            (potential_match.stderr_fdbk_level ===
             current_config!.stderr_fdbk_level) &&
            (potential_match.show_points ===
             current_config!.show_points) &&
            (potential_match.show_actual_return_code ===
             current_config!.show_actual_return_code) &&
            (potential_match.show_actual_stdout ===
             current_config!.show_actual_stdout) &&
            (potential_match.show_actual_stderr ===
             current_config!.show_actual_stderr) &&
            (potential_match.show_whether_timed_out ===
             current_config!.show_whether_timed_out)) {
          return preset_label;
        }
      }
    }
    return "Custom";
  }
}

function handle_save_ag_command_feedback_config_settings(component: FeedbackConfigAGCommand,
                                                         error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/components/feedback_config.scss';
</style>
