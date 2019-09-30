<template>
  <div class="context-menu-option"
       :class="{'hoverable-item': !disabled, 'disabled-item': disabled}"
       @click.stop="handle_click">
    <slot name="label"> </slot>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  import ContextMenu from '@/components/context_menu/context_menu.vue';

  @Component
  export default class ContextMenuItem extends Vue {
    @Prop({default: false, type: Boolean})
    disabled!: boolean;

    handle_click(event: Event) {
      if (!this.disabled) {
        this.$emit('click');
        let parent = <ContextMenu> this.$parent;
        parent.hide_context_menu();
      }
    }
  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.context-menu-option {
  color: black;
  padding: 6px 15px;
}

.hoverable-item:hover {
  background-color: $pebble-medium;
  cursor: pointer;
}

.disabled-item, .disabled-item:hover {
  color: $baking-pan;
}

</style>
