<template>
  <div>

    <div class="surround-1">
      <p class="tabindex-explanation"> If the element that the Dropdown component is on is not an
          element that normally receives focus, you must add the tabindex attribute to that
          element so that it can receive focus and blur.
      </p>
      <dropdown ref="dropdown_menu_ex_1"
                :items="menu_items"
                :initial_highlighted_index="5"
                dropdown_height="200px"
                @item_selected="add_item_1($event)">
        <template slot="header">
          <p tabindex="0" class="header-para">
            {{selected_menu_item.option}}
          </p>
        </template>
        <template slot-scope="{item}">
           <div class="airplane"><i class="fas fa-plane"></i></div>
           <span> {{item.option}} </span>
        </template>
      </dropdown>
    </div>

    <p v-for="item of chosen_items_1"> {{item.option}}</p>

    <div class="surround-2">
      <dropdown ref="dropdown_menu_ex_2"
                :items="names"
                @item_selected="add_item_2($event)">
        <template slot="header">
          <button class="header-button">
            Menu On A Button
          </button>
        </template>
        <div slot-scope="{item}">
          <div class="row-content-2">
            <span> {{item.first_name}} </span>
          </div>
        </div>
      </dropdown>
    </div>

    <p v-for="item of chosen_items_2"> {{item.last_name}}, {{item.first_name}}</p>

    <div class="surround-3">
      <p> {{some_word}}</p>
      <dropdown ref="dropdown_menu_ex_3"
                :items="names"
                @item_selected="add_item_3($event)">
        <template slot="header">
          <input type=text
                 name="some_word_stuff"
                 v-model="some_word">
        </template>
        <div slot-scope="{item}">
          <span> {{item.first_name}} </span>
        </div>
      </dropdown>
    </div>

    <p v-for="item of chosen_items_3"> {{item.last_name}}, {{item.first_name}}</p>

    <div class="web-menu">
      <div class="menu-option"> <p> Home </p> </div>
      <dropdown ref="dropdown_menu_ex_4"
          :items="food_menu_items">
        <template slot="header">
          <div tabindex="0" class="menu-option navy-tile">
            <p> Products </p>
          </div>
        </template>
      </dropdown>
      <dropdown ref="dropdown_menu_ex_5"
                :items="contact_methods">
        <template slot="header">
          <div tabindex="0" class="menu-option">
            <p> Contact </p>
          </div>
        </template>
        <template slot-scope="{item}">
          <p class="contact"> {{item.contact}}</p>
        </template>
      </dropdown>
    </div>

  </div>
</template>

<script lang="ts">

  import { Component, Prop, Vue } from 'vue-property-decorator';

  import Dropdown from '@/components/dropdown.vue';

  @Component({
    components: { Dropdown }
  })
  export default class DropdownDemo extends Vue {

    some_word = "";

    menu_items = [
      { option: "1 Passenger" },
      { option: "2 Passengers" },
      { option: "3 Passengers" },
      { option: "4 Passengers" },
      { option: "5 Passengers" },
      { option: "6 Passengers" },
      { option: "7 Passengers" },
      { option: "8 Passengers" },
      { option: "9 Passengers" }
    ];

    selected_menu_item = { option: "2 Passengers" };

    names = [
      { first_name: "Elora", last_name: "Blue"},
      { first_name: "Brittany", last_name: "Cost"},
      { first_name: "Sam", last_name: "Sanchez"},
      { first_name: "Jordan", last_name: "Johnson"},
      { first_name: "Michelle", last_name: "Brandt"}
    ];

    food_menu_items = [
      "Cheeseburger",
      "Fries",
      "Shake",
      "Malt",
      "Hamburger",
      "Chicken Sandwich"
    ];

    contact_methods = [{contact: "By Phone"}, {contact: "By Email"}];

    add_item_1(item: {option: string}) {
      this.selected_menu_item = item;
      this.chosen_items_1.push(item);
    }

    add_item_2(item: string) {
      this.chosen_items_2.push(item);
    }

    add_item_3(item: {first_name: string, last_name: string}) {
      this.chosen_items_3.push(item);
    }

    chosen_items_1: object[] = [];
    chosen_items_2: string[] = [];
    chosen_items_3: object[] = [];

  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.tabindex-explanation {
  font-size: 15px;
  width: 600px;
}

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
  background-color: black;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  margin: 0;
  padding: 20px 20px 20px 20px;
}

.surround-2 {
  margin-top: 100px;
}

.web-menu {
  margin-top: 100px;
  margin-bottom: 100px;
  display: flex;
  text-decoration: none;
}

.menu-option {
  background-color: ghostwhite;
  cursor: pointer;
  width: 200px;
  padding: 10px;
  text-decoration: none;
}

.navy-tile {
  background-color: navy;
  color: white;
}

.airplane {
  margin-left: 5px;
  margin-right: 10px;
  display: inline-block;
  color: coral;
}

.row-content-2 {
  width: 125px;
}

.food {
  margin: 0;
  padding-top: 2px;
  width: 190px;
}

.contact {
  margin: 0;
  padding-top: 2px;
}

</style>
