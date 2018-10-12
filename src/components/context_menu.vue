<template>
  <div tabindex="1"
    id="context-menu-container"
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

    mounted() {
      this.$el.style.left = this.x_coordinate + "px";
      this.$el.style.top = this.y_coordinate + "px";
    }

    show_context_menu() {
      this.$el.style.display = "block";
      this.is_open = true;
    }

    hide_context_menu() {
      this.$el.style.display = "none";
      this.is_open = false;
    }

    update_x_and_y_coords(event: MouseEvent) {
      this.x_coordinate = event.offsetX;
      this.y_coordinate = event.offsetY;
      this.$el.style.left = this.x_coordinate + "px";
      this.$el.style.top = this.y_coordinate + "px";
      this.show_context_menu();
      this.$el.focus();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/styles/colors.scss';

#context-menu-container {
  background-color: white;
  border: 1px solid $pebble-light;
  border-radius: 5px;
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
  display: none;
  margin-top: 0.5px;
  position: absolute;
  z-index: 1;
}

#context-menu-container:focus {
  /*outline: 2px solid mediumpurple;*/
  outline: none;
}

</style>
