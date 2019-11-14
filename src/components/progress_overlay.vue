<template>
  <div class="progress-overlay">
    <i v-if="progress === null" class="fa fa-spinner fa-pulse"></i>
    <progress-bar v-else
                  class="progress"
                  :progress="progress"></progress-bar>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import ProgressBar from '@/components/progress_bar.vue';

@Component({
  components: {
    ProgressBar,
  }
})
export default class  extends Vue {
  @Prop({required: true, type: Number})
  progress!: number | null;
}
</script>

<style scoped lang="scss">

.progress-overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  cursor: default;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, .5);

  .fa-spinner {
    color: white;
    font-size: 50px;
  }

  .progress {
    background-color: white;
    width: 75%;
    border: none;
  }
}

</style>
