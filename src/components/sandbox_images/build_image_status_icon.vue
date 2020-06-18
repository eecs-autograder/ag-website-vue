<template>
  <span v-if="status === BuildImageStatus.queued" class="queued-symbol">Q</span>
  <i v-else-if="status === BuildImageStatus.in_progress"
     class="fas fa-wrench"></i>
  <i v-else-if="status === BuildImageStatus.done"
     class="fas fa-check"></i>
  <i v-else-if="status === BuildImageStatus.failed"
     class="fas fa-times"></i>
  <i v-else-if="status === BuildImageStatus.image_invalid"
     class="fas fa-times"></i>
  <i v-else-if="status === BuildImageStatus.cancelled"
     class="fas fa-eject"></i>
  <i v-else-if="status === BuildImageStatus.internal_error"
     class="fas fa-skull"></i>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { BuildImageStatus } from 'ag-client-typescript';

@Component
export default class BuildStatusIcon extends Vue {
  @Prop({required: true, type: String})
  status!: BuildImageStatus;

  readonly BuildImageStatus = BuildImageStatus;
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.queued-symbol {
  font-weight: bold;
  color: darken($sky-blue, 10%);
}

.fa-wrench {
  color: $ocean-blue;
}

.fa-check {
  color: green;
}

.fa-eject {
  color: $orange;
}

.fa-skull, .fa-times {
  color: crimson;
}
</style>
