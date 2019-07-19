<template>
  <div class="feedback-config-container">
    <div class="inner">
      <div class="config-panels-container">

        <config-panel ref="normal"
                      :config_name="FeedbackConfigLabel.normal"
                      v-model="d_mutation_test_suite.normal_fdbk_config"
                      @apply_preset="apply_preset($event,
                                                  d_mutation_test_suite.normal_fdbk_config)"
                      :get_preset_fn="get_current_preset_fn"
                      :preset_options="fdbk_presets">
          <template slot="settings">
            <EditFeedbackSettingsMutationSuite
              :config_name="FeedbackConfigLabel.normal"
              v-model="d_mutation_test_suite.normal_fdbk_config">
            </EditFeedbackSettingsMutationSuite>
          </template>
        </config-panel>

        <config-panel ref="final_graded"
                      :config_name="FeedbackConfigLabel.ultimate_submission"
                      v-model="d_mutation_test_suite.ultimate_submission_fdbk_config"
                      @apply_preset="apply_preset(
                        $event,
                        d_mutation_test_suite.ultimate_submission_fdbk_config
                      )"
                      :get_preset_fn="get_current_preset_fn"
                      :preset_options="fdbk_presets">
          <template slot="settings">
            <EditFeedbackSettingsMutationSuite
              :config_name="FeedbackConfigLabel.ultimate_submission"
              v-model="d_mutation_test_suite.ultimate_submission_fdbk_config">
            </EditFeedbackSettingsMutationSuite>
          </template>
        </config-panel>

        <config-panel ref="past_limit"
                      :config_name="FeedbackConfigLabel.past_limit"
                      v-model="d_mutation_test_suite.past_limit_submission_fdbk_config"
                      @apply_preset="apply_preset(
                        $event,
                        d_mutation_test_suite.past_limit_submission_fdbk_config
                      )"
                      :get_preset_fn="get_current_preset_fn"
                      :preset_options="fdbk_presets">
          <template slot="settings">
            <EditFeedbackSettingsMutationSuite
              :config_name="FeedbackConfigLabel.past_limit"
              v-model="d_mutation_test_suite.past_limit_submission_fdbk_config">
            </EditFeedbackSettingsMutationSuite>
          </template>
        </config-panel>

        <config-panel ref="student_lookup"
                      :config_name="FeedbackConfigLabel.staff_viewer"
                      v-model="d_mutation_test_suite.staff_viewer_fdbk_config"
                      @apply_preset="apply_preset($event,
                                                  d_mutation_test_suite.staff_viewer_fdbk_config)"
                      :get_preset_fn="get_current_preset_fn"
                      :preset_options="fdbk_presets">
          <template slot="settings">
            <EditFeedbackSettingsMutationSuite
              :config_name="FeedbackConfigLabel.staff_viewer"
              v-model="d_mutation_test_suite.staff_viewer_fdbk_config">
            </EditFeedbackSettingsMutationSuite>
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
  BugsExposedFeedbackLevel,
  MutationTestSuite,
  MutationTestSuiteFeedbackConfig
} from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import ConfigPanel from '@/components/feedback_config/config_panel/config_panel.vue';
import EditFeedbackSettingsMutationSuite from '@/components/feedback_config/edit_feedback_settings/edit_feedback_settings_mutation_suite.vue';
import {
  FeedbackConfigLabel,
  MutationTestSuiteFeedbackPreset,
} from '@/components/feedback_config/feedback_config/feedback_config_utils.ts';
import { SafeMap } from '@/safe_map';
import { handle_api_errors_async, safe_assign } from '@/utils';

@Component({
  components: {
    APIErrors,
    ConfigPanel,
    EditFeedbackSettingsMutationSuite
  }
})
export default class FeedbackConfigMutationSuite extends Vue {
  @Prop({required: true, type: MutationTestSuite})
  mutation_test_suite!: MutationTestSuite;

  FeedbackConfigLabel = FeedbackConfigLabel;

  d_mutation_test_suite: MutationTestSuite | null = null;
  d_saving = false;
  fdbk_presets = new SafeMap<string, MutationTestSuiteFeedbackPreset>([
    [
      'Public',
      {
        show_setup_return_code: true,
        show_setup_stdout: true,
        show_setup_stderr: true,
        show_get_test_names_return_code: true,
        show_get_test_names_stdout: true,
        show_get_test_names_stderr: true,
        show_validity_check_stdout: true,
        show_validity_check_stderr: true,
        show_grade_buggy_impls_stdout: true,
        show_grade_buggy_impls_stderr: true,
        show_invalid_test_names: true,
        show_points: true,
        bugs_exposed_fdbk_level: BugsExposedFeedbackLevel.exposed_bug_names
      }
    ],
    [
      'Num Bugs + Prep Output',
      {
        show_setup_return_code: true,
        show_setup_stdout: true,
        show_setup_stderr: true,
        show_get_test_names_return_code: true,
        show_get_test_names_stdout: true,
        show_get_test_names_stderr: true,
        show_validity_check_stdout: true,
        show_validity_check_stderr: true,
        show_grade_buggy_impls_stdout: false,
        show_grade_buggy_impls_stderr: false,
        show_invalid_test_names: true,
        show_points: true,
        bugs_exposed_fdbk_level: BugsExposedFeedbackLevel.num_bugs_exposed
      }
    ],
    [
      'Num Bugs Exposed',
      {
        show_setup_return_code: true,
        show_setup_stdout: false,
        show_setup_stderr: false,
        show_get_test_names_return_code: true,
        show_get_test_names_stdout: false,
        show_get_test_names_stderr: false,
        show_validity_check_stdout: false,
        show_validity_check_stderr: false,
        show_grade_buggy_impls_stdout: false,
        show_grade_buggy_impls_stderr: false,
        show_invalid_test_names: true,
        show_points: true,
        bugs_exposed_fdbk_level: BugsExposedFeedbackLevel.num_bugs_exposed
      }
    ],
    [
      'False Positives',
      {
        show_setup_return_code: true,
        show_setup_stdout: false,
        show_setup_stderr: false,
        show_get_test_names_return_code: true,
        show_get_test_names_stdout: false,
        show_get_test_names_stderr: false,
        show_validity_check_stdout: false,
        show_validity_check_stderr: false,
        show_grade_buggy_impls_stdout: false,
        show_grade_buggy_impls_stderr: false,
        show_invalid_test_names: true,
        show_points: true,
        bugs_exposed_fdbk_level: BugsExposedFeedbackLevel.no_feedback
      }
    ],
    [
      'Private',
      {
        show_setup_return_code: false,
        show_setup_stdout: false,
        show_setup_stderr: false,
        show_get_test_names_return_code: false,
        show_get_test_names_stdout: false,
        show_get_test_names_stderr: false,
        show_validity_check_stdout: false,
        show_validity_check_stderr: false,
        show_grade_buggy_impls_stdout: false,
        show_grade_buggy_impls_stderr: false,
        show_invalid_test_names: false,
        show_points: false,
        bugs_exposed_fdbk_level: BugsExposedFeedbackLevel.no_feedback
      }
    ]
  ]);

  created() {
    this.d_mutation_test_suite = this.mutation_test_suite;
  }

  @handle_api_errors_async(handle_save_mutation_suite_feedback_config_settings)
  async save_feedback_config_settings() {
    try {
      this.d_saving = true;
      await this.d_mutation_test_suite!.save();
    }
    finally {
      this.d_saving = false;
    }
  }

  get_current_preset_fn(current_config: MutationTestSuiteFeedbackConfig | null,
                        preset_options: SafeMap<string, MutationTestSuiteFeedbackPreset>) {
    if (current_config !== null) {
      for (let [preset_label, potential_match] of preset_options) {
        if ((potential_match.show_setup_return_code ===
             current_config.show_setup_return_code) &&
            (potential_match.show_setup_stdout ===
             current_config.show_setup_stdout) &&
            (potential_match.show_setup_stderr ===
             current_config.show_setup_stderr) &&
            (potential_match.show_invalid_test_names ===
             current_config.show_invalid_test_names) &&
            (potential_match.show_points ===
             current_config.show_points) &&
            (potential_match.bugs_exposed_fdbk_level ===
             current_config.bugs_exposed_fdbk_level) &&
            (potential_match.show_get_test_names_return_code ===
             current_config.show_get_test_names_return_code) &&
            (potential_match.show_get_test_names_stdout ===
             current_config.show_get_test_names_stdout) &&
            (potential_match.show_get_test_names_stderr ===
             current_config.show_get_test_names_stderr) &&
            (potential_match.show_validity_check_stdout ===
             current_config.show_validity_check_stdout) &&
            (potential_match.show_validity_check_stderr ===
             current_config.show_validity_check_stderr) &&
            (potential_match.show_grade_buggy_impls_stdout ===
             current_config.show_grade_buggy_impls_stdout) &&
            (potential_match.show_grade_buggy_impls_stderr ===
             current_config.show_grade_buggy_impls_stderr)) {
          return preset_label;
        }
      }
    }
    return "Custom";
  }
  apply_preset(preset_selected: string,
               config_being_viewed: MutationTestSuiteFeedbackConfig) {
    if (preset_selected !== 'Custom') {
      let preset = this.fdbk_presets.get(preset_selected);
      safe_assign(config_being_viewed, preset);
    }
  }
}

function handle_save_mutation_suite_feedback_config_settings(
  component: FeedbackConfigMutationSuite,
  error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/components/feedback_config.scss';
</style>
