<template>
  <div id="correctness-icon">
    <div
      v-if="correctness_level === CorrectnessLevel.all_correct"
      class="correctness-level all-correct"
    >
      <i class="fas fa-check" role="img" aria-label="Correct"></i>
    </div>
    <div
      v-else-if="correctness_level === CorrectnessLevel.some_correct"
      class="correctness-level some-correct"
    >
      <i class="fas fa-times" role="img" aria-label="Partially correct"></i>
    </div>
    <div
      v-else-if="correctness_level === CorrectnessLevel.none_correct"
      class="correctness-level none-correct"
    >
      <i class="fas fa-times" role="img" aria-label="Incorrect"></i>
    </div>
    <div
      v-else-if="correctness_level === CorrectnessLevel.info_only"
      class="correctness-level info-only"
    ></div>
    <div v-else class="correctness-level not-available"></div>
  </div>
</template>

<script setup lang="ts">
import { CorrectnessLevel } from "@/components/project_view/submission_detail/correctness";

defineProps<{
  correctness_level: string;
}>();
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";

#correctness-icon {
  padding: 0 5px;
  display: inline-block;
}

.correctness-level {
  display: inline-block;
}
</style>
