<template>

  <div id="tooltip">
    <span class="tooltip-text"> <slot> </slot> </span>
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

    tooltip_width = "";

    tooltip_placement = "";

    created() {
      this.tooltip_width = this.width;
      this.tooltip_placement = this.placement;
    }

    mounted() {
      let parent = <HTMLElement> this.$el.parentElement;
      let tooltip_text = <HTMLElement> this.$el.getElementsByClassName("tooltip-text")[0];

      if (parent !== null) {
        parent!.style.position = "relative";
        parent.style.display = "inline-block";

        parent.addEventListener("mouseenter", () => {
          tooltip_text.style.visibility = "visible";
          tooltip_text.style.opacity = "1";
        });

        parent.addEventListener("mouseout", () => {
          tooltip_text.style.visibility = "hidden";
          tooltip_text.style.opacity = "0";
        });
      }
      else {
        throw new Error("Parent element is null!");
      }


      // Width
      if (this.tooltip_width === "small") {
        tooltip_text.className += " small-text-area";
      }
      else if (this.tooltip_width === "medium") {
        tooltip_text.className += " medium-text-area";
      }
      else {
        tooltip_text.className += " large-text-area";
      }

      let height_of_tooltip_text = tooltip_text.clientHeight;

      // Placement
      if (this.tooltip_placement === "left" || this.tooltip_placement === "right") {

        let half_height_of_tooltip_text = (height_of_tooltip_text - 20) / 2;
        half_height_of_tooltip_text = -half_height_of_tooltip_text;
        half_height_of_tooltip_text -= 1;
        let top_num = half_height_of_tooltip_text.toString();
        top_num += "px";
        tooltip_text.style.top = top_num;

        if (this.tooltip_placement === "left") {
          tooltip_text.className += " placement-left";
          if (this.tooltip_width === "medium") {
            tooltip_text.style.marginLeft = "-120px";
          }
          else if (this.tooltip_width === "large") {
            tooltip_text.style.marginLeft = "-220px";
          }
        }
        else {
          tooltip_text.className += " placement-right";
          if (this.tooltip_width === "medium") {
            tooltip_text.style.marginRight = "-120px";
          }
          else if (this.tooltip_width === "large") {
            tooltip_text.style.marginRight = "-220px";
          }
        }
      }
      else  {

        let space_away_from_parent = height_of_tooltip_text + 15;
        space_away_from_parent = -space_away_from_parent;
        let positioning_to_apply = space_away_from_parent.toString();
        positioning_to_apply += "px";

        if (this.tooltip_placement === "bottom") {
          tooltip_text.className += " placement-bottom";
          tooltip_text.style.bottom = positioning_to_apply;
        }
        else {
          tooltip_text.className += " placement-top";
          tooltip_text.style.top = positioning_to_apply;
        }

        if (this.tooltip_width === "small") {
          tooltip_text.style.marginLeft = "-60px";
        }
        else if (this.tooltip_width === "medium") {
          tooltip_text.style.marginLeft = "-120px";
        }
        else if (this.tooltip_width === "large") {
          tooltip_text.style.marginLeft = "-170px";
        }
      }
    }

  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  .tooltip-text {
    background-color: $darker-gray;
    border-radius: 6px;
    color: white;
    display: inline-block;
    opacity: 0;
    padding: 10px;
    position: absolute;
    text-align: center;
    transition: opacity 0.3s;
    visibility: hidden;
    word-wrap: break-word;
    z-index: 0;
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

  .tooltip-text::after {
    border-style: solid;
    border-width: 5px;
    content: "";
    position: absolute;
  }

  .placement-left::after {
    border-color: transparent transparent transparent $darker-gray;
    left: 100%;
    margin-top: -5px;
    top: 50%;
  }

  .placement-right::after {
    border-color: transparent $darker-gray transparent transparent;
    margin-top: -5px;
    right: 100%;
    top: 50%;
  }

  .placement-top::after {
    border-color: $darker-gray transparent transparent transparent;
    left: 50%;
    margin-left: -5px;
    top: 100%;
  }

  .placement-bottom::after {
    border-color: transparent transparent $darker-gray transparent;
    left: 50%;
    margin-left: -5px;
    bottom: 100%;
  }

</style>
