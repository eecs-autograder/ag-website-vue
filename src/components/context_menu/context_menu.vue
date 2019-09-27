<template>
  <div tabindex="-1"
       ref="context_menu"
       id="context-menu-container"
       @blur="hide_context_menu"
       @keyup.esc="hide_context_menu"
       v-show="d_is_open">
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
import { Component, Vue } from 'vue-property-decorator';

import ContextMenuItem from '@/components/context_menu/context_menu_item.vue';

@Component({
  components: {
    'context-menu-item': ContextMenuItem
  }
})
export default class ContextMenu extends Vue {
  private d_is_open = false;

  mounted() {
    let children = this.$el.getElementsByClassName('context-menu-option');
    if (children.length === 0) {
      throw new Error('Context Menus must contain at least one Context Menu Item');
    }
  }

  get menu_is_open() {
    return this.d_is_open;
  }

  hide_context_menu() {
    this.d_is_open = false;
    this.$emit('is_open_changed', false);
  }

  show_context_menu(x_coordinate: number, y_coordinate: number) {
    this.d_is_open = true;
    this.$emit('is_open_changed', true);

    this.$nextTick(() => {
      (<HTMLElement> this.$el).style.left = "0px";
      (<HTMLElement> this.$el).style.top = "0px";
      let height = (<HTMLElement> this.$el).clientHeight;
      let width = (<HTMLElement> this.$el).clientWidth;

      let right_edge: number = x_coordinate + width;
      let bottom_edge: number = y_coordinate + height;

      if ((right_edge) > document.body.clientWidth) {
        x_coordinate = (x_coordinate - width) - 5;
      }

      if ((bottom_edge) > document.body.clientHeight) {
        y_coordinate = (y_coordinate - height) - 5;
      }

      (<HTMLElement> this.$el).style.left = x_coordinate + "px";
      (<HTMLElement> this.$el).style.top = y_coordinate + "px";

      // focus must be applied after the element is visible for the ESC
      // key to work
      (<HTMLElement> this.$el).focus();
    });
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
