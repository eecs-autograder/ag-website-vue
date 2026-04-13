<template>
  <div class="collapsible" v-on="$listeners">
    <div
      class="panel"
      :class="[`level-${indentation_level}`, { active: is_active }]"
      tabindex="0"
      role="button"
      :aria-controls="body_id"
      :aria-expanded="state.is_open"
      @click="toggle_is_open"
      @keypress.space.prevent="toggle_is_open"
      @keypress.enter="toggle_is_open"
    >
      <i
        v-if="include_caret"
        class="caret fas"
        :class="state.is_open ? 'fa-caret-down' : 'fa-caret-right'"
      ></i>
      <div class="text">
        <slot name="header_text"></slot>
      </div>
      <div class="icons" :class="{ 'always-visible': always_show_icons }">
        <slot name="header_icons"></slot>
      </div>
    </div>
    <template v-if="use_v_if">
      <div v-if="state.is_open" data-testid="collapsible_body" :id="body_id">
        <slot></slot>
      </div>
    </template>
    <template v-else>
      <div v-show="state.is_open" data-testid="collapsible_body" :id="body_id">
        <slot></slot>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { generate_uid } from "@/utils";
import { computed, reactive } from "vue";

interface PropTypes {
  start_open?: boolean;
  include_caret?: boolean;

  // When true, this collapsible will stay open even when clicked on.
  // Once this value becomes false, it will be able to close again.
  stay_open?: boolean;

  // When true, the collapsible's header panel will be highlighted to
  // indicate that it is active.
  is_active?: boolean;

  // Used to configure styling of the collapsible's header panel indentation level.
  // Note that it does not affect the indentation of the collapsible's
  // body.
  // Valid values are null and the numbers 0, 1, 2, and 3.
  // Note that indentation level 0 adds a small amount of visual left padding,
  // while null adds no left padding.
  indentation_level?: number | null;

  // When true, the header_icons_slot will always be visible.
  // When false, the header_icons slot will only be visible when the user
  // hovers over the header panel or when this.is_active is true.
  always_show_icons?: boolean;

  // When true, the body of the collapsible will be wrapped
  // in a v-if instead of v-show.
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
  is_open: props.start_open,
});

function toggle_is_open() {
  if (state.is_open && !props.stay_open) {
    state.is_open = false;
  } else {
    state.is_open = true;
  }
}

const body_id = computed(() => {
  return `collapsible-body-${generate_uid()}`;
});

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

// DO NOT CHANGE THIS VALUE
@include list-panels($always-show-icons: false);

// We if the prop always_show_icons is true, we want this value
// to override the style rules from list-panels;
.always-visible.icons {
  visibility: visible;
}

.caret {
  width: 1em;
}
</style>
