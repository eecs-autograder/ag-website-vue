<template>
  <div
    class="group-summary-panel"
    :class="{
      graded: handgrading_status === HandgradingStatus.graded,
      ungraded: handgrading_status === HandgradingStatus.ungraded,
      'in-progress': handgrading_status === HandgradingStatus.in_progress,
      'no-handgradeable-submission':
        handgrading_status === HandgradingStatus.no_handgradeable_submission,
    }"
    v-on="$listeners"
  >
    <div class="member-names">
      <div
        class="member-name"
        v-for="member of group_summary.member_names"
        :key="member"
      >
        {{ member }}
      </div>
    </div>
    <div class="status">
      {{ status_text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import * as ag_cli from "ag-client-typescript";

import {
  get_handgrading_status,
  HandgradingStatus,
} from "./handgrading_status";

const props = defineProps<{
  group_summary: ag_cli.GroupWithHandgradingResultSummary;
}>();

const handgrading_status = computed(() =>
  get_handgrading_status(props.group_summary),
);

const status_text = computed(() => {
  let status = get_handgrading_status(props.group_summary);
  if (status === HandgradingStatus.graded) {
    let result = props.group_summary.handgrading_result!;
    return `${result.total_points}/${result.total_points_possible}`;
  }
  return status;
});
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.group-summary-panel {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.member-names,
.status {
  padding: 0.25rem 0.375rem;
}

.member-name {
  padding: 0.125rem 0;
}

.graded {
  color: darken($green, 35%);
}

.ungraded {
  color: darken($orange, 35%);
}

.in-progress {
  color: darken($ocean-blue, 10%);
}

.no-handgradeable-submission {
  color: $normal-text-color-3;
}
</style>
