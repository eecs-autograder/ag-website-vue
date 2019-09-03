<template>
  <div id="submission-list" class="scroll-container">
    <div class="scroll-column-container">
      <div id="submissions-sidebar" class="scroll-column">
        <div class="scroll-container">
          <div :class="['submission-list-item',
                        {'selected-submission': d_selected_submission !== null
                                                && d_selected_submission.pk === submission.pk}]"
               v-for="submission of d_submissions" :key="submission.pk"
               @click="d_selected_submission = submission">
            <div class="submission-timestamp">
              {{format_datetime_short(submission.timestamp)}}
            </div>
            <div class="submission-status">
              <template v-if="submission.status === GradingStatus.received">
                <!-- <i class="far fa-paper-plane"></i> -->
                <!-- <i class="fas fa-plane-arrival"></i> -->
              </template>
              <template v-else-if="submission.status === GradingStatus.queued">
                <div class="queued-symbol">Q</div>
                <!-- <i class="fas fa-list"></i> -->
              </template>
              <template v-else-if="submission.status === GradingStatus.being_graded">
                <i class="fas fa-list"></i>
                <!-- <i class="fas fa-tasks"></i> -->
                <!-- <i class="fas fa-sync-alt"></i> -->
              </template>

              <template v-else-if="submission.status === GradingStatus.waiting_for_deferred">
                <div v-if="submission.results.total_points_possible !== 0" class="score">100/100</div>
                <!-- <i v-else class="fas fa-check"></i> -->
                <i v-else class="far fa-check-circle"></i>
              </template>
              <template v-else-if="submission.status === GradingStatus.finished_grading">
                <div v-if="submission.results.total_points_possible !== 0" class="score">
                  100/100
                </div>
                <i v-else class="far fa-check-circle"></i>
                <!-- <i v-else class="fas fa-check"></i> -->
              </template>

              <template v-else-if="submission.status === GradingStatus.removed_from_queue">
                <i class="fas fa-eject"></i>
                <!-- <i class="fas fa-minus-circle"></i> -->
                <!-- <i class="fas fa-hand-paper"></i> -->
                <!-- <i class="far fa-hand-paper"></i> -->
              </template>
              <template v-else-if="submission.status === GradingStatus.error">
                <i class="fas fa-skull"></i>
                <!-- <i class="fas fa-skull-crossbones"></i> -->
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="scroll-column-grow">
        Spam
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import {
    Course,
    Group,
    Submission,
    Project,
    SubmissionObserver,
    SubmissionWithResults,
    get_submission_result,
    FeedbackCategory
} from 'ag-client-typescript';

import { Created, Destroyed } from '@/lifecycle';
import { deep_copy, format_datetime_short, safe_assign } from '@/utils';
import { SubmissionData, GradingStatus } from 'ag-client-typescript';
import { HttpError } from 'ag-client-typescript';

@Component({})
export default class SubmissionList extends Vue implements SubmissionObserver, Created, Destroyed {
  @Prop({required: true, type: Course})
  course!: Course;

  @Prop({required: true, type: Project})
  project!: Project;

  @Prop({required: true, type: Group})
  group!: Group;

  d_submissions: SubmissionWithResults[] = [];
  d_selected_submission: Submission | null = null;

  d_ultimate_submission: SubmissionWithResults | null = null;

  readonly GradingStatus = GradingStatus;
  readonly format_datetime_short = format_datetime_short;

  @Watch('group')
  on_group_changed(new_value: Group, old_value: Group) {
    this.initialize(new_value);
  }

  created() {
    Submission.subscribe(this);
    return this.initialize(this.group);
  }

  destroyed() {
    Submission.unsubscribe(this);
  }

  private async initialize(group: Group) {
    this.d_selected_submission = null;
    this.d_submissions = await Submission.get_all_from_group_with_results(group.pk);
  }

  private async get_ultimate_submission() {
    try {
      let ultimate = await Submission.get_final_graded_submission_from_group(this.group.pk);
    }
    catch (e) {
      if (!(e instanceof HttpError) || e.status !== 404) {
        throw e;
      }
    }

  }

  update_submission_created(submission: Submission): void {
    let submission_with_empty_results: SubmissionWithResults = {
      results: {
        pk: submission.pk,
        total_points: 0,
        total_points_possible: 0,
        ag_test_suite_results: [],
        student_test_suite_results: [],
      },
      ...JSON.parse(JSON.stringify(submission))
    };
    this.d_submissions.unshift(submission_with_empty_results);
  }

  // NOTE: Only poll for submissions pre waiting for deferred.
  // We can check for deferred -> finished when we reload the whole list.
  async update_submission_changed(submission: Submission): void {
    let index = this.d_submissions.findIndex((item) => item.pk === submission.pk);
    if (index !== -1) {
      safe_assign(this.d_submissions[index], JSON.parse(JSON.stringify(submission)));
      // FIXME: check for status change and reload results? (for results loading, we need feedback category deduction)
      this.d_submissions[index].results = await get_submission_result(
        submission.pk, this.deduce_fdbk_category(submission));
    }
  }

  deduce_fdbk_category(submission: Submission): FeedbackCategory {

  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/independent_scrolling.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}


.submission-list-item {
  border-bottom: 1px solid $pebble-medium;
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

    .fa-tasks, .fa-list {
      color: $ocean-blue;
    }

    .fa-check, .fa-check-circle {
      color: green;
    }

    .fa-eject, .fa-hand-paper, .fa-minus-circle {
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

.submission-list-item:last-of-type {
  border: none;
}

.selected-submission {
  background-color: lighten($light-blue, 3%);
}

.divider {
  border: 1px solid $pebble-medium;
  margin-right: 8px;
}

</style>
