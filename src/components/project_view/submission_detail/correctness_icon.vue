<template>
  <div id="correctness-icon">
    <div v-if="correctness_level === CorrectnessLevel.all_correct">
      <i class="fas fa-check"></i>
    </div>
    <div v-else-if="correctness_level === CorrectnessLevel.some_correct">
      <i class="fas fa-exclamation-triangle"></i>
    </div>
    <div v-else-if="correctness_level === CorrectnessLevel.none_correct">
      <i class="fas fa-times"></i>
    </div>
    <div v-else> </div>
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
}

</style>
