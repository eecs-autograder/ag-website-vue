<template>
  <div class="feedback-config-container">
    <div class="inner">
      <div class="config-panels-container">

        <config-panel ref="normal"
                      :config_name="FeedbackConfigLabel.normal"
                      v-model="d_ag_test_command.normal_fdbk_config"
                      :get_preset_fn="get_current_preset_fn"
                      :preset_options="fdbk_presets">
          <template slot="settings">
            <EditFeedbackSettingsAGCommand ref="normal_edit_feedback_settings"
                                           v-model="d_ag_test_command.normal_fdbk_config"
                                           :ag_test_case="ag_test_case"
                                           :config_name="FeedbackConfigLabel.normal">
            </EditFeedbackSettingsAGCommand>
          </template>
        </config-panel>

        <config-panel ref="first_failure"
                      :config_name="FeedbackConfigLabel.first_failure"
                      v-model="d_ag_test_command.first_failed_test_normal_fdbk_config"
                      :get_preset_fn="get_current_preset_fn"
                      :preset_options="fdbk_presets">
          <template slot="settings">
            <div class="checkbox-input-container">
              <input :id="`${hyphenate(FeedbackConfigLabel.first_failure)}-config-enabled`"
                     type="checkbox"
                     @change="d_ag_test_command.first_failed_test_normal_fdbk_config
                              = first_failed_config_is_enabled ? fdbk_presets.get('Public') : null"
                     class="checkbox"
                     v-model="first_failed_config_is_enabled">
              <label :for="`${hyphenate(FeedbackConfigLabel.first_failure)}-config-enabled`">
                Enabled
              </label>
            </div>
            <EditFeedbackSettingsAGCommand
              ref="first_failure_edit_feedback_settings"
              v-model="d_ag_test_command.first_failed_test_normal_fdbk_config"
              :ag_test_case="ag_test_case"
              :config_name="FeedbackConfigLabel.first_failure">
            </EditFeedbackSettingsAGCommand>
          </template>
        </config-panel>

        <config-panel
          ref="final_graded"
          :config_name="FeedbackConfigLabel.ultimate_submission"
          v-model="d_ag_test_command.ultimate_submission_fdbk_config"
          :get_preset_fn="get_current_preset_fn"
          :preset_options="fdbk_presets">
          <template slot="settings">
            <EditFeedbackSettingsAGCommand
              ref="final_graded_edit_feedback_settings"
              v-model="d_ag_test_command.ultimate_submission_fdbk_config"
              :ag_test_case="ag_test_case"
              :config_name="FeedbackConfigLabel.ultimate_submission">
            </EditFeedbackSettingsAGCommand>
          </template>
        </config-panel>

        <config-panel ref="past_limit"
                      :config_name="FeedbackConfigLabel.past_limit"
                      v-model="d_ag_test_command.past_limit_submission_fdbk_config"
                      :get_preset_fn="get_current_preset_fn"
                      :preset_options="fdbk_presets">
          <template slot="settings">
            <EditFeedbackSettingsAGCommand
              ref="past_limit_edit_feedback_settings"
              v-model="d_ag_test_command.past_limit_submission_fdbk_config"
              :ag_test_case="ag_test_case"
              :config_name="FeedbackConfigLabel.past_limit">
            </EditFeedbackSettingsAGCommand>
          </template>
        </config-panel>

        <config-panel
          ref="student_lookup"
          :config_name="FeedbackConfigLabel.staff_viewer"
          v-model="d_ag_test_command.staff_viewer_fdbk_config"
          :get_preset_fn="get_current_preset_fn"
          :preset_options="fdbk_presets">
          <template slot="settings">
            <EditFeedbackSettingsAGCommand ref="student_lookup_edit_feedback_settings"
                                           v-model="d_ag_test_command.staff_viewer_fdbk_config"
                                           :ag_test_case="ag_test_case"
                                           :config_name="FeedbackConfigLabel.staff_viewer">
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
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  AGTestCase,
  AGTestCommand,
  AGTestCommandFeedbackConfig,
  ValueFeedbackLevel
} from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import ConfigPanel from '@/components/feedback_config/config_panel/config_panel.vue';
import EditFeedbackSettingsAGCommand from '@/components/feedback_config/edit_feedback_settings/edit_feedback_settings_ag_command.vue';
import {
  AGTestCommandFeedbackPreset,
  FeedbackConfigLabel,
  hyphenate
} from '@/components/feedback_config/feedback_config/feedback_config_utils.ts';
import { SafeMap } from '@/safe_map';
import { deep_copy, handle_api_errors_async, safe_assign } from '@/utils';

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
  hyphenate = hyphenate;

  d_ag_test_command: AGTestCommand | null = null;
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

  @Watch('ag_test_command')
  on_ag_test_command_change(new_value: AGTestCommand, old_value: AGTestCommand) {
    this.d_ag_test_command = deep_copy(new_value, AGTestCommand);
  }

  created() {
    this.d_ag_test_command = deep_copy(this.ag_test_command, AGTestCommand);
    this.first_failed_config_is_enabled =
      this.d_ag_test_command!.first_failed_test_normal_fdbk_config !== null;
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
}

function handle_save_ag_command_feedback_config_settings(component: FeedbackConfigAGCommand,
                                                         error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/components/feedback_config.scss';
</style>
