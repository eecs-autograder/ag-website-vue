<template>
  <div tabindex="1"
    class="context-menu-container"
    @blur="hide_context_menu">
    <slot name="context_menu_items"> </slot>
  </div>
</template>

<script lang="ts">

  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  @Component
  export default class ContextMenu extends Vue {

    is_open = false;
    x_coordinate = 0;
    y_coordinate = 0;
    height_of_menu = 0;
    width_of_menu = 0;
    height_of_parent = 0;
    width_of_parent = 0;

    mounted() {
      this.$el.style.left = this.x_coordinate + "px";
      this.$el.style.top = this.y_coordinate + "px";
      this.height_of_menu = this.$el.clientHeight;
      this.width_of_menu = this.$el.clientWidth;
      let parent_element = <HTMLElement> this.$el.parentElement;
      this.height_of_parent = parent_element.clientHeight;
      this.width_of_parent = parent_element.clientWidth;
    }

    show_context_menu() {
      this.$el.style.visibility = "visible";
      this.is_open = true;
    }

    hide_context_menu() {
      this.$el.style.visibility = "hidden";
      this.is_open = false;
    }

    update_x_and_y_coords(event: MouseEvent) {
      let right_edge: number = event.offsetX + this.width_of_menu;
      let bottom_edge: number = event.offsetY + this.height_of_menu;

      if ((right_edge) > this.width_of_parent) {
        this.x_coordinate = (this.width_of_parent - this.width_of_menu) - 5;
        console.log('Too far right!');
      }
      else {
        this.x_coordinate = event.offsetX;
      }

      if ((bottom_edge) > this.height_of_parent) {
        this.y_coordinate = (this.height_of_parent - this.height_of_menu) - 5;
      }
      else {
        this.y_coordinate = event.offsetY;
      }

      this.$el.style.left = this.x_coordinate + "px";
      this.$el.style.top = this.y_coordinate + "px";

      this.show_context_menu();
      // focus must be applied after the element is visible
      this.$el.focus();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/styles/colors.scss';

.context-menu-container {
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
  visibility: hidden;
  margin-top: 0.5px;
  position: absolute;
  z-index: 1;
}

.context-menu-container:focus {
  outline: none;
}

</style>
