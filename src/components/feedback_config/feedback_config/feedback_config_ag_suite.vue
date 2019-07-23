<template>
  <div class="feedback-config-container">
    <div class="inner">
      <div class="config-panels-container">
        <config-panel ref="normal"
                      :config_name="FeedbackConfigLabel.normal"
                      v-model="d_ag_test_suite.normal_fdbk_config"
                      :get_preset_fn="get_current_preset_fn"
                      :preset_options="fdbk_presets">
          <template slot="settings">
            <EditFeedbackSettingsAGSuite ref="normal_edit_feedback_settings"
                                         v-model="d_ag_test_suite.normal_fdbk_config"
                                         :config_name="FeedbackConfigLabel.normal">
            </EditFeedbackSettingsAGSuite>
          </template>
        </config-panel>

        <config-panel ref="final_graded"
                      :config_name="FeedbackConfigLabel.ultimate_submission"
                      v-model="d_ag_test_suite.ultimate_submission_fdbk_config"
                      :get_preset_fn="get_current_preset_fn"
                      :preset_options="fdbk_presets">
          <template slot="settings">
            <EditFeedbackSettingsAGSuite ref="final_graded_edit_feedback_settings"
                                         v-model="d_ag_test_suite.ultimate_submission_fdbk_config"
                                         :config_name="FeedbackConfigLabel.ultimate_submission">
            </EditFeedbackSettingsAGSuite>
          </template>
        </config-panel>

        <config-panel
          ref="past_limit"
          :config_name="FeedbackConfigLabel.past_limit"
          v-model="d_ag_test_suite.past_limit_submission_fdbk_config"
          :get_preset_fn="get_current_preset_fn"
          :preset_options="fdbk_presets">
          <template slot="settings">
            <EditFeedbackSettingsAGSuite
              ref="past_limit_feedback_settings"
              v-model="d_ag_test_suite.past_limit_submission_fdbk_config"
              :config_name="FeedbackConfigLabel.past_limit">
            </EditFeedbackSettingsAGSuite>
          </template>
        </config-panel>

        <config-panel ref="student_lookup"
                      :config_name="FeedbackConfigLabel.staff_viewer"
                      v-model="d_ag_test_suite.staff_viewer_fdbk_config"
                      :get_preset_fn="get_current_preset_fn"
                      :preset_options="fdbk_presets">
          <template slot="settings">
            <EditFeedbackSettingsAGSuite ref="student_lookup_edit_feedback_settings"
                                         v-model="d_ag_test_suite.staff_viewer_fdbk_config"
                                         :config_name="FeedbackConfigLabel.staff_viewer">
            </EditFeedbackSettingsAGSuite>
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

import { AGTestSuite, AGTestSuiteFeedbackConfig } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import ConfigPanel from '@/components/feedback_config/config_panel/config_panel.vue';
import EditFeedbackSettingsAGSuite from '@/components/feedback_config/edit_feedback_settings/edit_feedback_settings_ag_suite.vue';
import {
  AGTestSuiteFeedbackPreset,
  FeedbackConfigLabel
} from '@/components/feedback_config/feedback_config/feedback_config_utils.ts';
import { SafeMap } from "@/safe_map";
import { handle_api_errors_async, safe_assign } from '@/utils';

@Component({
  components: {
    APIErrors,
    EditFeedbackSettingsAGSuite,
    ConfigPanel
  }
})
export default class FeedbackConfigAGSuite extends Vue {
  @Prop({required: true, type: AGTestSuite})
  ag_test_suite!: AGTestSuite;

  FeedbackConfigLabel = FeedbackConfigLabel;

  d_ag_test_suite: AGTestSuite | null = null;
  d_saving = false;
  fdbk_presets = new SafeMap<string, AGTestSuiteFeedbackPreset>([
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
  created() {
    this.d_ag_test_suite = this.ag_test_suite;
  }

  @handle_api_errors_async(handle_save_ag_suite_feedback_config_settings)
  async save_feedback_config_settings() {
    try {
      this.d_saving = true;
      await this.d_ag_test_suite!.save();
    }
    finally {
      this.d_saving = false;
    }
  }

  get_current_preset_fn(current_config: AGTestSuiteFeedbackConfig | null,
                        preset_options: SafeMap<string, AGTestSuiteFeedbackPreset>) {
    if (current_config !== null) {
      for (let [preset_label, potential_match] of preset_options) {
        if ((potential_match.show_individual_tests ===
             current_config.show_individual_tests) &&
            (potential_match.show_setup_return_code ===
             current_config.show_setup_return_code) &&
            (potential_match.show_setup_timed_out ===
             current_config.show_setup_timed_out) &&
            (potential_match.show_setup_stdout ===
             current_config.show_setup_stdout) &&
            (potential_match.show_setup_stderr ===
             current_config.show_setup_stderr)) {
          return preset_label;
        }
      }
    }
    return "Custom";
  }
}

function handle_save_ag_suite_feedback_config_settings(component: FeedbackConfigAGSuite,
                                                       error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/components/feedback_config.scss';
</style>
