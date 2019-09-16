<template>
  <div class="panel">
    <div :class="[`${panel_correctness}-panel-header`,
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

    <div v-if="d_is_open"
         :class="[`${panel_correctness}-panel-body`,
                  {'multiple-command-panel-body': is_multi_command_case},
                  {'command-panel-body': is_command}]">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import CorrectnessIcon, { CorrectnessLevel } from "@/components/project_view/submission_detail/correctness_icon.vue";

export enum PanelCorrectnessLevel {
    not_available = "not-available",
    none_correct = 'none-correct',
    some_correct = 'some-correct',
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
  is_multi_command_case!: boolean;

  d_correctness_level: CorrectnessLevel = CorrectnessLevel.none_correct;
  d_panel_is_active = false;
  d_is_open = false;

  @Watch('panel_is_active')
  on_panel_is_active_change(new_value: boolean, old_value: boolean) {
    this.d_panel_is_active = new_value;
    this.d_is_open = this.d_panel_is_active;
  }

  @Watch('correctness_level')
  on_correctness_level_change(new_value: CorrectnessLevel, old_value: CorrectnessLevel) {
    this.d_correctness_level = new_value;
  }

  created() {
    this.d_correctness_level = this.correctness_level;
    this.d_panel_is_active = this.panel_is_active;
    this.d_is_open = this.d_panel_is_active;
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
    return PanelCorrectnessLevel.some_correct;
  }

  toggle_d_is_open() {
    if (this.correctness_level !== CorrectnessLevel.not_available) {
      this.d_is_open = !this.d_is_open;
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.panel {
  margin-bottom: 5px;
}

.panel-header-open {
  border-radius: 3px 3px 0 0;
}

.panel-header-closed {
  border-radius: 3px;
}

%panel-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
  border: 1px solid;
  font-weight: bold;
}

.name {
  box-sizing: border-box;
  width: 60%;
  padding: 7px 10px;
  word-wrap: break-word;
}

.correctness {
  box-sizing: border-box;
  width: 20%;
  padding: 7px 10px;
}

.points {
  box-sizing: border-box;
  width: 20%;
  padding: 7px 10px;
}

.command-name {
  padding: 7px 10px;
}

.command-correctness {
  padding: 7px 10px;
}

%panel-body {
  padding: 7px 10px;
  background-color: $white-gray;
  border-radius: 0 0 3px 3px;
  border: 1px solid darken(white, 5);
}

$base-gray: darken($white-gray, 5);

.not-available-panel-header {
  @extend %panel-header;
  background-color: $base-gray;
  cursor: default;
  color: $stormy-gray-dark;
  border-color: darken($base-gray, 5);
}

$base-red: lighten($warning-red, 25);

.none-correct-panel-header {
  @extend %panel-header;
  cursor: pointer;
  background-color: $base-red;
  border-color: darken($base-red, 5);
}

.none-correct-panel-header:hover {
  background-color: darken($base-red, 5);
  border-color: darken($base-red, 10);
}

.none-correct-panel-body {
  @extend %panel-body;
}

$base-orange: $orange;

.some-correct-panel-header {
  @extend %panel-header;
  cursor: pointer;
  background-color: $base-orange;
  border-color: darken($base-orange, 10);
}

.some-correct-panel-header:hover {
  background-color: darken($base-orange, 10);
  border-color: darken($base-orange, 15);
}

.some-correct-panel-body {
  @extend %panel-body;
}

$base-blue: darken($light-blue, 2);

.all-correct-panel-header {
  @extend %panel-header;
  cursor: pointer;
  background-color: $base-blue;
  border-color: darken($base-blue, 5);
}

.all-correct-panel-header:hover {
  background-color: darken($base-blue, 5);
  border-color: darken($base-blue, 10);
}

.all-correct-panel-body {
  @extend %panel-body;
}

@mixin panel-body-border($border-color: $white-gray) {
  border-radius: 0 0 3px 3px;
}

.multiple-command-panel-body {
  padding: 20px 20px 15px 20px;
}

.command-panel-body {
  background-color: white;
}
</style>
