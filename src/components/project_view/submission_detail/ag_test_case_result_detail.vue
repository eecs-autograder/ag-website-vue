<template>
  <div v-if="ag_test_case_result.ag_test_command_results.length"
       class="ag-case-result">
    <description-renderer
      v-if="d_globals.user_roles.is_staff
            && d_staff_description !== null && d_staff_description !== ''"
      :text="d_staff_description"
      ref="staff_description"
    ></description-renderer>

    <description-renderer
      v-if="ag_test_case_result.student_description !== null
            && ag_test_case_result.student_description !== ''"
      :text="ag_test_case_result.student_description"
      ref="student_description"
    ></description-renderer>

    <template v-if="ag_test_case_result.ag_test_command_results.length > 1">
      <div v-for="ag_test_command_result of ag_test_case_result.ag_test_command_results">
        <result-panel
          ref="ag_test_command_panel"
          :key="ag_test_command_result.pk"
          :name="ag_test_command_result.ag_test_command_name"
          :correctness_level="command_result_correctness(ag_test_command_result)"
          :is_command="true">
          <AGTestCommandResultDetail
            :submission="submission"
            :ag_test_command_result="ag_test_command_result"
            :fdbk_category="fdbk_category"/>
        </result-panel>
      </div>
    </template>
    <template v-else>
      <AGTestCommandResultDetail
        ref="ag_command_result"
        :submission="submission"
        :ag_test_command_result="ag_test_case_result.ag_test_command_results[0]"
        :fdbk_category="fdbk_category"/>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';

import {
  AGTestCase,
  AGTestCaseResultFeedback,
  AGTestCommandResultFeedback,
  FeedbackCategory,
  Submission
} from "ag-client-typescript";

import { GlobalData } from '@/app.vue';
import AGTestCommandResultDetail from '@/components/project_view/submission_detail/ag_test_command_result_detail.vue';
import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness';
import CorrectnessIcon from '@/components/project_view/submission_detail/correctness_icon.vue';
import DescriptionRenderer from "@/components/project_view/submission_detail/description_renderer.vue";
import ResultPanel from "@/components/project_view/submission_detail/result_panel.vue";
import { Created } from '@/lifecycle';


@Component({
  components: {
    AGTestCommandResultDetail,
    ResultPanel,
    CorrectnessIcon,
    DescriptionRenderer,
  }
})
export default class AGTestCaseResultDetail extends Vue implements Created {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: Object})
  ag_test_case_result!: AGTestCaseResultFeedback;

  @Prop({required: true, type: String})
  fdbk_category!: FeedbackCategory;

  d_staff_description: string | null = null;

  readonly CorrectnessLevel = CorrectnessLevel;

  async created() {
    if (this.d_globals.user_roles.is_staff) {
      let ag_test_case = await AGTestCase.get_by_pk(this.ag_test_case_result.ag_test_case_pk);
      this.d_staff_description = ag_test_case.staff_description;
    }
  }

  command_result_correctness(command_result: AGTestCommandResultFeedback) {
    let return_code_correctness = this.command_result_return_code_correctness(command_result);
    let stdout_correctness = this.command_result_output_correctness(command_result.stdout_correct);
    let stderr_correctness = this.command_result_output_correctness(command_result.stderr_correct);

    if (command_result.total_points < 0 || (command_result.total_points === 0
         && command_result.total_points_possible !== 0)) {
      return CorrectnessLevel.none_correct;
    }

    let show_info_only = (
      (command_result.stdout_points_possible === 0
      && command_result.stderr_points_possible === 0)
      && (command_result.fdbk_settings.show_actual_stdout
          || command_result.fdbk_settings.show_actual_stderr)
    );

    let correctnesses = [return_code_correctness, stdout_correctness, stderr_correctness];
    correctnesses = correctnesses.filter(val => val !== CorrectnessLevel.not_available);

    if (correctnesses.length === 0) {
      if (show_info_only) {
        return CorrectnessLevel.info_only;
      }
      return CorrectnessLevel.not_available;
    }

    correctnesses = correctnesses.filter(val => val !== CorrectnessLevel.info_only);
    if (correctnesses.length === 0) {
      return CorrectnessLevel.info_only;
    }

    if (correctnesses.every(val => val === CorrectnessLevel.all_correct)) {
      return CorrectnessLevel.all_correct;
    }

    if (correctnesses.every(val => val === CorrectnessLevel.none_correct)) {
      return CorrectnessLevel.none_correct;
    }

    return CorrectnessLevel.some_correct;
  }

  command_result_return_code_correctness(command_result: AGTestCommandResultFeedback) {
    if (command_result.return_code_correct === null) {
      if (command_result.fdbk_settings.show_actual_return_code) {
        return CorrectnessLevel.info_only;
      }
      return CorrectnessLevel.not_available;
    }
    else if (command_result.return_code_correct) {
      return CorrectnessLevel.all_correct;
    }
    return CorrectnessLevel.none_correct;
  }

  command_result_output_correctness(output_is_correct: null | boolean) {
    if (output_is_correct === null) {
      return CorrectnessLevel.not_available;
    }
    else if (output_is_correct) {
      return CorrectnessLevel.all_correct;
    }
    return CorrectnessLevel.none_correct;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/submission_detail.scss';
</style>
