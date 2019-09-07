<template>
  <div class="panel">
    <div :class="[`${hyphenate(correctness_level)}-panel-header`,
                  d_is_open ? 'panel-header-open' : 'panel-header-closed']"
         @click="toggle_d_is_open">

      <div class="column-1">{{name}}</div>
      <div class="column-2">
        <correctness-icon :correctness_level="correctness_level">
        </correctness-icon>
      </div>
      <div class="column-3">
        <span v-if="points_possible !== 0">
          {{points_awarded}}/{{points_possible}}
        </span>
      </div>

    </div>

    <div v-if="d_is_open" :class="`${hyphenate(correctness_level)}-panel-body`">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { hyphenate } from "@/components/project_admin/feedback_config_utils.ts";
import CorrectnessIcon, { CorrectnessLevel } from "@/components/project_view/submission_detail/correctness_icon.vue";

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

  d_is_open = false;

  readonly hyphenate = hyphenate;

  created() {
    if (this.panel_is_active) {
      this.toggle_d_is_open();
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
