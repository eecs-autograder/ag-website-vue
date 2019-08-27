<template>
  <div>
    <div class="panel">
      <div :class="['panel-header', {'panel-header-open': is_open}]"
           @click="toggle_is_open">
        <span id="ag-test-case-name">{{ag_test_case_result_feedback.ag_test_case_name}}</span>

        <span id="points">
          {{ag_test_case_result_feedback.total_points}}/{{ag_test_case_result_feedback.total_points_possible}}
        </span>
      </div>

      <div class="panel-body"
           v-if="is_open">
        <div v-for="(ag_test_command_result, index) of ag_test_case_result_feedback.ag_test_command_results">
          <AGTestCommandResultPanel :submission="submission"
                                    :ag_test_command_result_feedback="ag_test_command_result"
                                    :fdbk_category="fdbk_category">
          </AGTestCommandResultPanel>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
    AGTestCaseResultFeedback,
    Submission
} from "ag-client-typescript";

import AGTestCommandResultPanel from '@/components/project_view/submission_detail/ag_test_command_result_panel.vue';

@Component({
  components: {
    AGTestCommandResultPanel
  }
})
export default class AGTestCaseResultPanelMultipleCommands extends Vue {
  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_case_result_feedback!: AGTestCaseResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: string;

  is_open = false;

  toggle_is_open() {
    this.is_open = !this.is_open;
  }

  created() {}
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

#ag-test-case-name {
  color: black;
}

.panel {
  margin-bottom: 10px;
}

.panel-header {
  background-color: hotpink;
  padding: 5px;
  border-radius: 3px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: center;
  cursor: pointer;
}

.panel-header-open {
  border-radius: 3px 3px 0 0;
}

.panel-body {
  border: 1px solid hotpink;
  padding: 10px 10px 5px 10px;
  border-top: none;
  border-radius: 0 0 3px 3px;
}

</style>
