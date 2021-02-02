<template>
  <div class="submission-score-histogram">
    <div class="descriptive-stats-wrapper">
      <div class="stats">
        <div class="stats-title">All Students</div>
        <descriptive-stats-table :values="percentages"/>
      </div>
      <div class="stats">
        <div class="stats-title">Individuals Only</div>
        <descriptive-stats-table :values="individual_percentages"/>
      </div>
      <div class="stats">
        <div class="stats-title">Groups Only</div>
        <descriptive-stats-table :values="group_percentages"/>
      </div>
    </div>

    <submission-score-histogram-chart
      :all_percentages="percentages"
      :individual_percentages="individual_percentages"
      :group_percentages="group_percentages"
      :num_buckets="num_buckets"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { FullUltimateSubmissionResult } from 'ag-client-typescript';

import DescriptiveStatsTable from '../descriptive_stats_table.vue';

import SubmissionScoreHistogramChart from './submission_score_histogram_chart';

@Component({
  components: {
    SubmissionScoreHistogramChart,
    DescriptiveStatsTable,
  }
})
export default class SubmissionScoreHistogram extends Vue {
  @Prop({required: true})
  ultimate_submission_entries!: FullUltimateSubmissionResult[];

  readonly num_buckets = 20;

  // All scores
  get percentages(): number[] {
    return this.percentages_by_entry.map(tuple => tuple[1]);
  }

  // Scores for students working alone
  get individual_percentages(): number[] {
    return this.percentages_by_entry.filter(tuple => {
      let [entry, percent] = tuple;
      return entry.group.members.length === 1;
    }).map(tuple => tuple[1]);
  }

  // Scores for students working in a group
  get group_percentages(): number[] {
    let groups_seen = new Set<number>();
    let result: number[] = [];

    for (let [entry, percent] of this.percentages_by_entry) {
      if (entry.group.members.length !== 1 && !groups_seen.has(entry.group.pk)) {
        result.push(percent);
        groups_seen.add(entry.group.pk);
      }
    }

    return result;
  }

  get percentages_by_entry(): [FullUltimateSubmissionResult, number][] {
    return this.ultimate_submission_entries.reduce(
      (so_far, entry) => {
        if (entry.ultimate_submission === null) {
          return so_far;
        }
        let submission_result = entry.ultimate_submission.results;
        let percent = 0;
        let points_possible = Number(submission_result.total_points_possible);
        if (points_possible !== 0) {
          percent = Math.floor((Number(submission_result.total_points) / points_possible) * 100);
        }

        so_far.push([entry, percent]);
        return so_far;
      },
      [] as [FullUltimateSubmissionResult, number][]
    );
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
