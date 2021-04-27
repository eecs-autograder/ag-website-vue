<template>
  <div class="project-stats">
    <div class="beta-msg">
      This page is still in an experimental phase. If you encounter a bug
      or have an idea for a new graph, please post a comment in
      <a href="https://github.com/eecs-autograder/autograder.io/issues/4" target="_blank">
        this issue on GitHub.
      </a>
    </div>

    <div class="checkbox-input-container">
      <label class="checkbox-label">
        <input
          data-testid="include_staff_checkbox"
          type="checkbox"
          class="checkbox"
          v-model="d_include_staff"
        >
        Include staff
      </label>
    </div>

    <div class="stats-section">
      <collapsible
        class="stats-collapsible-header"
        :include_caret="true"
        :indentation_level="null"
        @click="initial_load_submission_results"
        :use_v_if="true"
        ref="histogram_collapsible"
      >
        <template v-slot:header_text>
          <div class="stats-header-text">
            Summary
          </div>
        </template>
        <!-- Lazy slot evaluation.
             See https://github.com/vuejs/vue/issues/8578#issuecomment-488183335 -->
        <template #default>
          <div class="load-data-button-wrapper">
            <button
              type="button"
              class="blue-button"
              @click="reload_submission_results"
              :disabled="d_loading_submission_results"
            >
              Reload Data
            </button>
          </div>

          <progress-bar
            v-if="d_loading_submission_results"
            :progress="d_submission_results_progress"
          />
          <submission-score-histogram
            v-if="submission_results !== null"
            :ultimate_submission_entries="submission_results"
          />
        </template>
      </collapsible>
    </div>

    <div class="stats-section">
      <collapsible
        class="stats-collapsible-header"
        :include_caret="true"
        :indentation_level="null"
        @click="initial_load_all_submissions"
        :use_v_if="true"
        ref="submissions_over_time_collapsible"
      >
        <template v-slot:header_text>
          <div class="stats-header-text">
            Submissions Over Time
          </div>
        </template>

        <template #default>
          <div class="load-data-button-wrapper">
            <button
              type="button"
              class="blue-button"
              @click="reload_all_submissions"
              :disabled="d_loading_all_submissions"
            >
              Reload Data
            </button>
          </div>
          <progress-bar
            v-if="d_loading_all_submissions"
            :progress="d_all_submissions_progress"
          />
          <submissions-over-time-graph
            v-if="all_submissions !== null"
            :submissions="all_submissions"
          />
        </template>
      </collapsible>
    </div>

    <div class="stats-section">
      <collapsible
        class="stats-collapsible-header"
        :include_caret="true"
        :indentation_level="null"
        @click="initial_load_submission_results"
        :use_v_if="true"
        ref="pass_fail_counts_collapsible"
      >
        <template v-slot:header_text>
          <div class="stats-header-text">
            Pass/Fail Counts Per Test Case
          </div>
        </template>

        <template #default>
          <div class="load-data-button-wrapper">
            <button
              type="button"
              class="blue-button"
              @click="reload_submission_results"
              :disabled="d_loading_submission_results"
            >
              Reload Data
            </button>
          </div>
          <progress-bar
            v-if="d_loading_submission_results"
            :progress="d_submission_results_progress"
          />
          <pass-fail-counts
            ref="pass_fail_counts"
            v-if="submission_results !== null"
            :project="project"
            :ultimate_submission_entries="submission_results"
          />
        </template>
      </collapsible>
    </div>

    <div class="stats-section">
      <collapsible
        class="stats-collapsible-header"
        :include_caret="true"
        :indentation_level="null"
        @click="initial_load_final_score_vs_first_submission"
        :use_v_if="true"
        ref="final_score_vs_first_submission_collapsible"
      >
        <template v-slot:header_text>
          <div class="stats-header-text">
            Final Score vs. First Submission Time
          </div>
        </template>

        <template #default>
          <div class="load-data-button-wrapper">
            <button
              type="button"
              class="blue-button"
              @click="reload_final_score_vs_first_submission"
              :disabled="d_loading_submission_results || d_loading_all_submissions"
              data-testid="reload_final_score_vs_first_submission_button"
            >
              Reload Data
            </button>
          </div>
          <progress-bar
            v-if="d_loading_first_submissions_by_group"
            :progress="(d_submission_results_progress + d_all_submissions_progress) / 2"
          />

          <first-submission-time-vs-final-score
            ref="final_score_vs_first_submission"
            v-if="submission_results !== null && d_all_submissions !== null"
            :project="project"
            :ultimate_submission_entries="submission_results"
            :first_submissions_by_group="d_first_submissions_by_group"
          />
        </template>
      </collapsible>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import * as ag_cli from 'ag-client-typescript';

import Collapsible from '@/components/collapsible.vue';
import ProgressBar from '@/components/progress_bar.vue';
import { handle_api_errors_async, handle_global_errors_async } from '@/error_handling';
import { SafeMap } from '@/safe_map';
import { toggle } from '@/utils';

import FirstSubmissionTimeVsFinalScore from './first_submission_time_vs_final_score.vue';
import PassFailCounts from './pass_fail_counts.vue';
import SubmissionScoreHistogram from './submission_score_histogram/submission_score_histogram.vue';
import SubmissionsOverTimeGraph from './submissions_over_time_graph.vue';

export interface FirstSubmissionData {
  group: ag_cli.Group;
  first_submission: ag_cli.Submission;
}

@Component({
  components: {
    Collapsible,
    PassFailCounts,
    ProgressBar,
    SubmissionScoreHistogram,
    SubmissionsOverTimeGraph,
    FirstSubmissionTimeVsFinalScore
  }
})
export default class ProjectStats extends Vue {
  @Prop({type: ag_cli.Course, required: true})
  course!: ag_cli.Course;

  @Prop({type: ag_cli.Project, required: true})
  project!: ag_cli.Project;

  d_include_staff = true;
  d_staff_usernames = new Set<string>();

  d_loading_submission_results = false;
  d_submission_results_progress = 0;
  d_submission_results: ag_cli.FullUltimateSubmissionResult[] | null = null;

  d_loading_all_submissions = false;
  d_all_submissions_progress = 0;
  d_all_submissions: ag_cli.Submission[] | null = null;

  d_loading_first_submissions_by_group = false;
  d_first_submissions_by_group = new SafeMap<number, FirstSubmissionData>();

  @handle_global_errors_async
  async created() {
    let [staff, admins] = await Promise.all([this.course.get_staff(), this.course.get_admins()]);
    this.d_staff_usernames = new Set([...staff, ...admins].map(user => user.username));
  }

  get submission_results() {
    if (this.d_submission_results === null || this.d_include_staff) {
      return this.d_submission_results;
    }

    return this.d_submission_results.filter(
      result => !this.d_staff_usernames.has(result.username)
    );
  }

  async initial_load_submission_results() {
    if (this.d_submission_results === null && !this.d_loading_submission_results) {
      await this.reload_submission_results();
    }
  }

  @handle_global_errors_async
  reload_submission_results() {
    return toggle(this, 'd_loading_submission_results', async () => {
      this.d_submission_results = null;
      this.d_submission_results_progress = 0;
      let page_num = 1;
      let page_size = 200;

      let results = [];
      let page: ag_cli.FullUltimateSubmissionResultPage;
      do {
        page = await ag_cli.SubmissionResults.get_all_ultimate_submission_results(
            this.project.pk,
            {
                page_num: page_num,
                page_size: page_size,
                // Staff will be filtered out after we load the data
                include_staff: true
            }
        );
        results.push(...page.results);

        this.d_submission_results_progress = (page_num * page_size / page.count) * 100;
        page_num += 1;
      } while (page.next !== null);

      this.d_submission_results = results;
    });
  }

  get all_submissions(): ag_cli.Submission[] | null {
    if (this.d_all_submissions === null || this.d_include_staff) {
      return this.d_all_submissions;
    }

    let result = this.d_all_submissions.filter(
      submission => !this.d_staff_usernames.has(submission.submitter)
    );
    return result;
  }

  async initial_load_all_submissions() {
    if (this.d_all_submissions === null && !this.d_loading_all_submissions) {
      await this.reload_all_submissions();
    }
  }

  @handle_global_errors_async
  reload_all_submissions() {
    return toggle(this, 'd_loading_all_submissions', async () => {
      this.d_all_submissions = null;
      this.d_all_submissions_progress = 0;
      this.d_first_submissions_by_group = new SafeMap();

      let groups = await ag_cli.Group.get_all_from_project(this.project.pk);

      let num_loaded_groups = 0;
      let all_submissions = [];
      for (let group of groups) {
        let submissions = await ag_cli.Submission.get_all_from_group(group.pk);
        all_submissions.push(...submissions);
        if (submissions.length !== 0) {
          this.d_first_submissions_by_group.set(
            group.pk, {group: group, first_submission: submissions[0]}
          );
        }
        num_loaded_groups += 1;
        this.d_all_submissions_progress = (num_loaded_groups / groups.length) * 100;
      }
      this.d_all_submissions = all_submissions;
    });
  }

  initial_load_final_score_vs_first_submission() {
    return toggle(this, 'd_loading_first_submissions_by_group', async () => {
      await this.initial_load_submission_results();
      await this.initial_load_all_submissions();
    });
  }

  reload_final_score_vs_first_submission() {
    return toggle(this, 'd_loading_first_submissions_by_group', async () => {
      await this.reload_submission_results();
      await this.reload_all_submissions();
    });
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';
@import '@/styles/section_header.scss';

.project-stats {
  margin: .75rem 0 .75rem .5rem;
}

.beta-msg {
  max-width: 500px;
  margin-bottom: .5rem;
}

.load-data-button-wrapper {
  margin-bottom: .75rem;
}

.stats-collapsible-header {
  margin: 1rem 0 .55rem;
}

.stats-header-text {
  @include section-header($with-left-divider: false);
  font-size: 1.25rem;
}
</style>
