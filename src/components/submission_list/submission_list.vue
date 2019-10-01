<template>
  <div id="submission-list" class="sidebar-container">
    <div class="sidebar-menu">
      <template v-if="d_ultimate_submission !== null && !d_collapsed">
        <div class="header">Final Graded Submission</div>
        <submission-panel
          :submission="d_ultimate_submission"
          :class="{
            'selected-submission': d_selected_submission !== null
                                   && d_selected_submission.pk === d_ultimate_submission.pk
          }"
          @click.native="d_selected_submission = d_ultimate_submission"></submission-panel>
      </template>

      <div class="sidebar-header" :class="{'sidebar-header-closed': d_collapsed}">
        <span class="collapse-sidebar-button" @click="d_collapsed = !d_collapsed">
          <i class="fas fa-bars"></i>
        </span>
        <span class="header-text" v-if="!d_collapsed">
          All Submissions
        </span>
      </div>

      <div class="sidebar-content" v-if="!d_collapsed">
        <div id="list-loading-container" v-if="d_loading">
          <i class="loading fa fa-spinner fa-pulse"></i>
        </div>
        <template v-for="(submission, index) of d_submissions">
          <div v-if="index !== 0" class="divider"></div>
          <submission-panel
            :submission="d_ultimate_submission !== null
                            && d_ultimate_submission.pk === submission.pk
                          ? d_ultimate_submission : submission"
            :key="submission.pk"
            :class="{'active': d_selected_submission !== null
                                            && d_selected_submission.pk === submission.pk}"
            @click.native="d_selected_submission = submission"></submission-panel>
        </template>
      </div>
    </div>

    <div :class="['body', {'body-closed': d_collapsed}]">
      <div v-if="d_selected_submission !== null"
           id="submission-detail-container">
        <submission-detail ref="submission_detail"
                           :selected_submission_with_results="d_selected_submission"
                           :is_ultimate_submission="is_ultimate_submission"
                           :course="course"
                           :group="group">
        </submission-detail>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';

import {
    Course,
    FeedbackCategory,
    get_submission_result,
    GradingStatus,
    Group,
    HttpError,
    Project,
    Submission,
    SubmissionData,
    SubmissionObserver,
    SubmissionWithResults,
} from 'ag-client-typescript';

import { GlobalData } from '@/app.vue';
import SubmissionDetail from "@/components/project_view/submission_detail/submission_detail.vue";
import SubmissionPanel from '@/components/submission_list/submission_panel.vue';
import { Created, Destroyed } from '@/lifecycle';
import { deep_copy, safe_assign, sleep, toggle, zip } from '@/utils';

class Poller {
  private poll_fn: () => Promise<void>;
  private delay_seconds: number;

  get continue() {
    return this._continue;
  }
  private _continue: boolean = false;

  constructor(poll_fn: () => Promise<void>,
              delay_seconds: number) {
    this.poll_fn = poll_fn;
    this.delay_seconds = delay_seconds;
  }

  async start_after_delay() {
    if (this._continue) {
      // istanbul ignore next
      throw new Error('This poller has already been started');
    }

    this._continue = true;
    await sleep(this.delay_seconds);
    while (this._continue) {
      await this.poll_fn();
      await sleep(this.delay_seconds);
    }
  }

  stop() {
    this._continue = false;
  }
}

@Component({
  components: {
    SubmissionDetail,
    SubmissionPanel
  }
})
export default class SubmissionList extends Vue implements SubmissionObserver, Created, Destroyed {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  @Prop({required: true, type: Course})
  course!: Course;

  @Prop({required: true, type: Project})
  project!: Project;

  @Prop({required: true, type: Group})
  group!: Group;

  d_loading = true;

  d_submissions: SubmissionWithResults[] = [];
  d_selected_submission: SubmissionWithResults | null = null;

  d_ultimate_submission: SubmissionWithResults | null = null;

  plain_submissions_poller: Poller | null = null;

  d_collapsed = false;

  @Watch('group')
  on_group_changed(new_value: Group, old_value: Group) {
    return this.initialize(new_value);
  }

  created() {
    Submission.subscribe(this);
    return this.initialize(this.group);
  }

  destroyed() {
    Submission.unsubscribe(this);
    if (this.plain_submissions_poller !== null) {
      this.plain_submissions_poller.stop();
    }
  }

  private async initialize(group: Group) {
    this.d_loading = true;

    this.d_selected_submission = null;
    await this.get_ultimate_submission();
    this.d_submissions = await Submission.get_all_from_group_with_results(group.pk);

    if (this.d_submissions.length !== 0) {
      this.d_selected_submission = (
        this.d_ultimate_submission !== null ? this.d_ultimate_submission : this.d_submissions[0]
      );
    }

    if (this.plain_submissions_poller !== null) {
      this.plain_submissions_poller.stop();
    }
    this.plain_submissions_poller = new Poller(
      () => this.refresh_submissions(),
      30
    );
    // tslint:disable-next-line no-floating-promises
    this.plain_submissions_poller.start_after_delay();

    this.d_loading = false;
  }

  private async refresh_submissions() {
    let submissions = await Submission.get_all_from_group(this.group.pk);
    if (this.submissions_differ(submissions)) {
      this.d_submissions = await Submission.get_all_from_group_with_results(this.group.pk);

      if (this.d_selected_submission !== null) {
        this.d_selected_submission = this.d_submissions.find(
          submission => submission.pk === this.d_selected_submission!.pk)!;
      }
    }
  }

  private submissions_differ(new_submissions: Submission[]): boolean {
    if (new_submissions.length !== this.d_submissions.length) {
      return true;
    }

    let current_statuses = this.d_submissions.map(s => s.status);
    let new_statuses = new_submissions.map(s => s.status);

    for (let [current_status, new_status] of zip(current_statuses, new_statuses)) {
      if (current_status !== new_status) {
        return true;
      }
    }

    return false;
  }

  get is_ultimate_submission(): boolean {
      return this.d_selected_submission !== null && this.d_ultimate_submission !== null
             && this.d_selected_submission.pk === this.d_ultimate_submission.pk;
  }

  private async get_ultimate_submission() {
    try {
      let submission = await Submission.get_final_graded_submission_from_group(this.group.pk);
      let results = await get_submission_result(
        submission.pk, FeedbackCategory.ultimate_submission);
      this.d_ultimate_submission = {
        results: results,
        ...submission
      };
    }
    catch (e) {
      // 403 status: can't view ultimate submission
      // 404 status: no submissions
      if (!(e instanceof HttpError) || (e.status !== 403 && e.status !== 404)) {
        // istanbul ignore next
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

  update_submission_changed(submission: Submission): void {
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/global.scss';
@import '@/styles/collapsible_sidebar.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

#list-loading-container {
  .fa-spinner {
    @include fully-center();
    font-size: 1.3em;
  }
}

@mixin header(
  $font-size,
  $padding-x,
  $padding-y: none,
) {
  font-weight: bold;
  font-size: $font-size;

  @if $padding-y == none {
    $padding-y: $padding-x;
  }

  padding: $padding-y $padding-x;
}

$active-color: lighten($light-blue, 3%);
$border-color: $pebble-medium;

@include collapsible-sidebar(
  $sidebar-width: 300px,
  $sidebar-header-height: 40px,
  $border-color: $border-color,
  $background-color: white,
  $active-color: $active-color,
  $stretch: true,
);

.sidebar-container {
  .sidebar-menu {
    z-index: 3;
    border-left: none;
    border-top: none;
    border-bottom: none;
  }

  .sidebar-header {
    @include header(18px, 8px);

    display: flex;
    align-items: center;

    .header-text {
      padding-left: 8px;
    }

    .collapse-sidebar-button .fa-bars:hover {
      color: $stormy-gray-dark;
      cursor: pointer;
    }
  }

  .sidebar-header-closed {
    border-bottom: 1px solid $border-color;
  }

  .body {
    min-width: 500px;
  }
}

.header {
  @include header(19px, 10px);
}

.selected-submission {
  background-color: $active-color;
}

</style>