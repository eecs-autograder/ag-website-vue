<template>
  <div id="correctness-icon">
    <div v-if="correctness_level === CorrectnessLevel.all_correct"
         class="correctness-level all-correct">
      <i class="fas fa-check"></i>
    </div>
    <div v-else-if="correctness_level === CorrectnessLevel.some_correct"
         class="correctness-level some-correct">
      <i class="fas fa-times"></i>
    </div>
    <div v-else-if="correctness_level === CorrectnessLevel.none_correct"
         class="correctness-level none-correct">
      <i class="fas fa-times"></i>
    </div>
    <div v-else
         class="correctness-level not-available"> </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

export enum CorrectnessLevel {
  not_available = "not available",
  none_correct = 'none correct',
  some_correct = 'some correct',
  all_correct = 'all correct'
}

@Component
export default class CorrectnessIcon extends Vue {
  @Prop({required: true, type: String})
  correctness_level!: string;

  readonly CorrectnessLevel = CorrectnessLevel;
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

#correctness-icon {
  padding: 0 5px;
  display: inline-block;
}

.all-correct {
  //color: darken($ocean-blue, 20);
}

.some-correct {
  //color: darken(darkorange, 30);
}

.none-correct {
  //color: darkred;
}

.correctness-level {
  display: inline-block;
}

</style>
