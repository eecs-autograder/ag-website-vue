<template>
  <div>
    AG Test Case Result Panel One Command
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
    AGTestCaseResultFeedback,
    FeedbackCategory,
    Submission
} from "ag-client-typescript";

@Component
export default class AGTestCaseResultPanelSingleCommand extends Vue {

    @Prop({required: true, type: Submission})
    submission!: Submission;

    @Prop({required: true, type: Object})
    ag_test_case_result: AGTestCaseResultFeedback | null = null;

    @Prop({required: true, type: String})
    fdbk_category!: string;

    created() {

    }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

</style>
