<template>
  <div class="submission-list-item">
    <div class="submission-timestamp">
      {{ format_datetime_short(submission.timestamp) }}
    </div>
    <div class="submission-status" role="status">
      <template v-if="submission.status === GradingStatus.queued">
        <div class="queued-symbol" aria-label="Queued">Q</div>
      </template>
      <template v-else-if="submission.status === GradingStatus.being_graded">
        <i class="fas fa-list" role="img" aria-label="Being graded"></i>
      </template>

      <template
        v-else-if="submission.status === GradingStatus.waiting_for_deferred"
      >
        <div
          v-if="Number(submission.results.total_points_possible) !== 0"
          class="score"
          aria-label="Score"
        >
          {{ submission.results.total_points }}/{{
            submission.results.total_points_possible
          }}
        </div>
        <i
          v-else
          class="far fa-check-circle"
          role="img"
          aria-label="Core tests finished"
        ></i>
      </template>
      <template
        v-else-if="submission.status === GradingStatus.finished_grading"
      >
        <div
          v-if="Number(submission.results.total_points_possible) !== 0"
          class="score"
          aria-label="Score"
        >
          {{ submission.results.total_points }}/{{
            submission.results.total_points_possible
          }}
        </div>
        <i
          v-else
          class="far fa-check-circle"
          role="img"
          aria-label="Finished grading"
        ></i>
      </template>

      <template
        v-else-if="submission.status === GradingStatus.removed_from_queue"
      >
        <i class="fas fa-eject" role="img" aria-label="Removed from queue"></i>
      </template>
      <template v-else-if="submission.status === GradingStatus.rejected">
        <i class="fas fa-ban" role="img" aria-label="Rejected"></i>
      </template>
      <template v-else-if="submission.status === GradingStatus.error">
        <i class="fas fa-skull" role="img" aria-label="Internal error"></i>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GradingStatus, SubmissionWithResults } from "ag-client-typescript";

import { format_datetime_short } from "@/utils";

defineProps<{
  submission: SubmissionWithResults;
}>();
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.submission-list-item {
  padding: 7px 8px 7px 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;

  .submission-timestamp {
    padding-right: 25px;
  }

  .submission-status {
    .queued-symbol {
      font-weight: bold;
      color: darken($sky-blue, 10%);
    }

    .fa-list {
      color: $ocean-blue;
    }

    .fa-check-circle {
      color: green;
    }

    .fa-eject {
      color: $orange;
    }

    .fa-skull,
    .fa-ban {
      color: crimson;
    }
  }

  .score {
    font-weight: bold;
    color: $navy-blue;
  }
}

.submission-list-item:hover {
  background-color: $pebble-light;
}
</style>
