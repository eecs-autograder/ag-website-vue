<template>
  <div class="submission-score-histogram">
    <div class="descriptive-stats-wrapper">
      <div class="stats">
        <div class="stats-title">All Students</div>
        <descriptive-stats-table :values="d_percentages"/>
      </div>
      <div class="stats">
        <div class="stats-title">Individuals Only</div>
        <descriptive-stats-table :values="d_individual_percentages"/>
      </div>
      <div class="stats">
        <div class="stats-title">Groups Only</div>
        <descriptive-stats-table :values="d_group_percentages"/>
      </div>
    </div>

    <submission-score-histogram-chart
      :all_percentages="d_percentages"
      :individual_percentages="d_individual_percentages"
      :group_percentages="d_group_percentages"
      :num_buckets="num_buckets"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { UltimateSubmissionEntry } from '../project_stats.vue';

import DescriptiveStatsTable from './descriptive_stats_table.vue';
import SubmissionScoreHistogramChart from './submission_score_histogram_chart';

@Component({
      components: {
        SubmissionScoreHistogramChart,
        DescriptiveStatsTable,
    }
})
export default class SubmissionScoreHistogram extends Vue {
  @Prop({required: true})
  ultimate_submission_entries!: UltimateSubmissionEntry[];

  // All scores
  d_percentages: number[] = [];
  // Scores for students working alone
  d_individual_percentages: number[] = [];
  // Scores for students working in a group
  d_group_percentages: number[] = [];

  readonly num_buckets = 20;

  mounted() {
    this.compute_percentages();
  }

  @Watch('ultimate_submission_entries')
  on_ultimate_submission_entries_changed() {
    this.compute_percentages();
  }

  compute_percentages() {
    let groups_seen = new Set<number>();
    for (let entry of this.ultimate_submission_entries) {
      let submission_result = entry.ultimate_submission.results;
      let percent = 0;
      let points_possible = Number(submission_result.total_points_possible);
      if (points_possible !== 0) {
        percent = Math.floor((Number(submission_result.total_points) / points_possible) * 100);
      }

      this.d_percentages.push(percent);

      if (entry.group.members.length === 1) {
        this.d_individual_percentages.push(percent);
      }
      else if (!groups_seen.has(entry.group.pk)) {
        this.d_group_percentages.push(percent);
        groups_seen.add(entry.group.pk);
      }
    }
  }
}
</script>

<style scoped lang="scss">
.descriptive-stats-wrapper {
  display: flex;
  flex-wrap: wrap;

  > .stats {
    margin-right: 4rem;
    margin-bottom: 1rem;
  }

  .stats-title {
    font-weight: bold;
    white-space: nowrap;
    word-wrap: none;
  }
}
</style>
