<template>
  <div>

    <dropdown ref="dropdown_menu_ex_1"
              :incoming_items="menu_items"
              :incoming_chosen_item="selected_choice"
              dropdown_content_min_width = "130px"
              dropdown_content_max_width = "180px"
              @update_item_selected="add_item_1($event)">
      <template slot="header">
        <p class="header-para">
          {{selected_choice}}
        </p>
      </template>
    </dropdown>

    <p v-for="item of chosen_items_1"> {{item}}</p>

  <div class="surround-2">
    <dropdown ref="dropdown_menu_ex_2"
              :incoming_items="names"
              @update_item_selected="add_item_2($event)">
      <template slot="header">
        <button class="header-button"
          @focus ="show_the_dropdown_2()">
          Menu On A Button
        </button>
      </template>
    </dropdown>
  </div>

    <p v-for="item of chosen_items_2"> {{item}}</p>

    <div class="surround-3">
      <dropdown ref="dropdown_menu_ex_3"
                :incoming_items="names"
                @update_item_selected="add_item_3($event)">
        <template slot="header">
          <input class="header-input"
                 type="text"
                 placeholder="Enter a Name"
                 @blur ="hide_the_dropdown_3()"
                 @focus ="show_the_dropdown_3()">
        </template>
      </dropdown>

      <p v-for="item of chosen_items_3"> {{item}}</p>

  </div>

  <ul class="web-menu">
    <li class="menu-option"> <p> Home </p> </li>
    <dropdown ref="dropdown_menu_ex_4"
        :incoming_items="food_menu_items">
      <template slot="header">
        <li class="menu-option navy-tile">
          <p> Products </p>
        </li>
      </template>
    </dropdown>
    <li class="menu-option"> <p> Contact </p> </li>
  </ul>
  </div>
</template>

<script lang="ts">

  import { Component, Prop, Vue } from 'vue-property-decorator';

  import Dropdown from '@/components/dropdown.vue';

  @Component({
    components: { Dropdown }
  })
  export default class DropdownDemo extends Vue {

    selected_choice = "5 Passengers";

    menu_items = ["1 Passenger", "2 Passengers", "3 Passengers", "4 Passengers", "5 Passengers",
                  "6 Passengers", "7 Passengers", "8 Passengers", "9 Passengers"];

    names = ["Elora", "Brittany", "Sam", "Jordan", "Michelle"];

    food_menu_items = ["Cheeseburger", "Fries", "Shake"];

    add_item_1(item: string) {
      this.selected_choice = item;
      this.chosen_items_1.push(item);
    }

    add_item_2(item: string) {
      console.log("Adding via parent");
      this.chosen_items_2.push(item);
    }

    add_item_3(item: string) {
      console.log("Adding via parent");
      this.chosen_items_3.push(item);
    }

    chosen_items_1: string[] = [];
    chosen_items_2: string[] = [];
    chosen_items_3: string[] = [];

    show_the_dropdown_2() {
      let dropdown_component = <Dropdown> this.$refs.dropdown_menu_ex_2;
      dropdown_component.invoke_focus_on_dropdown();
    }

    hide_the_dropdown_3() {
      let dropdown_component = <Dropdown> this.$refs.dropdown_menu_ex_3;
    }

    show_the_dropdown_3() {
      let dropdown_component = <Dropdown> this.$refs.dropdown_menu_ex_3;
      dropdown_component.invoke_focus_on_dropdown();
    }

  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  .header-para {
    background-color: cornflowerblue;
    border: none;
    color: black;
    cursor: pointer;
    font-size: 20px;
    margin: 0;
    padding: 20px;
    text-align: center;
    width: 200px;
  }

  .header-button {
    background-color: mediumpurple;
    border: none;
    border-radius: 5px;
    color: white;
    cursor: pointer;
    margin: 0;
    padding: 10px;
  }

  .surround-2 {
    margin-left: 500px;
  }

  .header-input {
    background-color: lightgray;
    border: ghostwhite;
    padding: 10px;
  }

  .header-input:focus {
    background-color: darkorange;
  }

  .web-menu {
    display: block;
    margin-top: 100px;
  }

  .menu-option {
    background-color: ghostwhite;
    cursor: pointer;
    display: inline-block;
    padding: 0 10px;
    width: 200px;
  }

  .navy-tile {
    background-color: navy;
    color: white;
  }


</style>
