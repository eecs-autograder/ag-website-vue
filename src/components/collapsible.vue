<template>
  <div class="collapsible" v-on="$listeners">
    <div class="panel"
         :class="[
          `level-${indentation_level}`,
          {'active': is_active}
         ]"
         @click="toggle_is_open">
      <i v-if="include_caret"
         class="caret fas"
         :class="d_is_open ? 'fa-caret-down' : 'fa-caret-right'"></i>
      <div class="text">
        <slot name="header_text"></slot>
      </div>
      <div class="icons" :class="{'always-visible': always_show_icons}">
        <slot name="header_icons"></slot>
      </div>
    </div>
    <template v-if="use_v_if">
      <div v-if="d_is_open" data-testid="collapsible_body">
        <slot></slot>
      </div>
    </template>
    <template v-else>
      <div v-show="d_is_open" data-testid="collapsible_body">
        <slot></slot>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Collapsible extends Vue {
  @Prop({default: false, type: Boolean})
  start_open!: boolean;

  @Prop({default: true, type: Boolean})
  include_caret!: boolean;

  // When true, this collapsible will stay open even when clicked on.
  // Once this value becomes false, it will be able to close again.
  @Prop({default: false, type: Boolean})
  stay_open!: boolean;

  // When true, the collapsible's header panel will be highlighted to
  // indicate that it is active.
  @Prop({default: false, type: Boolean})
  is_active!: boolean;

  // Used to configure styling of the collapsible's header panel indentation level.
  // Note that it does not affect the indentation of the collapsible's
  // body.
  // Valid values are null and the numbers 0, 1, 2, and 3.
  // Note that indentation level 0 adds a small amount of visual left padding,
  // while null adds no left padding.
  @Prop({default: 0, type: Number, validator: val => val === null || (val >= 0 && val <= 3)})
  indentation_level!: number;

  // When true, the header_icons_slot will always be visible.
  // When false, the header_icons slot will only be visible when the user
  // hovers over the header panel or when this.is_active is true.
  @Prop({default: false, type: Boolean})
  always_show_icons!: boolean;

  // When true, the body of the collapsible will be wrapped
  // in a v-if instead of v-show.
  @Prop({default: false, type: Boolean})
  use_v_if!: boolean;

  private d_is_open = this.start_open;

  toggle_is_open() {
    if (this.d_is_open && !this.stay_open) {
      this.d_is_open = false;
    }
    else {
      this.d_is_open = true;
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/list_panels.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

@include list-panels(
  $always-show-icons: false  // DO NOT CHANGE THIS VALUE
);

// We if the prop always_show_icons is true, we want this value
// to override the style rules from list-panels;
.always-visible.icons {
  visibility: visible;
}

.caret {
  width: 1em;
}
</style>
