<template>
  <table class="stats-table">
    <tr>
      <th scope="row" class="stat-name">Count</th>
      <td class="stat-value">{{ values.length }}</td>
    </tr>
    <template v-if="values.length !== 0">
      <tr>
        <th scope="row" class="stat-name">Min</th>
        <td class="stat-value">{{ to_precision(min) }}</td>
      </tr>
      <tr>
        <th scope="row" class="stat-name">Q1</th>
        <td class="stat-value">{{ to_precision(q1) }}</td>
      </tr>
      <tr>
        <th scope="row" class="stat-name">Median</th>
        <td class="stat-value">{{ median }}</td>
      </tr>
      <tr>
        <th scope="row" class="stat-name">Q3</th>
        <td class="stat-value">{{ to_precision(q3) }}</td>
      </tr>
      <tr>
        <th scope="row" class="stat-name">Max</th>
        <td class="stat-value">{{ to_precision(max) }}</td>
      </tr>
      <tr>
        <th scope="row" class="stat-name">Mean</th>
        <td class="stat-value">{{ to_precision(mean) }}</td>
      </tr>
      <tr>
        <th scope="row" class="stat-name">Stdev</th>
        <td class="stat-value">{{ to_precision(stdev) }}</td>
      </tr>
    </template>
  </table>
</template>

<script setup lang="ts">
import { computed } from "vue";

type PropTypes = {
  values: number[];
  precision?: number;
};

const props = withDefaults(defineProps<PropTypes>(), {
  precision: 2,
});

const sorted_values = computed(() =>
  props.values.slice().sort((first, second) => first - second),
);

const mean = computed(() => {
  let sum = props.values.reduce((total, current_val) => total + current_val, 0);
  return sum / props.values.length;
});

const median = computed(() => {
  let sorted = sorted_values.value;

  if (sorted.length % 2 !== 0) {
    return sorted[Math.floor(sorted.length / 2)];
  }

  let left = Math.floor(sorted.length / 2);
  let right = left - 1;
  return (sorted[left] + sorted[right]) / 2;
});

const stdev = computed(() => {
  let sum_of_squares = props.values.reduce(
    (sum, current_value) => sum + Math.pow(current_value - mean.value, 2),
    0,
  );
  return Math.sqrt(sum_of_squares / props.values.length);
});

const min = computed(() => Math.min(...props.values));
const max = computed(() => Math.max(...props.values));

function percentile(p: number) {
  let rank = (p / 100) * (sorted_values.value.length - 1) + 1;
  let int_part = Math.floor(rank);
  let float_part = rank % 1;

  if (rank === 0) {
    // istanbul ignore next
    return 0;
  }
  if (rank === sorted_values.value.length) {
    return sorted_values.value[sorted_values.value.length - 1];
  }
  return (
    sorted_values.value[int_part - 1] +
    float_part *
      (sorted_values.value[int_part] - sorted_values.value[int_part - 1])
  );
}

const q1 = computed(() => percentile(25));
const q3 = computed(() => percentile(75));

function to_precision(value: number) {
  if (Math.floor(value) === value) {
    return value;
  }

  return value.toFixed(props.precision);
}
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";

.stats-table {
  border-collapse: collapse;
  font-size: 0.875rem;

  th,
  td {
    border: 1px solid $pebble-dark;
    padding: 0.375rem;
  }

  .stat-name {
    padding-right: 1rem;
  }
}

.stat-value {
  text-align: right;
}
</style>
