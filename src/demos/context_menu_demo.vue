<template>
  <div class="context-menu-demo-outer">
    <div class="context-menu-demo-1">
      <div class="area-of-focus-1 menu-parent"
           @click="menu_1_coordinates = {x: $event.pageX, y: $event.pageY};
                   menu_1_is_open = true">
        Lorem Ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
        ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
        officia deserunt mollit anim id est laborum.

        Lorem Ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
        ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
        officia deserunt mollit anim id est laborum.

        Lorem Ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
        ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
        officia deserunt mollit anim id est laborum.
      </div>
    </div>
    <context-menu ref="context_menu_1"
                  :is_open="menu_1_is_open" :coordinates="menu_1_coordinates"
                  @close="menu_1_is_open = false">
      <context-menu-item @click="choice_alert('A Fish!')">
        One Fish <i class="fas fa-fish fish"></i>
      </context-menu-item>
      <div class="context-menu-divider"> </div>
      <context-menu-item @click="choice_alert('Two Fish!')">
        Two Fish
        <i class="fas fa-fish fish"></i>
        <i class="fas fa-fish fish"></i>
      </context-menu-item>
      <div class="context-menu-divider"> </div>
      <context-menu-item
        @click="change_color('red')">
        Red Fish <i class="fas fa-fish red-fish"></i>
      </context-menu-item>
      <div class="context-menu-divider"> </div>
      <context-menu-item @click="change_color('blue')">
        Blue Fish <i class="fas fa-fish blue-fish"></i>
      </context-menu-item>
    </context-menu>

    <div class="context-menu-demo-2">
      <div class="area-of-focus-2 menu-parent"
           @click="menu_2_coordinates = {x: $event.pageX, y: $event.pageY};
                   menu_2_is_open = true">
        Lorem Ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
        ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
        officia deserunt mollit anim id est laborum.

        Lorem Ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
        ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
        officia deserunt mollit anim id est laborum.
      </div>
    </div>
    <context-menu ref="context_menu_2"
                  :is_open="menu_2_is_open" :coordinates="menu_2_coordinates"
                  @close="menu_2_is_open = false">
      <context-menu-item v-for="item of items"
                         :disabled="item.disabled"
                         @click="choice_alert(item.name)">
        {{item.name}}
      </context-menu-item>
    </context-menu>

    <br>
    <div @click="empty_menu_coordinates = {x: $event.pageX, y: $event.pageY};
                 empty_menu_is_open = true"
         class="menu-parent">
      This context menu is empty <br> <br>

      EmptymenuEmptymenuEmptymenuEmptymenuEmptymenuEm
      ptymenuEmptymenuEmptymenuEmptymenuEmptymenuEmptymenu
      EmptymenuEmptymenuEmptymenuEmptymenuEmptymenuEmptymenu
      EmptymenuEmptymenuEmptymenuEmptymenuEmptymenu
    </div>
    <context-menu ref="empty_context_menu"
                  :is_open="empty_menu_is_open"
                  :coordinates="empty_menu_coordinates"
                  @close="empty_menu_is_open = false"></context-menu>
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
  menu_1_is_open = false;
  menu_1_coordinates = {x: 0, y: 0};

  menu_2_is_open = false;
  menu_2_coordinates = {x: 0, y: 0};

  empty_menu_is_open = false;
  empty_menu_coordinates = {x: 0, y: 0};

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
