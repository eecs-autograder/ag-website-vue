<template>
  <div tabindex="-1"
       ref="context_menu"
       id="context-menu-container"
       @blur="hide_context_menu"
       @keyup.esc="hide_context_menu"
       v-show="is_open">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

interface MenuCoordinates {
  x: number;
  y: number;
}

@Component({})
export default class ContextMenu extends Vue {
  @Prop({required: true})
  coordinates!: MenuCoordinates;

  @Prop({required: true, type: Boolean})
  is_open!: boolean;

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

  min-width: 100px;
  min-height: 20px;
}

#context-menu-container:focus {
  outline: none;
}

</style>
