<template>
  <div class="sidebar-container">
    <div class="sidebar-menu">
      <template v-if="d_ultimate_submission !== null && !d_collapsed && !d_loading">
        <div class="header">Final Graded Submission</div>
        <submission-panel
          :submission="d_ultimate_submission"
          :class="{
            'active': d_selected_submission !== null
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
        <div class="list-loading-container loading-wrapper" v-if="d_loading">
          <i class="loading-horiz-centered loading-medium fa fa-spinner fa-pulse"></i>
        </div>
        <template v-else>
          <div class="no-submissions" v-if="d_submissions.length === 0">No submissions</div>
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
        </template>
      </div>
    </div>


    <div :class="['body', {'body-closed': d_collapsed}]">
      <div class="screen-too-small-msg">
        <i class="fas fa-exclamation-triangle"></i>
        Your screen may be too small to display this content properly.
      </div>

      <div v-if="d_selected_submission !== null">
        <submission-detail ref="submission_detail"
                           :submission_with_results="d_selected_submission"
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
import { BeforeDestroy, Created } from '@/lifecycle';
import { Poller } from '@/poller';
import { deep_copy, safe_assign, sleep, toggle, zip } from '@/utils';

@Component({
  components: {
    SubmissionDetail,
    SubmissionPanel
  }
})
export default class SubmissionList extends Vue implements SubmissionObserver,
                                                           Created, BeforeDestroy {
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

  beforeDestroy() {
    Submission.unsubscribe(this);
    if (this.plain_submissions_poller !== null) {
      this.plain_submissions_poller.stop();
    }
  }

  private async initialize(group: Group) {
    this.d_loading = true;

    // Reset these two values in case we're changing submissions.
    this.d_selected_submission = null;
    this.d_ultimate_submission = null;
    // We have to load d_submissions first, as get_ultimate_submission
    // needs its value when the current user is staff.
    this.d_submissions = await Submission.get_all_from_group_with_results(group.pk);
    await this.get_ultimate_submission();

    if (this.d_submissions.length !== 0) {
      let submission_being_graded = this.d_submissions.find(
        submission => submission.status === GradingStatus.received
                      || submission.status === GradingStatus.queued
                      || submission.status === GradingStatus.being_graded
      );
      if (submission_being_graded !== undefined) {
        this.d_selected_submission = submission_being_graded;
      }
      else if (this.d_ultimate_submission !== null) {
        this.d_selected_submission = this.d_ultimate_submission;
      }
      else {
        this.d_selected_submission = this.d_submissions[0];
      }
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
      let ultimate_submission
        = await Submission.get_final_graded_submission_from_group(this.group.pk);
      // For staff, we want to use the feedback config deduced by the server
      // in Submission.get_all_from_group_with_results (could be max or
      // staff viewer).
      // For students, we want to request ultimate submission feedback and
      // use that.
      if (this.d_globals.user_roles.is_staff) {
        this.d_ultimate_submission = this.d_submissions.find(
          submission => submission.pk === ultimate_submission.pk)!;
      }
      else {
        let results = await get_submission_result(
          ultimate_submission.pk, FeedbackCategory.ultimate_submission);
        this.d_ultimate_submission = {
          results: results,
          ...ultimate_submission
        };
      }
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
    // Future proofing: we only want to switch to the new submission
    // if it was made by the current user.
    if (submission.submitter === this.d_globals.current_user.username) {
      this.d_selected_submission = submission_with_empty_results;
    }
  }

  update_submission_changed(submission: Submission): void {
    let index = this.d_submissions.findIndex(s => s.pk === submission.pk);
    if (index !== -1) {
      safe_assign(this.d_submissions[index], new SubmissionData(submission));
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/collapsible_sidebar.scss';
@import '@/styles/loading.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.list-loading-container{
  margin-top: 1rem;
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
  $sidebar-header-height: 2.5rem,
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
    @include header(1.125rem, .5rem);

    display: flex;
    align-items: center;

    .header-text {
      padding-left: .5rem;
    }

    .collapse-sidebar-button .fa-bars:hover {
      color: $stormy-gray-dark;
      cursor: pointer;
    }
  }

  .sidebar-header-closed {
    border-bottom: 1px solid $border-color;
  }
}

.header {
  @include header(1.125rem, .625rem);
}

.active {
  background-color: $active-color;
}

.no-submissions {
  padding: .375rem .5rem;
  color: darken($stormy-gray-dark, 15%);
}

.screen-too-small-msg {
  margin-top: .25rem;
  margin-left: .5rem;
  font-size: 1.125rem;
  .fa-exclamation-triangle {
    color: darken($light-yellow, 20%);
  }

  @media only screen and (min-width: 500px) {
    display: none;
  }
}

</style>
