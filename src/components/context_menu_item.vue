<template>
  <div class="context-menu-option"
      :class="[{'hoverable-item': !d_disabled, 'disabled-item': d_disabled}]"
      @click="check_if_valid_click($event)">
    <slot name="label"> </slot>
  </div>
</template>

<script lang="ts">
  import ContextMenu from '@/components/context_menu.vue';
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  @Component
  export default class ContextMenuItem extends Vue {

    @Watch('disabled')
    on_disabled_change(new_value: boolean, old_value: boolean) {
      this.d_disabled = new_value;
    }

    @Prop({default: false, type: Boolean})
    disabled!: boolean;

    d_disabled = false;

    created() {
      this.d_disabled = this.disabled;
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

<style scoped lang="scss">
@import '@/styles/colors.scss';

.context-menu-option {
  color: black;
  padding: 6px 15px;
}

.first-child {
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.last-child {
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}

.hoverable-item:hover {
  background-color: $pebble-medium;
  cursor: pointer;
}

.disabled-item, .disabled-item:hover {
  color: $baking-pan;
}

</style>
