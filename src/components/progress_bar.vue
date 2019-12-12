<template>
  <div class="total-progress">
    <div class="completed-progress"
         :class="{'fully-round': processed_progress === 100}"
         :style="{'width': `${processed_progress}%`}"></div>
    <div class="progress-text">
      <template v-if="processed_progress === 100">
        <slot>
          Please wait...
        </slot>
      </template>
      <template v-else>{{processed_progress}}%</template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ProgressBar extends Vue {
  @Prop({required: true, type: Number})
  progress!: number;

  get processed_progress() {
    // In some cases (e.g. downloading files), the Content-Length response
    // header is not set properly. In those cases we fall back on the size
    // of the file, which is probably smaller than the size of the
    // full response. For those cases, we cap progress here at 100%.
    return Math.min(100, Math.round(this.progress));
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

$border-radius: 4px;

.total-progress {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  border: 1px solid $pebble-dark;
  overflow: visible;
  border-radius: $border-radius;
}

.completed-progress {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  background-color: lighten(teal, 20%);

  border-top-left-radius: $border-radius;
  border-bottom-left-radius: $border-radius;
}

.fully-round {
  border-radius: $border-radius;
}

.progress-text {
  z-index: 1;
  padding: .25rem;
}

</style>
