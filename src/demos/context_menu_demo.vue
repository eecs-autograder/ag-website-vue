<template>
  <div class="context-menu-demo">
    <div class="area-of-focus"
         @click="printCoordinates($event); $refs.context_menu_1.update_x_and_y_coords($event)">

      As Harry and a severely weakened Dumbledore flee the cave where Dumbledore drank the
      potion of despair to obtain what he thought was one of Voldemort’s Horcruxes, Harry
      pleads for the headmaster to remain calm. His plea prompts this touching display of
      faith. This moment — which takes place shortly before Dumbledore is killed by Severus
      Snape — exemplifies the strong father-son bond that has formed over the years between
      the two.
      <br> <br>
      The line inseparable from an unforgettable ending. Harry allows Voldemort to hit him with
      a killing curse so that the piece of Voldemort’s soul inside him will be destroyed. Harry
      then has an out-of-body experience, finding himself in King’s Cross Station talking to
      Dumbledore. As Harry prepares to return to the scene of his “death,” he asks the late
      headmaster about what has occurred and receives this answer. In many ways, this seems
      to be a nod from Rowling to all the readers who helped bring the magic of her iconic
      fantasy series to life.
      <br> <br>
      Even though it’s just one word, “always” is largely considered one of the most iconic
      lines from the Potter series. Uttered by Snape to Dumbledore during a memory Harry
      observes in the Pensieve of Snape casting a doe Patronus, the phrase embodies the
      controversial potions professor’s most redemptive quality — his unconditional love
      for Lily Potter. “Snape is all grey,” Rowling tweeted in 2015. “You can’t make him a
      saint: he was vindictive & bullying. You can’t make him a devil: he died to save the
      wizarding world.”

    </div>


    <context-menu ref="context_menu_1">
      <template slot="context_menu_items">
        <context-menu-item :first_child="true"
                           @context_menu_item_clicked="fun('A')">
          <template slot="label">
            Option A
          </template>
        </context-menu-item>
        <context-menu-item :disabled="false"
                           @context_menu_item_clicked="fun('B')">
          <template slot="label"> Option B </template>
        </context-menu-item>
        <div class="context-menu-divider"> </div>
        <context-menu-item
          @context_menu_item_clicked="fun('two')">
          <template slot="label"> Option Two </template>
        </context-menu-item>
        <div class="context-menu-divider"> </div>
        <context-menu-item :last_child="true"
          @context_menu_item_clicked="fun('three')">
          <template slot="label"> Option Three </template>
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

    printCoordinates(event: MouseEvent) {
      // console.log(document.activeElement);
      console.log("Demo Clicked");
      // console.log("Client X: " + event.clientX + " Client Y: " + event.clientY);
      // console.log("Offset X: " + event.offsetX + " Offset Y: " + event.offsetY);
    }

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  @import '@/styles/colors.scss';

.context-menu-demo{
  border: 2px solid hotpink;
  height: 500px;
  overflow: scroll;
  /*element that the context menu is on must be non-static positioned*/
  position: relative;
}

.context-menu-divider {
  border-bottom: 2px solid $pebble-light;
}

.area-of-focus {
  height: 800px;
  background-color: ghostwhite;
}

</style>
