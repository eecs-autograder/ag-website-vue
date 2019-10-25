<template>
  <div tabindex="-1"
       ref="context_menu"
       id="context-menu-container"
       @blur="hide_context_menu"
       @keyup.esc="hide_context_menu"
       v-show="is_open">
    <slot>
      <context-menu-item :disabled="true">
        <div style="width: 100px; height: 20px"> </div>
      </context-menu-item>
    </slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import ContextMenuItem from '@/components/context_menu/context_menu_item.vue';

interface MenuCoordinates {
  x: number;
  y: number;
}

@Component({
  components: {
    'context-menu-item': ContextMenuItem
  }
})
export default class ContextMenu extends Vue {
  @Prop({required: true})
  coordinates!: MenuCoordinates;

  @Prop({required: true, type: Boolean})
  is_open!: boolean;

  mounted() {
    let children = this.$el.getElementsByClassName('context-menu-option');
    if (children.length === 0) {
      throw new Error('Context Menus must contain at least one Context Menu Item');
    }
  }

  hide_context_menu() {
    this.$emit('close');
  }

  @Watch('is_open')
  is_open_changed(new_value: boolean, old_value: boolean) {
    if (!this.is_open) {
      this.$emit('close');
    }

    this.$nextTick(() => {
      (<HTMLElement> this.$el).style.left = "0px";
      (<HTMLElement> this.$el).style.top = "0px";
      let height = (<HTMLElement> this.$el).clientHeight;
      let width = (<HTMLElement> this.$el).clientWidth;

      let right_edge: number = this.coordinates.x + width;
      let bottom_edge: number = this.coordinates.y + height;

      if ((right_edge) > document.body.clientWidth) {
        this.coordinates.x = (this.coordinates.x - width) - 5;
      }

      if ((bottom_edge) > document.body.clientHeight) {
        this.coordinates.y = (this.coordinates.y - height) - 5;
      }

      (<HTMLElement> this.$el).style.left = this.coordinates.x + "px";
      (<HTMLElement> this.$el).style.top = this.coordinates.y + "px";

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
  border: 1px solid lighten($baking-pan, 50%);
  border-radius: 2px;
  box-shadow: 0 0 15px opacify(lighten($baking-pan, 50%), .2);
  position: absolute;
  z-index: 1;
}

#context-menu-container:focus {
  outline: none;
}

</style>
