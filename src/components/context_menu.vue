<template>
  <div tabindex="1"
    class="context-menu-container"
    @blur="hide_context_menu">
    <slot name="context_menu_items"> </slot>
  </div>
</template>

<script lang="ts">

  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component
  export default class ContextMenu extends Vue {

    is_open = false;
    height_of_menu = 0;
    width_of_menu = 0;
    height_of_parent = 0;
    width_of_parent = 0;
    x_coordinate = 0;
    y_coordinate = 0;

    mounted() {
      this.$el.style.left = this.x_coordinate + "px";
      this.$el.style.top = this.y_coordinate + "px";
      this.height_of_menu = this.$el.clientHeight;
      this.width_of_menu = this.$el.clientWidth;

      let parent_element = <HTMLElement> this.$el.parentElement;
      this.height_of_parent = parent_element.clientHeight;
      this.width_of_parent = parent_element.clientWidth;

      let children = this.$el.getElementsByClassName('context-menu-option');
      if (children.length > 0) {
        let first_child = <HTMLElement> children[0];
        first_child.classList.add('first-child');
        let last_child = <HTMLElement> children[children.length - 1];
        last_child.classList.add('last-child');
      }
    }

    show_context_menu() {
      this.$el.style.visibility = "visible";
      this.is_open = true;
      let body = <HTMLElement> document.getElementsByTagName('body')[0];
      body.style.overflow = "hidden";
    }

    menu_is_open() {
      return this.is_open;
    }

    hide_context_menu() {
      this.$el.style.visibility = "hidden";
      this.is_open = false;
      let body = <HTMLElement> document.getElementsByTagName('body')[0];
      body.style.overflow = "visible";
    }

    update_x_and_y_coords(event: MouseEvent) {

      this.x_coordinate = event.pageX;
      this.y_coordinate = event.pageY;

      let right_edge: number = this.x_coordinate + this.width_of_menu;
      let bottom_edge: number = this.y_coordinate + this.height_of_menu;

      if ((right_edge) > this.width_of_parent) {
        console.log("Too Far Right");
        this.x_coordinate = (this.width_of_parent - this.width_of_menu) - 5;
      }

      if ((bottom_edge) > this.height_of_parent) {
        console.log("Too Far Down");
        this.y_coordinate = (this.height_of_parent - this.height_of_menu) - 5;
      }

      this.$el.style.left = this.x_coordinate + "px";
      this.$el.style.top = this.y_coordinate + "px";

      this.show_context_menu();
      // focus must be applied after the element is visible
      this.$el.focus();
    }
  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.context-menu-container {
  background-color: white;
  border-radius: 5px;
  border: 1px solid $pebble-light;
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
  margin-top: 0.5px;
  position: absolute;
  visibility: hidden;
  z-index: 1;
}

.context-menu-container:focus {
  outline: none;
}

</style>
