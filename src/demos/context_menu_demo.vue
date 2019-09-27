<template>
  <div class="context-menu-demo-outer">
    <div class="context-menu-demo-1">
      <div class="area-of-focus-1 menu-parent"
           @click="$refs.context_menu_1.show_context_menu($event.pageX, $event.pageY)">
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
    </div>
    <context-menu ref="context_menu_1">
      <template slot="context_menu_items">
        <context-menu-item @click="choice_alert('A Fish!')">
          <template slot="label">
            One Fish <i class="fas fa-fish fish"></i>
          </template>
        </context-menu-item>
        <div class="context-menu-divider"> </div>
        <context-menu-item @click="choice_alert('Two Fish!')">
          <template slot="label"> Two Fish
            <i class="fas fa-fish fish"></i>
            <i class="fas fa-fish fish"></i>
          </template>
        </context-menu-item>
        <div class="context-menu-divider"> </div>
        <context-menu-item
          @click="change_color('red')">
          <template slot="label">
            Red Fish <i class="fas fa-fish red-fish"></i>
          </template>
        </context-menu-item>
        <div class="context-menu-divider"> </div>
        <context-menu-item @click="change_color('blue')">
          <template slot="label"> Blue Fish <i class="fas fa-fish blue-fish"></i> </template>
        </context-menu-item>
      </template>
    </context-menu>

    <div class="context-menu-demo-2">
      <div class="area-of-focus-2 menu-parent"
           @click="$refs.context_menu_2.show_context_menu($event.pageX, $event.pageY)">
        Today is Toby Flenderson's last day.
        I couldn't sleep last night.
        I came in extra early.
        So much energy.
        There are certain days that you know you'll remember the rest of your life.
        And I just have a feeling that today is one of those days.
         - Morning.
         - Mornin'.
        So here we go.
        Just a matter of hours now until his horribleness has left the building.
        I'm going to set my watch alarm And Good morning, Kelly.
        I can't believe this is your last day.
        How do you feel? Fine.
        Good.
        I feel weird.
        First thing on the agenda.
        Actually, the only thing on the agenda is that status of Toby's going away party.
        We have a buttercream cake and a slide show of Toby.
        But so far we only have two pictures of him.
        Okay, well, this will not do.
        Toby is going away forever, and we need to do something very, very special.
        In some cultures, when somebody leaves, like New Orleans culture, they have a parade,
        and they have a band.
        And people party in the streets.
        Do you mean leaves as in dies? You want us to throw Toby a New Orleans funeral? If
        the devil were to explode, and evil were gone forever, what sort of party would you
        have? - Michael - Like a beach blowout? - Or a toga - No, you know No! - Toga! -
        You always do this.
        We have a nice, modest party planned, and you come in and demand the world.
        Let me be clear.
      </div>
    </div>
    <context-menu ref="context_menu_2">
      <template slot="context_menu_items">
        <context-menu-item v-for="item of items"
                           :disabled="item.disabled"
                           @click="choice_alert(item.name)">
          <template slot="label">
            {{item.name}}
          </template>
        </context-menu-item>
      </template>
    </context-menu>

    <br>
    <div @click="$refs.empty_context_menu.show_context_menu($event.pageX, $event.pageY)"
         class="menu-parent">
      This context menu is empty <br> <br>

      EmptymenuEmptymenuEmptymenuEmptymenuEmptymenuEm
      ptymenuEmptymenuEmptymenuEmptymenuEmptymenuEmptymenu
      EmptymenuEmptymenuEmptymenuEmptymenuEmptymenuEmptymenu
      EmptymenuEmptymenuEmptymenuEmptymenuEmptymenu
    </div>
    <context-menu ref="empty_context_menu"></context-menu>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import ContextMenu from '@/components/context_menu/context_menu.vue';
import ContextMenuItem from '@/components/context_menu/context_menu_item.vue';

@Component({
  components: {ContextMenu, ContextMenuItem}
})
export default class ContextMenuDemo extends Vue {

  choice_alert(word: string) {
    alert('You have clicked on: ' + word);
  }

  change_color(word: string) {
    let text = <HTMLElement> this.$el.getElementsByClassName('area-of-focus-1')[0];
    text.style.color = word;
  }

  items = [
    {name: 'Option 1', disabled: false},
    {name: 'Option 2', disabled: false},
    {name: 'Option 3', disabled: false},
    {name: 'Option 4', disabled: true}
  ];

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/context_menu_styles.scss';

.context-menu-demo-1 {
  overflow: auto;
  height: 1000px;
}

.menu-parent {
  position: relative;
}

.area-of-focus-1 {
  height: 2500px;
  padding: 20px;
}

.context-menu-demo-2{
  width: 600px;
}

.area-of-focus-2 {
  background-color: mediumpurple;
  padding: 20px;
}

.fish {
  padding-left: 10px;
}

.red-fish {
  color: red;
  padding-left: 10px;
}

.blue-fish {
  color: cornflowerblue;
  padding-left: 10px;
}

</style>
