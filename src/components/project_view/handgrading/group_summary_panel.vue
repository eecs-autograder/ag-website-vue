<template>
  <div class="group-summary-panel"
       :class="{
         'graded': status === HandgradingStatus.graded,
         'ungraded': status === HandgradingStatus.ungraded,
         'in-progress': status === HandgradingStatus.in_progress,
         'no-submission': status === HandgradingStatus.no_submission,
       }"
       v-on="$listeners">
    <div class="member-names">
      <div class="member-name" v-for="member of group_summary.member_names" :key="member">
        {{member}}
      </div>
    </div>
    <div class="status">
      {{status}}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import * as ag_cli from 'ag-client-typescript';

import { get_handgrading_status, HandgradingStatus } from './handgrading_status';

@Component({})
export default class GroupSummaryPanel extends Vue {
  @Prop({required: true})
  group_summary!: ag_cli.GroupWithHandgradingResultSummary;

  readonly HandgradingStatus = HandgradingStatus;

  get status() {
    let status = get_handgrading_status(this.group_summary);
    if (status === HandgradingStatus.graded) {
      let result = this.group_summary.handgrading_result!;
      return `${result.total_points}/${result.total_points_possible}`;
    }
    return status;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.group-summary-panel {
  display: flex;
  justify-content: space-between;
  font-size: .875rem;
}

.member-names, .status {
  padding: .25rem .375rem;
}

.member-name {
  padding: .125rem 0;
}

.graded {
  color: darken($green, 15%);
}

.ungraded {
  color: darken($orange, 25%);
}

.in-progress {
  color: $ocean-blue;
}

.no-submission {
  color: $stormy-gray-dark;
}

</style>
