<template>
  <div class="panel">
    <div :class="[`${panel_correctness}-panel-header`,
                  {'multi-command-header': is_command},
                  d_is_open ? 'panel-header-open' : 'panel-header-closed']"
         @click="toggle_d_is_open">

      <template v-if="is_command">
        <div class="command-name">{{name}}</div>
        <div class="command-correctness">
          <correctness-icon :correctness_level="correctness_level">
          </correctness-icon>
        </div>
      </template>

      <template v-else>
        <div class="name">{{name}}</div>
        <div class="correctness">
          <correctness-icon :correctness_level="correctness_level">
          </correctness-icon>
        </div>
        <div class="points">
          <span v-if="points_possible !== 0"
                class="display-points">
            {{points_awarded}}/{{points_possible}}
          </span>
        </div>
      </template>

    </div>

    <div v-if="d_is_open" :class="`${panel_correctness}-panel-body`">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import CorrectnessIcon, { CorrectnessLevel } from "@/components/project_view/submission_detail/correctness_icon.vue";

export enum PanelCorrectnessLevel {
    not_available = "not-available",
    none_correct = 'none-correct',
    some_correct_partial_points = 'some-correct-partial-points',
    some_correct_full_points = 'some-correct-full-points',
    all_correct = 'all-correct'
}
@Component({
  components: {
    CorrectnessIcon
  }
})
export default class SubmissionDetailPanel extends Vue {
  @Prop({required: true, type: String})
  name!: string;

  @Prop({required: true, type: String})
  correctness_level!: CorrectnessLevel;

  @Prop({default: 0, type: Number})
  points_awarded!: number;

  @Prop({default: 0, type: Number})
  points_possible!: number;

  @Prop({default: false, type: Boolean})
  panel_is_active!: boolean;

  @Prop({default: false, type: Boolean})
  is_command!: boolean;

  @Prop({default: false, type: Boolean})
  is_within_case!: boolean;

  d_is_open = false;

  created() {
    if (this.panel_is_active) {
      this.toggle_d_is_open();
    }
  }

  get panel_correctness() {
    if (this.correctness_level === CorrectnessLevel.not_available) {
      return PanelCorrectnessLevel.not_available;
    }
    else if (this.correctness_level === CorrectnessLevel.all_correct) {
      return PanelCorrectnessLevel.all_correct;
    }
    else if (this.correctness_level === CorrectnessLevel.none_correct) {
      return PanelCorrectnessLevel.none_correct;
    }
    else {
      if (this.points_awarded === this.points_possible) {
        return PanelCorrectnessLevel.some_correct_full_points;
      }
      else {
        return PanelCorrectnessLevel.some_correct_partial_points;
      }
    }
  }

  toggle_d_is_open() {
    if (this.correctness_level !== CorrectnessLevel.not_available) {
      this.d_is_open = !this.d_is_open;
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/components/submission_detail.scss';
</style>
