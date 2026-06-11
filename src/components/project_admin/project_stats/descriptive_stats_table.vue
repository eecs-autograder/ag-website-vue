<template>
  <table class="stats-table">
    <tr><th scope="row" class="stat-name">Count</th> <td class="stat-value">{{values.length}}</td></tr>
    <template v-if="values.length !== 0">
      <tr><th scope="row" class="stat-name">Min</th> <td class="stat-value">{{to_precision(min)}}</td></tr>
      <tr><th scope="row" class="stat-name">Q1</th> <td class="stat-value">{{to_precision(q1)}}</td></tr>
      <tr>
        <th scope="row" class="stat-name">Median</th>
        <td class="stat-value">{{median}}</td>
      </tr>
      <tr><th scope="row" class="stat-name">Q3</th> <td class="stat-value">{{to_precision(q3)}}</td></tr>
      <tr><th scope="row" class="stat-name">Max</th> <td class="stat-value">{{to_precision(max)}}</td></tr>
      <tr>
        <th scope="row" class="stat-name">Mean</th> <td class="stat-value">{{to_precision(mean)}}</td>
      </tr>
      <tr>
        <th scope="row" class="stat-name">Stdev</th> <td class="stat-value">{{to_precision(stdev)}}</td>
      </tr>
    </template>
  </table>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class DescriptiveStatsTable extends Vue {
    @Prop({required: true})
    values!: number[];

    @Prop({default: 2})
    precision!: number;

    get mean() {
      let sum = this.values.reduce((total, current_val) => total + current_val, 0);
      return sum / this.values.length;
    }

    get median() {
      let sorted = this.sorted_values;

      if (sorted.length % 2 !== 0) {
        return sorted[Math.floor(sorted.length / 2)];
      }

      let left = Math.floor(sorted.length / 2);
      let right = left - 1;
      return (sorted[left] + sorted[right]) / 2;
    }

    get stdev() {
      let sum_of_squares = this.values.reduce(
        (sum, current_value) => sum + Math.pow((current_value - this.mean), 2),
        0
      );
      return Math.sqrt(sum_of_squares / this.values.length);
    }

    get min() {
      return Math.min(...this.values);
    }

    get max() {
      return Math.max(...this.values);
    }

    get q1() {
        return this.percentile(25);
    }

    get q3() {
      return this.percentile(75);
    }

    private percentile(p: number) {
      let rank = (p / 100) * (this.sorted_values.length - 1) + 1;
      let int_part = Math.floor(rank);
      let float_part = rank % 1;

      if (rank === 0) {
        // istanbul ignore next
        return 0;
      }
      if (rank === this.sorted_values.length) {
        return this.sorted_values[this.sorted_values.length - 1];
      }
      return this.sorted_values[int_part - 1]
        + float_part
        * (this.sorted_values[int_part] - this.sorted_values[int_part - 1]);
    }

    get sorted_values() {
      return this.values.slice().sort((first, second) => first - second);
    }

    to_precision(value: number) {
      if (Math.floor(value) === value) {
        return value;
      }

      return value.toFixed(this.precision);
    }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.stats-table {
  border-collapse: collapse;
  font-size: .875rem;

  th, td {
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
