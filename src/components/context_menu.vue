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

    private d_is_open = false;
    private d_height_of_menu = 0;
    private d_width_of_menu = 0;

    mounted() {
      this.$el.style.left = "0px";
      this.$el.style.top = "0px";
      this.d_height_of_menu = this.$el.clientHeight ? this.$el.clientHeight : 5;
      this.d_width_of_menu = this.$el.clientWidth ? this.$el.clientWidth : 5;

      let parent_element = <HTMLElement> this.$el.parentElement;
      parent_element.addEventListener('wheel', (event: Event) => {
        console.log("Wheel1");
        if (this.menu_is_open) {
          event.preventDefault();
        }
      });

      // parent_element.addEventListener('scroll', (event: Event) => {
      //   console.log("Scroll1");
      //   if (this.menu_is_open) {
      //     event.preventDefault();
      //   }
      // });

      window.addEventListener('wheel', (event: Event) => {
        console.log("Wheel2");
        if (this.menu_is_open) {
          event.preventDefault();
        }
      });

      // document.body.addEventListener('scroll', (event: Event) => {
      //   console.log("Scroll2");
      //   if (this.menu_is_open) {
      //     event.preventDefault();
      //   }
      // });

      let children = this.$el.getElementsByClassName('context-menu-option');
      if (children.length > 0) {
        let first_child = <HTMLElement> children[0];
        first_child.classList.add('first-child');
        let last_child = <HTMLElement> children[children.length - 1];
        last_child.classList.add('last-child');
      }

      this.hide_context_menu();
    }

    // handleWheel(event: Event) {
    //   if (this.menu_is_open) {
    //     event.preventDefault();
    //   }
    // }

    get menu_is_open() {
      return this.d_is_open;
    }

    hide_context_menu() {
      this.$el.style.visibility = "hidden";
      this.d_is_open = false;
    }

    show_context_menu(x_coordinate: number, y_coordinate: number) {

      // console.log("PageX: " + x_coordinate);
      // console.log("PageY: " + y_coordinate);

      let right_edge: number = x_coordinate + this.d_width_of_menu;
      let bottom_edge: number = y_coordinate + this.d_height_of_menu;

      // console.log("Client Width of menu: " + this.d_width_of_menu);
      // console.log("Client Height of menu: " + this.d_height_of_menu);
      //
      // console.log("Width of menu: " + this.$el.style.width);
      // console.log("Height of menu: " + this.$el.style.height);
      //
      // console.log("Right Edge: " + right_edge);
      // console.log("Bottom Edge: " + bottom_edge);
      //
      // console.log("Body Width: " + document.body.clientWidth);
      // console.log("Body Height: " + document.body.clientHeight);

      if ((right_edge) > document.body.clientWidth) {
        console.log("Too Far Right");
        x_coordinate = (x_coordinate - this.d_width_of_menu) - 5;
      }

      if ((bottom_edge) > document.body.clientHeight) {
        console.log("Too Far Down");
        y_coordinate = (y_coordinate - this.d_height_of_menu) - 5;
      }

      this.$el.style.left = x_coordinate + "px";
      this.$el.style.top = y_coordinate + "px";

      // console.log("Offset Width: " + this.$el.offsetWidth);
      // console.log("Offset Height: " + this.$el.offsetHeight);
      //
      // console.log("New Left: " + this.$el.style.left);
      // console.log("New Top: " + this.$el.style.top);

      this.$el.style.visibility = "visible";
      this.d_is_open = true;

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
  padding: 1px solid $pebble-light;
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
  margin-top: 0.5px;
  min-width: 5px;
  min-height: 5px;
  position: absolute;
  z-index: 1;
}

.context-menu-container:focus {
  outline: none;
}

</style>
