<template>
  <div class="context-menu-demo">
    <context-menu>
      <template slot="context_menu_items">
        <context-menu-item :first_child="true"
                           @context_menu_item_clicked="fun('one')">
          <template slot="label">
            One
          </template>
        </context-menu-item>
        <context-menu-item :disabled="true"
                           @context_menu_item_clicked="fun('two')">
          <template slot="label"> Two </template>
        </context-menu-item>
        <div class="divider"> </div>
        <context-menu-item
          @context_menu_item_clicked="fun('three')">
          <template slot="label"> Three </template>
        </context-menu-item>
        <context-menu-item
          @context_menu_item_clicked="fun('four')">
          <template slot="label"> Four </template>
        </context-menu-item>
      </template>
    </context-menu>
  </div>
</template>

<script lang="ts">
  import ContextMenu from '@/components/context_menu.vue';
  import ContextMenuItem from '@/components/context_menu_item.vue';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
    components: {ContextMenu, ContextMenuItem}
  })
  export default class ContextMenuDemo extends Vue {

    fun(word: string) {
      console.log('You have clicked on: ' + word);
    }

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  @import '@/styles/colors.scss';

.divider {
  border-bottom: 2px solid $pebble-light;
}

</style>
