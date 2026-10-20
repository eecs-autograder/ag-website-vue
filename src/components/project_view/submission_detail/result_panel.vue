<template>
  <tbody class="panel">
    <tr :class="[`${panel_correctness}-panel-header`,
                 {'panel-header-open': d_is_open },
                 {'panel-header-closed': !d_is_open },
                 {'pinned': d_is_open && !is_command && d_body_is_below_header }]"
        ref="header"
        @click="toggle_d_is_open">
      <th scope="row" class="name">
        <button type="button"
                class="toggle-button"
                :disabled="!can_open"
                :aria-controls="panel_body_uid"
                :aria-expanded="d_is_open">{{name}}</button>
      </th>
      <td class="correctness">
        <correctness-icon :correctness_level="correctness_level">
        </correctness-icon>
      </td>
      <td :class="['points', {'command-points': is_command}]">
        <span v-if="points_possible !== 0" class="display-points">
          {{points_awarded}}/{{points_possible}}
        </span>
      </td>
    </tr>

    <!-- Outer v-show so that aria-controls has something to reference. -->
    <!-- Inner v-if so that the inner component doesn't send requests until
         the panel is open. -->
    <tr v-show="d_is_open" :id="panel_body_uid" ref="body">
      <td colspan="3"
          :class="[`${panel_correctness}-panel-body`,
                   {'multiple-command-panel-body': is_multi_command_case}]">
        <div v-if="d_is_open">
          <slot></slot>
        </div>
      </td>
    </tr>
  </tbody>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness';
import CorrectnessIcon from "@/components/project_view/submission_detail/correctness_icon.vue";
import { generate_uid } from '@/utils';

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
  d_body_is_below_header = true;
  d_body_observer: IntersectionObserver | null = null;

  created() {
    this.d_is_open = this.open_initially;
  }

  mounted() {
    this.update_body_observer();
  }

  beforeDestroy() {
    this.d_body_observer?.disconnect();
  }

  @Watch('d_is_open')
  on_is_open_changed() {
    this.update_body_observer();
  }

  // Sticky table rows are bounded by the whole table rather than their
  // <tbody>, so without this an open header would stay pinned over the
  // panels below it after its own body scrolls out of view.
  private update_body_observer() {
    this.d_body_observer?.disconnect();
    this.d_body_observer = null;
    if (!this.d_is_open || this.is_command) {
      return;
    }

    let header_height = (<HTMLElement> this.$refs.header).offsetHeight;
    this.d_body_observer = new IntersectionObserver(
      ([entry]) => {
        this.d_body_is_below_header = entry.isIntersecting;
      },
      {rootMargin: `-${header_height}px 0px 0px 0px`}
    );
    this.d_body_observer.observe(<HTMLElement> this.$refs.body);
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

  get panel_body_uid() {
    return `result-panel-${generate_uid()}`;
  }

  get can_open() {
    return this.correctness_level !== CorrectnessLevel.not_available;
  }

  toggle_d_is_open() {
    let top = this.$el.getBoundingClientRect().top;
    if (this.can_open) {
      this.d_is_open = !this.d_is_open;
    }
    // This prevents any open panels below this one from being pushed
    // into the top of the viewport due to the size change of the parent.
    // istanbul ignore next
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

$border-radius-value: 3px;

@mixin panel_header($background-color: $white-gray,
                    $border-color: $white-gray,
                    $is_not_available: false) {
  font-weight: bold;

  > th, > td {
    background-color: $background-color;
    border-top: 1px solid $border-color;
    border-bottom: 1px solid $border-color;
  }

  > :first-child {
    border-left: 1px solid $border-color;
  }

  > :last-child {
    border-right: 1px solid $border-color;
  }

  @if $is_not_available {
    cursor: default;
  }
  @else {
    cursor: pointer;
    &:hover > th, &:hover > td {
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

// Table rows can't have margins, so this stands in for the gap between panels.
.panel::after {
  content: '';
  display: table-row;
  height: 8px;
}

.pinned {
  z-index: 2;
  position: sticky;
  top: 0;
}

.panel-header-open {
  > :first-child {
    border-top-left-radius: $border-radius-value;
  }
  > :last-child {
    border-top-right-radius: $border-radius-value;
  }
}

.panel-header-closed {
  > :first-child {
    border-radius: $border-radius-value 0 0 $border-radius-value;
  }
  > :last-child {
    border-radius: 0 $border-radius-value $border-radius-value 0;
  }
}

.toggle-button {
  background: none;
  border: none;
  padding: 0;
  cursor: inherit;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
  text-align: left;
  width: 100%;
  overflow-wrap: anywhere;
  user-select: text;

  &:focus-visible {
    outline: none;
  }
}

tr:has(> th > .toggle-button:focus-visible) {
  outline-style: auto;
}

.name, .correctness, .points {
  padding: 7px 10px;
  text-align: left;
}

.command-points {
  font-weight: normal;
}

.display-points {
  padding: 0 5px;
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
