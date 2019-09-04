<template>
  <div id="submission-list" class="scroll-container">
    <div class="scroll-column-container">
      <div id="submissions-sidebar" class="scroll-column">
        <div class="scroll-container">
          <template v-if="d_ultimate_submission !== null">
            <div class="sidebar-header">Final Graded Submission</div>
            <submission-panel
              :submission="d_ultimate_submission"
              :class="{'selected-submission': d_selected_submission !== null
                                              && d_selected_submission.pk === d_ultimate_submission.pk}"
              @click.native="d_selected_submission = d_ultimate_submission"></submission-panel>

            <div id="sidebar-list-separator"></div>
          </template>

          <div class="sidebar-header">All Submissions</div>

          <div id="list-loading-container" v-if="d_loading">
            <i class="loading fa fa-spinner fa-pulse"></i>
          </div>
          <template v-for="(submission, index) of d_submissions">
            <div v-if="index !== 0" class="divider"></div>
            <submission-panel
              :submission="submission"
              :key="submission.pk"
              :class="{'selected-submission': d_selected_submission !== null
                                              && d_selected_submission.pk === submission.pk}"
              @click.native="d_selected_submission = submission"></submission-panel>

          </template>
        </div>
      </div>

      <div class="divider"></div>

      <div class="scroll-column-grow">
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
import SubmissionPanel from '@/components/submission_list/submission_panel.vue';
import { Created, Destroyed } from '@/lifecycle';
import { deep_copy, safe_assign, toggle } from '@/utils';

@Component({
  components: {
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

    this.d_loading = false;
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
  async update_submission_changed(submission: Submission): Promise<void> {
    // let index = this.d_submissions.findIndex((item) => item.pk === submission.pk);
    // if (index !== -1) {
    //   safe_assign(this.d_submissions[index], JSON.parse(JSON.stringify(submission)));
    //   // FIXME: check for status change and reload results? (for results loading, we need feedback category deduction)
    //   this.d_submissions[index].results = await get_submission_result(
    //     submission.pk, this.deduce_fdbk_category(submission));
    // }
  }

  private deduce_fdbk_category(submission: Submission): FeedbackCategory {
    if (this.d_globals.user_roles.is_staff) {
      let is_group_member = this.group.member_names.find(
        username => username === this.d_globals.current_user.username
      ) !== undefined;

      return is_group_member ? FeedbackCategory.max : FeedbackCategory.staff_viewer;
    }
    else if (submission.is_past_daily_limit) {
      return FeedbackCategory.past_limit_submission;
    }

    return FeedbackCategory.normal;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/global.scss';
@import '@/styles/independent_scrolling.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

#list-loading-container {
  height: 40px;

  .fa-spinner {
    @include fully-center();
    font-size: 1.3em;
  }
}

#submissions-sidebar {
  min-width: 230px;
}

.sidebar-header {
  font-weight: bold;
  padding: 15px 8px 8px;
  font-size: 1.2rem;
}

.selected-submission {
  background-color: lighten($light-blue, 3%);
}

.divider {
  border: 1px solid $pebble-medium;
}

</style>
