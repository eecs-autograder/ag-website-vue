<template>
  <div class="submission-list-item">
    <div class="submission-timestamp">
      {{format_datetime_short(submission.timestamp)}}
    </div>
    <div class="submission-status">
      <template v-if="submission.status === GradingStatus.queued">
        <div class="queued-symbol">Q</div>
      </template>
      <template v-else-if="submission.status === GradingStatus.being_graded">
        <i class="fas fa-list"></i>
      </template>

      <template v-else-if="submission.status === GradingStatus.waiting_for_deferred">
        <div v-if="submission.results.total_points_possible !== 0" class="score">
          {{submission.results.total_points}}/{{submission.results.total_points_possible}}
        </div>
        <i v-else class="far fa-check-circle"></i>
      </template>
      <template v-else-if="submission.status === GradingStatus.finished_grading">
        <div v-if="submission.results.total_points_possible !== 0" class="score">
          {{submission.results.total_points}}/{{submission.results.total_points_possible}}
        </div>
        <i v-else class="far fa-check-circle"></i>
      </template>

      <template v-else-if="submission.status === GradingStatus.removed_from_queue">
        <i class="fas fa-eject"></i>
      </template>
      <template v-else-if="submission.status === GradingStatus.error">
        <i class="fas fa-skull"></i>
        <!-- <i class="fas fa-skull-crossbones"></i> -->
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { GradingStatus, Submission, SubmissionWithResults } from 'ag-client-typescript';

import { format_datetime_short } from '@/utils';

@Component
export default class SubmissionPanel extends Vue {
  @Prop({required: true})
  submission!: SubmissionWithResults;

  readonly GradingStatus = GradingStatus;
  readonly format_datetime_short = format_datetime_short;
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

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
  font-size: .9rem;

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

    .fa-skull {
      color: crimson;
    }
  }

  .score {
    font-weight: bold;
    color: $navy-blue;
  }
}
</style>
