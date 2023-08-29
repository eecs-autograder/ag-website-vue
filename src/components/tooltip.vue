<template>
  <span class="tooltip">
    <!-- The content (text or otherwise) that the user must hover over -->
    <slot name="trigger">
      <i class="default-icon fas fa-question-circle"></i>
    </slot>

    <!-- The tooltip text -->
    <div ref="tooltip_text"
         class="text"
         :class="['width-' + width, 'position-' + placement]">
      <slot></slot>
    </div>
    <div class="caret" :class="['position-' + placement]"></div>
  </span>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Tooltip extends Vue {
  @Prop({
    default: "top",
    type: String,
    validator: value => ['top', 'bottom', 'left', 'right'].includes(<string> value)
  })
  placement!: 'top' | 'bottom' | 'left' | 'right';

  @Prop({
    default: "small",
    type: String,
    validator: value => ['small', 'medium', 'large'].includes(<string> value)
  })
  width!: 'small' | 'medium' | 'large';

  mounted() {
    if (this.placement === 'top' || this.placement === 'bottom') {
      let tooltip_text = (<HTMLElement> this.$refs.tooltip_text);
      let right = tooltip_text.getBoundingClientRect().right;

      // Adjust the horizontal positioning if needed to prevent overflow.
      // istanbul ignore next
      if (right > document.body.clientWidth) {
        let correction = right - document.body.clientWidth;
        // !! IMPORTANT !! The "8" in this calculation
        // has to match the $padding SCSS variable defined
        // in this component's <style> tag.
        tooltip_text.style.left = `-${correction + 8}px`;
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/global.scss';

// Using px in this component is acceptable due to the placement calculations
// required.

$background-color: darken($stormy-gray-dark, 3%);

$padding: 8px;
$caret-size: 5px;
$font-size: .875rem;
$line-height: 1.2;

* {
  box-sizing: border-box;
}

// Helps position the text such that there is room for
// the caret.
$text-position: calc(100% + #{$caret-size});

.default-icon {
  color: darken($ocean-blue, 10%);
}

.tooltip {
  position: relative;
  margin: 0 .25rem;

  .text, .caret {
    visibility: hidden;
    z-index: 1;
  }

  &:hover .text, &:hover .caret {
    visibility: visible;
  }

  .text {
    position: absolute;

    border-radius: 4px;
    padding: $padding;

    background-color: $background-color;
    color: white;
    font-family: $font-family;
    font-size: $font-size;
    line-height: $line-height;
    font-weight: normal;

    transition: opacity 0.3s;
  }
}

.text {
  &.position-top {
    bottom: $text-position();
    left: -$padding;
  }

  &.position-bottom {
    top: $text-position();
    left: -$padding;
  }

  &.position-left {
    right: $text-position();
    top: -$padding;
  }

  &.position-right {
    left: $text-position();
    top: -$padding;
  }
}

.caret {
  border-style: solid;
  border-width: $caret-size;
  position: absolute;

  &.position-top {
    border-color: $background-color transparent transparent transparent;
    top: -$caret-size;
    margin-right: calc($caret-size / -2);
    right: $caret-size;
  }

  &.position-bottom  {
    border-color: transparent transparent $background-color transparent;
    bottom: -$caret-size;
    margin-left: calc($caret-size / -2);
    left: $caret-size;
  }

  &.position-left {
    border-color: transparent transparent transparent $background-color;
    left: -$caret-size;
    margin-top: calc($caret-size / -2);
    top: $caret-size;
  }

  &.position-right {
    border-color: transparent $background-color transparent transparent;
    right: -$caret-size;
    margin-top: calc($caret-size / -2);
    top: $caret-size;
  }
}

.width-small {
  width: 100px;
}

.width-medium {
  width: 200px;
}

.width-large {
  width: 300px;

  // Occasionally, the tooltips will overflow on small screens
  // despite the correction applied. This helps mitigate that case.
  @media only screen and (max-width: 350px) {
    width: 250px;
  }
}

</style>
