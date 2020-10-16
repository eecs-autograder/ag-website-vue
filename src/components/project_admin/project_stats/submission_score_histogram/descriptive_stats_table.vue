<template>
  <table class="stats-table">
    <tr><td class="stat-name">Count:</td> <td class="stat-value">{{percentages.length}}</td></tr>
    <tr><td class="stat-name">Min:</td> <td class="stat-value">{{min}}</td></tr>
    <tr><td class="stat-name">Q1:</td> <td class="stat-value">{{q1}}</td></tr>
    <tr>
      <td class="stat-name">Median:</td>
      <td class="stat-value">{{median}}</td>
    </tr>
    <tr><td class="stat-name">Q3:</td> <td class="stat-value">{{q3}}</td></tr>
    <tr><td class="stat-name">Max:</td> <td class="stat-value">{{max}}</td></tr>
    <tr>
      <td class="stat-name">Mean:</td> <td class="stat-value">{{mean}}</td>
    </tr>
    <tr>
      <td class="stat-name">Stdev:</td> <td class="stat-value">{{stdev}}</td>
    </tr>
  </table>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class DescriptiveStatsTable extends Vue {
    @Prop({required: true})
    percentages!: number[];

    get mean() {
      let sum = this.percentages.reduce((total, current_val) => total + current_val, 0);
      return Math.floor(sum / this.percentages.length);
    }

    get median() {
      let sorted = this.sorted_percentages;
      if (sorted.length === 0) {
        return null;
      }

      if (sorted.length % 2 !== 0) {
        return sorted[Math.floor(sorted.length / 2)];
      }

      let left = Math.floor(sorted.length / 2);
      let right = left - 1;
      return (sorted[left] + sorted[right]) / 2;
    }

    get stdev() {
      if (this.percentages.length === 0) {
        return null;
      }

      let sum_of_squares = this.percentages.reduce(
        (sum, current_value) => sum + Math.pow((current_value - this.mean), 2),
        0
      );
      return Math.sqrt(sum_of_squares / this.percentages.length).toFixed(2);
    }

    get min() {
      return Math.min(...this.percentages).toFixed(2);
    }

    get max() {
      return Math.max(...this.percentages).toFixed(2);
    }

    get q1() {
        return this.percentile(this.sorted_percentages, 25);
    }

    get q3() {
      return this.percentile(this.sorted_percentages, 75);
    }

    percentile(sorted_percentages: number[], p: number) {
      let rank = (p / 100) * (sorted_percentages.length - 1) + 1;
      let int_part = Math.floor(rank);
      let float_part = rank % 1;

      if (rank === 0) {
        return 0;
      }
      if (rank === sorted_percentages.length) {
        return sorted_percentages[sorted_percentages.length - 1];
      }
      return sorted_percentages[int_part - 1]
        + float_part
        * (sorted_percentages[int_part] - sorted_percentages[int_part - 1]);
    }

    get sorted_percentages() {
      return this.percentages.slice().sort((first, second) => first - second);
    }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.stats-table {
  border-collapse: collapse;
  font-size: .875rem;

  td {
    border: 1px solid $pebble-dark;
    padding: .375rem;
  }

  .stat-name {
    padding-right: 1rem;
  }
}


.stat-value {
  text-align: right;
}

</style>
