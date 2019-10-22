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

import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness';
import CorrectnessIcon from "@/components/project_view/submission_detail/correctness_icon.vue";

@Component({
  components: {
    CorrectnessIcon
  }
})
export default class ResultPanel extends Vue {
  @Prop({required: true, type: String})
  name!: string;

  @Prop({required: true, type: String})
  correctness_level!: CorrectnessLevel;

  @Prop({default: 0, type: Number})
  points_awarded!: number;

  @Prop({default: 0, type: Number})
  points_possible!: number;

  @Prop({default: false, type: Boolean})
  open_initially!: boolean;

  @Prop({default: false, type: Boolean})
  is_command!: boolean;

  @Prop({default: false, type: Boolean})
  is_multi_command_case!: boolean;

  d_is_open = false;

  created() {
    this.d_is_open = this.open_initially;
  }

  get panel_correctness() {
    if (this.correctness_level === CorrectnessLevel.not_available) {
      return CorrectnessLevel.not_available;
    }
    else if (this.correctness_level === CorrectnessLevel.all_correct) {
      return CorrectnessLevel.all_correct;
    }
    else if (this.correctness_level === CorrectnessLevel.none_correct) {
      return CorrectnessLevel.none_correct;
    }
    else if (this.correctness_level === CorrectnessLevel.info_only) {
      return CorrectnessLevel.info_only;
    }
    return CorrectnessLevel.some_correct;
  }

  toggle_d_is_open() {
    let top = this.$el.getBoundingClientRect().top;
    if (this.correctness_level !== CorrectnessLevel.not_available) {
      this.d_is_open = !this.d_is_open;
    }
    // This prevents any open panels below this one from being pushed
    // into the top of the viewport due to the size change of the parent.
    if (!this.d_is_open && top < 0) {
      this.$nextTick(() => {
        this.$el.scrollIntoView();
      });
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

@mixin panel_header($background-color: $white-gray,
                    $border-color: $white-gray,
                    $is_not_available: false) {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
  background-color: $background-color;
  border: 1px solid $border-color;
  font-weight: bold;

  @if $is_not_available {
    cursor: default;
  }
  @else {
    cursor: pointer;
    &:hover {
      background-color: darken($background-color, 5);
      border-color: darken($background-color, 10);
    }
  }
}

@mixin panel_body($border-color: $white-gray) {
  background-color: white;
  border: 1px solid $border-color;
  border-top: none;
  border-radius: 0 0 $border-radius-value $border-radius-value;
  padding: 7px 10px;
}

$border-radius-value: 3px;

.panel {
  margin-bottom: 8px;
}

.panel-header-open {
  z-index: 2;
  border-radius: $border-radius-value $border-radius-value 0 0;
  position: sticky;
  top: 0;
}

.command-panel-header-open {
  border-radius: $border-radius-value $border-radius-value 0 0;
}

.panel-header-closed {
  border-radius: $border-radius-value;
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
  background: linear-gradient(30deg, darken(white, 1), darken(white, 2)) !important;
}

/* ---------------- Not Available Panel ---------------- */

$not-available-color: darken($white-gray, 5);

.not-available-panel-header {
  @include panel_header($not-available-color, darken($not-available-color, 5), true);
  color: $stormy-gray-dark;
}

/* ---------------- None Correct Panel ---------------- */

$none-correct-color: lighten($warning-red, 20);

.none-correct-panel-header {
  @include panel_header($none-correct-color, darken($none-correct-color, 5));
}

.none-correct-panel-body {
  @include panel_body($none-correct-color);
}

/* ---------------- Some Correct Panel ---------------- */

$some-correct-color: lighten($orange, 5);

.some-correct-panel-header {
  @include panel_header($some-correct-color, darken($some-correct-color, 5));
}

.some-correct-panel-body {
  @include panel_body($some-correct-color);
}

/* ---------------- All Correct Panel ---------------- */

$all-correct-color: darken($light-blue, 2);

.all-correct-panel-header {
  @include panel_header($all-correct-color, darken($all-correct-color, 5));
}

.all-correct-panel-body {
  @include panel_body($all-correct-color);
}

/* ---------------- Info Only Panel ---------------- */

$info-only-color: desaturate($all-correct-color, 50%);

.info-only-panel-header {
  @include panel_header($info-only-color, darken($info-only-color, 5));
}

.info-only-panel-body {
  @include panel_body($info-only-color);
}

</style>
