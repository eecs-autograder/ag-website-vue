<template>
  <div tabindex="1"
    id="context-menu-container"
    :style="[{display: d_is_open ? 'block' : 'none'}]"
    @context_menu_item_clicked="fun()">
    <slot name="context_menu_items">

    </slot>
  </div>
</template>

<script lang="ts">

  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component
  export default class ContextMenu extends Vue {
    d_options = ["Copy", "Paste", "Print"];

    @Prop({default: true, type: Boolean})
    is_open!: boolean;

    d_is_open = false;

    created() {
      this.d_is_open = this.is_open;
    }

    fun() {
      console.log("AHHHHH Clicked")
    }

    hide_context_menu() {
      this.d_is_open = false;
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
  display: block;
  margin-top: 0.5px;
  outline: none;
  position: absolute;
  z-index: 1;
}

</style>
