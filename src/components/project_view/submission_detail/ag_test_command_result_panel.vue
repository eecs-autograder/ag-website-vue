<template>
  <div>
    <div class="expected-and-actual-return-code"
         v-if="false">
      <div v-if="ag_test_command_result_feedback.actual_return_code !== null">
        Exit Status: {{ag_test_command_result_feedback.actual_return_code}}
      </div>
      <div v-if="ag_test_command_result_feedback.timed_out">
        The command timed out.
      </div>
      <div v-if="ag_test_command_result_feedback.expected_return_code !== null
                 && ag_test_command_result_feedback.expected_return_code !== ExpectedReturnCode.none">
        Expected exit status:
        {{ag_test_command_result_feedback.expected_return_code === ExpectedReturnCode.zero ? 0 : 'nonzero'}}
      </div>
    </div>

    <div class="panel">
      <div :class="['panel-header', {'panel-header-open': is_open}]"
           @click="toggle_is_open">
        <div id="ag-test-command-name">
          {{ag_test_command_result_feedback.ag_test_command_name}}
        </div>
      </div>

      <div class="panel-body" v-if="is_open">
        <AGTestCommandResult :submission="submission"
                             :ag_test_command_result_feedback="ag_test_command_result_feedback"
                             :fdbk_category="fdbk_category">
        </AGTestCommandResult>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
    AGTestCommandResultFeedback,
    FeedbackCategory,
    ResultOutput,
    Submission,
    ExpectedReturnCode,
    ValueFeedbackLevel
} from "ag-client-typescript";
import get_ag_test_cmd_result_stdout = ResultOutput.get_ag_test_cmd_result_stdout;
import get_ag_test_cmd_result_stderr = ResultOutput.get_ag_test_cmd_result_stderr;
import get_ag_test_cmd_result_stdout_diff = ResultOutput.get_ag_test_cmd_result_stdout_diff;
import get_ag_test_cmd_result_stderr_diff = ResultOutput.get_ag_test_cmd_result_stderr_diff;

import AGTestCommandResult from '@/components/project_view/submission_detail/ag_test_command_result.vue';

@Component({
  components: {
    AGTestCommandResult
  }
})
export default class AGTestCommandResultPanel extends Vue {
  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_command_result_feedback!: AGTestCommandResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: FeedbackCategory;

  is_open = false;

  readonly ExpectedReturnCode = ExpectedReturnCode;

  toggle_is_open() {
    this.is_open = !this.is_open;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

#ag-test-command-name {
  color: black;
}

.panel {
  margin-bottom: 5px;
}

.panel-header {
  background-color: $light-blue;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: center;
  padding: 5px;
}

.panel-header-open {
  border-radius: 3px 3px 0 0;
}

.panel-body {
  padding: 10px;
}

.feedback-label {
  font-weight: bold;

}

</style>
