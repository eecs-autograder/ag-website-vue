<template>
  <div>
    <div class="panel">
      <div class="panel-header"
           @click="toggle_is_open">
        <div id="ag-test-case-name">
          {{ag_test_suite_result_feedback.setup_name ? ag_test_suite_result_feedback.setup_name : 'Setup'}}
          <span> Correctness Icon </span>
        </div>
      </div>
      <div class="panel-body"
           v-if="d_is_open">

        <div id="exit-status-section">
          <div class="feedback-label"> Exit status: </div>
          {{ag_test_suite_result_feedback.setup_return_code}}
          <span v-if="ag_test_suite_result_feedback.setup_timed_out"> Timed out </span>
        </div>

        <div id="stdout-section"
             v-if="ag_test_suite_result_feedback.fdbk_settings.show_setup_stdout">
          <div class="feedback-label"> Output: </div>
          <div v-if="!d_setup_stdout_loaded">
            <i class="fa fa-spinner fa-pulse fa-fw"></i>
          </div>
          <div v-else>
            <div v-if="!setup_stdout"> No Output </div>
            <div v-else>{{setup_stdout}}</div>
          </div>
        </div>

        <div id="stderr-section"
             v-if="ag_test_suite_result_feedback.fdbk_settings.show_setup_stderr">
          <div class="feedback-label"> Error Output: </div>
          <div v-if="!d_setup_stderr_loaded">
            Loading Icon
          </div>
          <div v-else>
            <div v-if="!setup_stderr"> No Output </div>
            <div v-else>{{setup_stderr}}</div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
    AGTestSuiteResultFeedback,
    FeedbackCategory,
    ResultOutput,
    Submission
} from "ag-client-typescript";
import get_ag_test_suite_result_setup_stdout = ResultOutput.get_ag_test_suite_result_setup_stdout;
import get_ag_test_suite_result_setup_stderr = ResultOutput.get_ag_test_suite_result_setup_stderr;

@Component
export default class AGTestCaseSetupResultPanel extends Vue {

  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_suite_result_feedback!: AGTestSuiteResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: FeedbackCategory;

  setup_stdout: string = "";
  setup_stderr: string = "";
  d_setup_stdout_loaded = false;
  d_setup_stderr_loaded = false;
  d_is_open = false;

  toggle_is_open() {
    this.d_is_open = !this.d_is_open;
  }

  async created() {
    this.setup_stdout = await get_ag_test_suite_result_setup_stdout(
      this.submission.pk,
      this.ag_test_suite_result_feedback.pk,
      this.fdbk_category
    );
    this.d_setup_stdout_loaded = true;

    this.setup_stderr = await get_ag_test_suite_result_setup_stderr(
      this.submission.pk,
      this.ag_test_suite_result_feedback.pk,
      this.fdbk_category
    );
    this.d_setup_stderr_loaded = true;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

#ag-test-case-name {
  color: black;
}

.panel {
  background-color: darkorange;
  padding: 5px;
  border-radius: 3px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: center;
  margin-bottom: 5px;
  cursor: pointer;
}

</style>
