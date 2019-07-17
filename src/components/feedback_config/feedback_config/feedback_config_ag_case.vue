<template>
  <div class="feedback-config-container">
    <div class="config-panels-container">

      <AGCaseConfigPanel :ref="transform_to_snake_case(FeedbackConfigLabel.normal)"
                         :config_name="FeedbackConfigLabel.normal"
                         @input="update_config_settings(
                           $event,
                           d_ag_test_case.normal_fdbk_config
                         )"
                         v-model="d_ag_test_case.normal_fdbk_config">
      </AGCaseConfigPanel>

      <AGCaseConfigPanel :ref="transform_to_snake_case(FeedbackConfigLabel.ultimate_submission)"
                         :config_name="FeedbackConfigLabel.ultimate_submission"
                         @input="update_config_settings(
                           $event,
                           d_ag_test_case.ultimate_submission_fdbk_config
                         )"
                         v-model="d_ag_test_case.ultimate_submission_fdbk_config">
      </AGCaseConfigPanel>


      <AGCaseConfigPanel :ref="transform_to_snake_case(FeedbackConfigLabel.past_limit)"
                         :config_name="FeedbackConfigLabel.past_limit"
                         @input="update_config_settings(
                           $event,
                           d_ag_test_case.past_limit_submission_fdbk_config
                         )"
                         v-model="d_ag_test_case.past_limit_submission_fdbk_config">
      </AGCaseConfigPanel>

      <AGCaseConfigPanel :ref="transform_to_snake_case(FeedbackConfigLabel.staff_viewer)"
                         :config_name="FeedbackConfigLabel.staff_viewer"
                         @input="update_config_settings(
                           $event,
                           d_ag_test_case.staff_viewer_fdbk_config
                         )"
                         v-model="d_ag_test_case.staff_viewer_fdbk_config">
      </AGCaseConfigPanel>

      <div class="button-footer">
        <APIErrors ref="api_errors"> </APIErrors>

        <button class="save-feedback-config-settings"
                :disabled="d_saving"
                @click="save_feedback_config_settings()"> Save Settings
        </button>
      </div>
    </div>

  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';

import { AGTestCase, AGTestCaseFeedbackConfig } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import AGCaseConfigPanel from '@/components/feedback_config/config_panel/ag_case_config_panel.vue';
import ConfigPanel from '@/components/feedback_config/config_panel/config_panel.vue';
import { FeedbackConfigLabel, transform_to_snake_case } from '@/components/feedback_config/feedback_config/feedback_config_utils.ts';
import { handle_api_errors_async, safe_assign } from "@/utils";

@Component({
  components: {
    AGCaseConfigPanel,
    APIErrors,
    ConfigPanel
  }
})
export default class FeedbackConfigAGCase extends Vue {
  @Prop({required: true, type: AGTestCase})
  ag_test_case!: AGTestCase;

  d_ag_test_case: AGTestCase | null = null;
  d_saving = false;
  readonly FeedbackConfigLabel = FeedbackConfigLabel;
  transform_to_snake_case = transform_to_snake_case;

  created() {
    this.d_ag_test_case = this.ag_test_case;
  }

  update_config_settings(config: AGTestCaseFeedbackConfig,
                         config_to_apply_changes_to: AGTestCaseFeedbackConfig) {
    safe_assign(config_to_apply_changes_to, config);
  }

  @handle_api_errors_async(handle_save_ag_case_feedback_config_settings)
  async save_feedback_config_settings() {
    try {
      this.d_saving = true;
      await this.d_ag_test_case!.save();
    }
    finally {
      this.d_saving = false;
    }
  }
}

function handle_save_ag_case_feedback_config_settings(component: FeedbackConfigAGCase,
                                                      error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/components/feedback_config.scss';
</style>
