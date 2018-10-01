<template>
  <div>

    <div class="surround-1">
      <p class="tabindex-explanation"> If the element that the Dropdown component is on is not an
          element that normally receives focus, you must add the tabindex attribute to that
          element so that it can receive focus and blur.
      </p>
      <dropdown ref="dropdown_menu_ex_1"
                :incoming_items="menu_items"
                :highlighted_index_in="1"
                dropdown_content_min_width = "130px"
                dropdown_content_max_width = "180px"
                @update_item_selected="add_item_1($event)">
        <template slot="header">
          <p tabindex="1" class="header-para">
            {{selected_menu_item.option}}
          </p>
        </template>
        <template slot-scope="menu_item">
           <div class="airplane"><i class="fas fa-plane"></i></div>
           <span> {{menu_item.option}} </span>
        </template>
      </dropdown>
    </div>

    <p v-for="item of chosen_items_1"> {{item.option}}</p>

    <div class="surround-2">
      <dropdown ref="dropdown_menu_ex_2"
                :incoming_items="names"
                @update_item_selected="add_item_2($event)">
        <template slot="header">
          <button class="header-button">
            Menu On A Button
          </button>
        </template>
        <div slot-scope="employee">
          <span> {{employee.first_name}} </span>
        </div>
      </dropdown>
    </div>

    <p v-for="item of chosen_items_2"> {{item.last_name}}, {{item.first_name}}</p>

    <div class="surround-3">
      <p> {{some_word}}</p>
      <dropdown ref="dropdown_menu_ex_3"
                :incoming_items="names"
                @update_item_selected="add_item_3($event)">
        <template slot="header">
          <input type=text
                 name="some_word_stuff"
                 v-model="some_word">
        </template>
        <div slot-scope="employee">
          <span> {{employee.first_name}} </span>
        </div>
      </dropdown>
    </div>

    <p v-for="item of chosen_items_3"> {{item.last_name}}, {{item.first_name}}</p>

    <ul class="web-menu">
      <li class="menu-option"> <p> Home </p> </li>
      <dropdown ref="dropdown_menu_ex_4"
          :incoming_items="food_menu_items">
        <template slot="header">
          <li tabindex="1" class="menu-option navy-tile">
            <p> Products </p>
          </li>
        </template>
        <template slot-scope="food_item">
          <p class="food"> {{food_item.name}} </p>
        </template>
      </dropdown>
      <dropdown ref="dropdown_menu_ex_5"
                :incoming_items="contact_methods">
        <template slot="header">
          <li tabindex="1" class="menu-option">
            <p> Contact </p>
          </li>
        </template>
        <template slot-scope="contact_method">
          <p class="food"> {{contact_method.contact}}</p>
        </template>
      </dropdown>
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

    some_word = "";

    menu_items = [{ option: "1 Passenger" },
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

    names = [{ first_name: "Elora", last_name: "Blue"},
             { first_name: "Brittany", last_name: "Cost"},
             { first_name: "Sam", last_name: "Sanchez"},
             { first_name: "Jordan", last_name: "Johnson"},
             { first_name: "Michelle", last_name: "Brandt"}
            ];

    food_menu_items = [{name: "Cheeseburger"},
                       {name: "Fries"},
                       {name: "Shake"}
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
  font-size: 14px;
  width: 600px;
}

.food {
  margin: 0;
  padding-top: 2px;
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
  background-color: mediumpurple;
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

.airplane {
  margin-left: 5px;
  margin-right: 10px;
  display: inline-block;
  color: coral;
}

</style>
