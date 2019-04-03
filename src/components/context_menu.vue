<template>
  <div tabindex="1"
       id="context-menu-container"
       @blur="hide_context_menu"
       @keyup.esc="hide_context_menu">
    <slot name="context_menu_items">
      <context-menu-item :disabled="true">
        <template slot="label">
          <div style="width: 100px; height: 20px"> </div>
        </template>
      </context-menu-item>
    </slot>
  </div>
</template>

<script lang="ts">

  import ContextMenuItem from '@/components/context_menu_item.vue';
  import { Component, Vue } from 'vue-property-decorator';

  @Component({
    components: {
      'context-menu-item': ContextMenuItem
    }
  })
  export default class ContextMenu extends Vue {

    private d_is_open = false;
    private d_height_of_menu = 0;
    private d_width_of_menu = 0;

    private wheel_event_handler!: (event: Event) => void;

    mounted() {
      (<HTMLElement> this.$el).style.left = "0px";
      (<HTMLElement> this.$el).style.top = "0px";
      this.d_height_of_menu = this.$el.clientHeight;
      this.d_width_of_menu = this.$el.clientWidth;

      this.wheel_event_handler = (event: Event) => {
        if (this.menu_is_open) {
          event.preventDefault();
          event.stopPropagation();
        }
      };
      window.addEventListener('wheel', this.wheel_event_handler, true);

      let children = this.$el.getElementsByClassName('context-menu-option');
      if (children.length === 0) {
        throw new Error('Context Menus must contain at least one Context Menu Item');
      }
      let first_child = <HTMLElement> children[0];
      first_child.classList.add('first-child');
      let last_child = <HTMLElement> children[children.length - 1];
      last_child.classList.add('last-child');

      this.hide_context_menu();
    }

    destroyed() {
      window.removeEventListener('wheel', this.wheel_event_handler, true);
    }

    get menu_is_open() {
      return this.d_is_open;
    }

    hide_context_menu() {
      (<HTMLElement> this.$el).style.visibility = "hidden";
      this.d_is_open = false;
    }

    show_context_menu(x_coordinate: number, y_coordinate: number) {
      let right_edge: number = x_coordinate + this.d_width_of_menu;
      let bottom_edge: number = y_coordinate + this.d_height_of_menu;

      if ((right_edge) > document.body.clientWidth) {
        x_coordinate = (x_coordinate - this.d_width_of_menu) - 5;
      }

      if ((bottom_edge) > document.body.clientHeight) {
        y_coordinate = (y_coordinate - this.d_height_of_menu) - 5;
      }

      (<HTMLElement> this.$el).style.left = x_coordinate + "px";
      (<HTMLElement> this.$el).style.top = y_coordinate + "px";

      (<HTMLElement> this.$el).style.visibility = "visible";
      this.d_is_open = true;

      // focus must be applied after the element is visible
      (<HTMLElement> this.$el).focus();
    }
  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

#context-menu-container {
  background-color: white;
  border: 2px solid lighten($baking-pan, 50%);
  border-radius: 5px;
  box-shadow: 0 0 15px opacify(lighten($baking-pan, 50%), .2);
  margin-top: 0.5px;
  position: absolute;
  z-index: 1;
}

#context-menu-container:focus {
  outline: none;
}

</style>
