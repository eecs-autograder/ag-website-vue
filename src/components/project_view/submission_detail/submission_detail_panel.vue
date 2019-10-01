<template>
  <div class="panel">
    <div :class="[`${panel_correctness}-panel-header`,
                  {'command-panel-header-open': d_is_open && is_command },
                  {'panel-header-open': d_is_open && !is_command },
                  {'panel-header-closed': !d_is_open }]"
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
    all_correct = 'all-correct',
    output_only = 'output-only',
    dont_check = 'dont-check'
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
    else if (this.correctness_level === CorrectnessLevel.output_only) {
      return PanelCorrectnessLevel.output_only;
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

@mixin panel_header($background-color: $white-gray, $border-color: $white-gray,
                    $cursor-option: pointer) {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
  background-color: $background-color;
  border: 1px solid $border-color;
  font-weight: bold;
  cursor: $cursor-option;
}

@mixin panel_header_hover($background-color: $white-gray, $border-color: $white-gray) {
  background-color: $background-color;
  border-color: $border-color;
}

@mixin panel_body($border-color: $white-gray) {
  background-color: white;
  border: 1px solid $border-color;
  border-top: none;
  border-radius: 0 0 3px 3px;
  padding: 7px 10px;
}

.panel {
  margin-bottom: 8px;
}

.panel-header-open {
  z-index: 2;
  border-radius: 3px 3px 0 0;
  position: sticky;
  top: 0;
}

.command-panel-header-open {
  border-radius: 3px 3px 0 0;
}

.panel-header-closed {
  border-radius: 3px;
}

%panel-column-padding {
  padding: 7px 10px;
}

.name {
  @extend %panel-column-padding;
  box-sizing: border-box;
  width: 60%;
  word-wrap: break-word;
}

.correctness {
  @extend %panel-column-padding;
  box-sizing: border-box;
  width: 20%;
}

.points {
  @extend %panel-column-padding;
  box-sizing: border-box;
  width: 20%;
}

.display-points {
  padding: 0 5px;
}

.command-name {
  @extend %panel-column-padding;
}

.command-correctness {
  @extend %panel-column-padding;
}

.multiple-command-panel-body {
  padding: 20px 20px 15px 20px !important;
  background-color: #f5f5f5 !important;
}

/* ---------------- Not Available Panel ---------------- */

$base-gray: darken($white-gray, 5);

.not-available-panel-header {
  @include panel_header($base-gray, darken($base-gray, 5), default);
  color: $stormy-gray-dark;
}

/* ---------------- None Correct Panel ---------------- */

$base-red: lighten($warning-red, 20);

.none-correct-panel-header {
  @include panel_header($base-red, darken($base-red, 5), pointer);
}

.none-correct-panel-header:hover {
  @include panel_header_hover(darken($base-red, 5), darken($base-red, 10));
}

.none-correct-panel-body {
  @include panel_body($base-red);
}

/* ---------------- Some Correct Panel ---------------- */

$base-orange: lighten($orange, 5);

.some-correct-panel-header {
  @include panel_header($base-orange, darken($base-orange, 5), pointer);
}

.some-correct-panel-header:hover {
  @include panel_header_hover(darken($base-orange, 5), darken($base-orange, 10));
}

.some-correct-panel-body {
  @include panel_body($base-orange);
}

/* ---------------- All Correct Panel ---------------- */

$base-blue: darken($light-blue, 2);

.all-correct-panel-header {
  @include panel_header($base-blue, darken($base-blue, 5), pointer);
}

.all-correct-panel-header:hover {
  @include panel_header_hover(darken($base-blue, 5), darken($base-blue, 10));
}

.all-correct-panel-body {
  @include panel_body($base-blue);
}

/* ---------------- Output Only Panel ---------------- */

$base-purple: hsl(255, 88%, 89%);

.output-only-panel-header {
  @include panel_header($base-purple, darken($base-purple, 5), pointer);
}

.output-only-panel-header:hover {
  @include panel_header_hover(darken($base-purple, 5), darken($base-purple, 10));
}

.output-only-panel-body {
  @include panel_body($base-purple);
}

</style>
