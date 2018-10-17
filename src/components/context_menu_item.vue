<template>
  <div class="context-menu-option"
      :class="[{
        'hoverable-item': !disabled,
        'first-child': first_child,
        'last-child': last_child
      }]"
      @click="check_if_valid_click($event)">
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

    @Prop({default: false, type: Boolean})
    last_child!: boolean;

    d_disabled = false;
    d_first_child = false;
    d_last_child = false;

    created() {
      this.d_disabled = this.disabled;
      this.d_first_child = this.first_child;
      this.d_last_child = this.last_child;
    }

    check_if_valid_click(event: KeyboardEvent) {
      event.stopPropagation();
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
    padding: 6px 15px;
  }

  .first-child {
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
  }

  .last-child {
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
  }

  .hoverable-item:hover {
    background-color: $pebble-medium;
    cursor: pointer;
  }

</style>
