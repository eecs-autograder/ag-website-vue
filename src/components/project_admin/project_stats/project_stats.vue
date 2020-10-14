<template>
  <div class="project-stats">
    <div class="beta-msg">
      This page is still in an experimental phase. If you encounter a bug
      or have an idea for a new graph, please post a comment in
      <a href="https://github.com/eecs-autograder/autograder.io/issues/4">
        this issue on GitHub.
      </a>
    </div>

    <div class="checkbox-input-container">
      <label class="checkbox-label">
        <input type="checkbox" class="checkbox" v-model="d_include_staff">
        Include staff
      </label>
    </div>

    <div class="stats-section">
      <div class="stats-header">
        Summary
      </div>
      <div class="load-data-button-wrapper">
        <button
          type="button"
          class="blue-button"
          @click="load_submission_results"
          :disabled="d_loading_submission_results"
        >
          Load Data
        </button>
      </div>

      <progress-bar
        v-if="d_loading_submission_results && d_submission_results_progress !== 0"
        :progress="d_submission_results_progress"
      />

      <div v-if="d_all_submissions_progress === 100">
        Count: {{d_submission_results.length}}
      </div>
      <table v-if="d_submission_result_stats !== null">
        <tr><td>Count:</td> <td class="descriptive-stat">{{d_submission_results.length}}</td></tr>
        <tr><td>Min:</td> <td class="descriptive-stat">{{d_submission_result_stats.min}}</td></tr>
        <tr><td>Q1:</td> <td class="descriptive-stat">{{d_submission_result_stats.q1}}</td></tr>
        <tr>
          <td>Q2 (Median):</td>
          <td class="descriptive-stat">{{d_submission_result_stats.median}}</td>
        </tr>
        <tr><td>Q3:</td> <td class="descriptive-stat">{{d_submission_result_stats.q3}}</td></tr>
        <tr><td>Max:</td> <td class="descriptive-stat">{{d_submission_result_stats.max}}</td></tr>
        <tr>
          <td>Mean:</td> <td class="descriptive-stat">{{d_submission_result_stats.mean}}</td>
        </tr>
        <tr>
          <td>Stdev:</td> <td class="descriptive-stat">{{d_submission_result_stats.stdev}}</td>
        </tr>
      </table>
      <submission-score-histogram
        v-if="d_submission_results.length !== 0"
        :submission_results="d_submission_results"
        @stats_updated="d_submission_result_stats = $event"
      />
    </div>

    <div class="stats-section">
      <div class="stats-header">
        Submissions over time
      </div>

      <div class="load-data-button-wrapper">
        <button
          type="button"
          class="blue-button"
          @click="load_all_submissions"
          :disabled="d_loading_all_submissions"
        >
          Load Data
        </button>
      </div>
      <progress-bar
        v-if="d_loading_all_submissions && d_all_submissions_progress !== 0"
        :progress="d_all_submissions_progress"
      />
      <submissions-over-time-graph
        v-if="d_all_submissions.length !== 0"
        :submissions="d_all_submissions"
      />
    </div>

    <div class="stats-section">
      <div class="stats-header">
        Pass/Fail Counts Per Test Case
      </div>

      <div class="load-data-button-wrapper">
        <button
          type="button"
          class="blue-button"
          @click="load_pass_fail_counts"
          :disabled="d_loading_submission_results"
        >
          Load Data
        </button>
      </div>
      <progress-bar
        v-if="d_loading_submission_results && d_submission_results_progress !== 0"
        :progress="d_submission_results_progress"
      />
      <pass-fail-counts
        ref="pass_fail_counts"
        v-if="d_submission_results.length !== 0"
        :project="project"
        :submission_results="d_submission_results"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import * as ag_cli from 'ag-client-typescript';

import ProgressBar from '@/components/progress_bar.vue';
import { handle_api_errors_async, handle_global_errors_async } from '@/error_handling';
import { toggle } from '@/utils';

import PassFailCounts from './pass_fail_counts.vue';
import SubmissionScoreHistogram from './submission_score_histogram';
import SubmissionsOverTimeGraph from './submissions_over_time_graph';

interface SubmissionResultsPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: {ultimate_submission: {results: ag_cli.SubmissionResultFeedback}}[];
}

@Component({
  components: {
    PassFailCounts,
    ProgressBar,
    SubmissionScoreHistogram,
    SubmissionsOverTimeGraph,
  }
})
export default class ProjectStats extends Vue {
  @Prop({type: ag_cli.Project, required: true})
  project!: ag_cli.Project;

  d_include_staff = true;

  d_loading_submission_results = false;
  d_submission_results_progress = 0;
  d_submission_results: ag_cli.SubmissionResultFeedback[] = [];
  d_submission_result_stats: {[key: string]: number} | null = null;

  d_loading_all_submissions = false;
  d_all_submissions_progress = 0;
  d_all_submissions: ag_cli.Submission[] = [];

  @handle_global_errors_async
  load_submission_results() {
    return toggle(this, 'd_loading_submission_results', async () => {
      this.d_submission_results = [];
      this.d_submission_results_progress = 0;
      let page_num = 1;
      let page_size = 200;

      let results = [];
      let page: SubmissionResultsPage;
      do {
        let response = await ag_cli.HttpClient.get_instance().get<SubmissionResultsPage>(
          `projects/${this.project.pk}/all_ultimate_submission_results/`
          + `?page=${page_num}&groups_per_page=${page_size}`
          + `&full_results=true&include_staff=${this.d_include_staff ? 'true' : 'false'}`
        );
        page = response.data;
        results.push(
          ...page.results.map(result => result.ultimate_submission.results)
        );

        page_num += 1;
        this.d_submission_results_progress = (results.length / page.count) * 100;
      } while (page.next !== null);

      this.d_submission_results = results;
    });
  }

  async load_pass_fail_counts() {
    await this.load_submission_results();
    await this.$nextTick();
    (<Vue> this.$refs['pass_fail_counts']).$el.scrollIntoView();
  }

  @handle_global_errors_async
  load_all_submissions() {
    return toggle(this, 'd_loading_all_submissions', async () => {
      this.d_all_submissions = [];
      this.d_all_submissions_progress = 0;
      let groups = await ag_cli.Group.get_all_from_project(this.project.pk);

      let num_loaded_groups = 0;
      let all_submissions = [];
      for (let group of groups) {
        let submissions = await ag_cli.Submission.get_all_from_group(group.pk);
        all_submissions.push(...submissions);
        num_loaded_groups += 1;
        this.d_all_submissions_progress = (num_loaded_groups / groups.length) * 100;
      }
      this.d_all_submissions = all_submissions;
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

.stats-header {
  @include section-header();

  margin: 1rem 0 .55rem;
  font-size: 1.25rem;
}

.descriptive-stat {
  text-align: right;
}
</style>
