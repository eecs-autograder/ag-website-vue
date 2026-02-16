<template>
  <div class="collapsible" v-on="$listeners">
    <div
      class="panel"
      :class="[`level-${indentation_level}`, { active: is_active }]"
      @click="toggle_is_open"
    >
      <i
        v-if="include_caret"
        class="caret fas"
        :class="state.d_is_open ? 'fa-caret-down' : 'fa-caret-right'"
      ></i>
      <div class="text">
        <slot name="header_text"></slot>
      </div>
      <div class="icons" :class="{ 'always-visible': always_show_icons }">
        <slot name="header_icons"></slot>
      </div>
    </div>
    <template v-if="use_v_if">
      <div v-if="state.d_is_open" data-testid="collapsible_body">
        <slot></slot>
      </div>
    </template>
    <template v-else>
      <div v-show="state.d_is_open" data-testid="collapsible_body">
        <slot></slot>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";

interface PropTypes {
  start_open?: boolean;
  include_caret?: boolean;
  stay_open?: boolean;
  is_active?: boolean;
  indentation_level?: number | null;
  always_show_icons?: boolean;
  use_v_if?: boolean;
}

const props = withDefaults(defineProps<PropTypes>(), {
  start_open: false,
  include_caret: true,
  stay_open: false,
  is_active: false,
  indentation_level: 0,
  always_show_icons: false,
  use_v_if: false,
});

const state = reactive({
  d_is_open: props.start_open,
});

function toggle_is_open() {
  if (state.d_is_open && !props.stay_open) {
    state.d_is_open = false;
  } else {
    state.d_is_open = true;
  }
}

defineExpose({
  state,
  toggle_is_open,
});
</script>

<style scoped lang="scss">
@import "@/styles/list_panels.scss";

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

@include list-panels($always-show-icons: false);

.always-visible.icons {
  visibility: visible;
}

.caret {
  width: 1em;
}
</style>
