<template>
  <div id="total-progress">
    <div id="completed-progress" :style="{'width': `${progress}%`}">
      <div id="progress-text">
        <template v-if="progress === 100">
          <slot name="finishing_text">
            Please wait...
          </slot>
        </template>
        <template v-else>{{progress}}%</template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ProgressBar extends Vue {
  @Prop({required: true, type: Number})
  progress!: number;
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

#total-progress {
  width: 100%;
  border: 1px solid $pebble-medium;
  border-radius: 4px;
  background-color: lighten($stormy-gray-light, 5%);
}

#completed-progress {
  background-color: darken($sky-blue, 15%);
}

#progress-text {
  text-align: center;
  color: white;
  padding: 8px;
}

</style>
