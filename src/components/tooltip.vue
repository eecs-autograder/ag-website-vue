<template>

  <div ref="tooltip" id="tooltip">
    <slot></slot>
  </div>

</template>

<script lang="ts">

  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component
  export default class Tooltip extends Vue {

    @Prop({default: "top", type: String})
    placement!: string;

    @Prop({default: "small", type: String})
    width!: string;

    d_width = "";
    d_placement = "";

    created() {
      this.d_width = this.width;
      this.d_placement = this.placement;
    }

    mounted() {
      let parent = <HTMLElement> this.$el.parentElement;
      let tooltip = <HTMLElement> this.$refs['tooltip'];
      tooltip.style.visibility = "hidden";
      tooltip.style.opacity = "0";

      if (parent === null) {
        throw new Error('Tooltips must have a parent element.');
      }

      parent.style.position = "relative";
      parent.style.display = "inline-block";

      parent.addEventListener("mouseenter", () => {
        tooltip.style.visibility = "visible";
        tooltip.style.opacity = "1";
      });

      parent.addEventListener("mouseout", () => {
        tooltip.style.visibility = "hidden";
        tooltip.style.opacity = "0";
      });

      this.set_tooltip_width(tooltip);
      this.set_tooltip_placement(tooltip);
    }

    set_tooltip_width(tooltip: HTMLElement) {
      if (this.d_width === "small") {
        tooltip.classList.add('small-text-area');
      }
      else if (this.d_width === "medium") {
        tooltip.classList.add('medium-text-area');
      }
      else if (this.d_width === "large") {
        tooltip.classList.add('large-text-area');
      }
      else {
        throw new Error(`Invalid tooltip width: "${this.d_width}"`);
      }
    }

    set_tooltip_placement(tooltip: HTMLElement) {
      let height_of_tooltip = tooltip.clientHeight;

      if (this.d_placement === "left" || this.d_placement === "right") {
        let half_height_of_tooltip = (height_of_tooltip - 20) / 2;
        half_height_of_tooltip = -half_height_of_tooltip;
        half_height_of_tooltip -= 1;
        let top_num = half_height_of_tooltip.toString();
        top_num += "px";
        tooltip.style.top = top_num;

        if (this.d_placement === "left") {
          tooltip.className += " placement-left";
          if (this.d_width === "medium") {
            tooltip.style.marginLeft = "-120px";
          }
          else if (this.d_width === "large") {
            tooltip.style.marginLeft = "-220px";
          }
        }
        else {
          tooltip.className += " placement-right";
          if (this.d_width === "medium") {
            tooltip.style.marginRight = "-120px";
          }
          else if (this.d_width === "large") {
            tooltip.style.marginRight = "-220px";
          }
        }
      }
      else if (this.d_placement === "top" || this.d_placement === "bottom") {

        let space_away_from_parent = height_of_tooltip + 15;
        space_away_from_parent = -space_away_from_parent;
        let positioning_to_apply = space_away_from_parent.toString();
        positioning_to_apply += "px";

        if (this.d_placement === "bottom") {
          tooltip.className += " placement-bottom";
          tooltip.style.bottom = positioning_to_apply;
        }
        else {
          tooltip.className += " placement-top";
          tooltip.style.top = positioning_to_apply;
        }

        if (this.d_width === "small") {
          tooltip.style.marginLeft = "-60px";
        }
        else if (this.d_width === "medium") {
          tooltip.style.marginLeft = "-120px";
        }
        else if (this.d_width === "large") {
          tooltip.style.marginLeft = "-170px";
        }
      }
      else {
        throw new Error(`Invalid tooltip placement: "${this.d_placement}"`);
      }
    }
  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  $github-black-color: #24292e;


  #tooltip {
    background-color: $stormy-gray-dark;
    border-radius: 6px;
    color: white;
    display: inline-block;
    padding: 10px;
    position: absolute;
    text-align: center;
    transition: opacity 0.3s;
    word-wrap: break-word;
    z-index: 1;
  }

  .placement-left {
    left: -140px;
  }

  .placement-right {
    right: -140px;
  }

  .placement-bottom, .placement-top {
    left: 50%;
  }

  .small-text-area {
    width: 100px;
  }

  .medium-text-area {
    width: 220px;
  }

  .large-text-area {
    width: 320px;
  }

  #tooltip::after {
    border-style: solid;
    border-width: 5px;
    content: "";
    position: absolute;
  }

  .placement-left::after {
    border-color: transparent transparent transparent $stormy-gray-dark;
    left: 100%;
    margin-top: -5px;
    top: 50%;
  }

  .placement-right::after {
    border-color: transparent $stormy-gray-dark transparent transparent;
    margin-top: -5px;
    right: 100%;
    top: 50%;
  }

  .placement-top::after {
    border-color: $stormy-gray-dark transparent transparent transparent;
    left: 50%;
    margin-left: -5px;
    top: 100%;
  }

  .placement-bottom::after {
    border-color: transparent transparent $stormy-gray-dark transparent;
    left: 50%;
    margin-left: -5px;
    bottom: 100%;
  }

</style>
