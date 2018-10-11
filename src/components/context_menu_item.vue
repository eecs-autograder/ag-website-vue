<template>
  <div class="context-menu-option"
      :class="[{'hoverable-item': !disabled, 'first-child': first_child}]"
      @click="check_if_valid_click()">
    <slot name="label"> </slot>
  </div>
</template>

<script lang="ts">
  import ContextMenu from '@/components/context_menu.vue';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component
  export default class ContextMenuItem extends Vue {

    @Prop({default: false, type: Boolean})
    disabled!: boolean;

    @Prop({default: false, type: Boolean})
    first_child!: boolean;

    created() {
      console.log(this.disabled);
    }

    check_if_valid_click() {
      console.log("Clicked");
      let parent = <ContextMenu> this.$parent;
      if (!this.disabled) {
        parent.hide_context_menu();
        this.$emit('context_menu_item_clicked');
      }
    }

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  @import '@/styles/colors.scss';

  .context-menu-option {
    color: black;
    padding: 5px 15px;
  }

  .first-child {
    /*border-top: none;*/
  }

  .hoverable-item:hover {
    background-color: $pebble-light;
    cursor: pointer;
  }

</style>
