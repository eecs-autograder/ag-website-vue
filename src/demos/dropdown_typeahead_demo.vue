<template>
  <div class="typeahead-demo">
    <p class="typeahead-label"><b> This Dropdown Typeahead instance deals with { state: string }
      objects and uses a scoped slot </b></p>
    <div class="control-width-1">
      <dropdown-typeahead
        placeholder_text="Enter a State"
        :choices="states"
        @update_item_chosen="add_item_1($event)"
        :filter_fn="filter_fn_1">
        <template slot-scope="{item}">
          <span> {{item.state}}</span>
        </template>
        <template slot="no_matching_results" slot-scope="{filter_text}">
          We couldn't find any states that contain: '{{filter_text}}'
        </template>
      </dropdown-typeahead>
    </div>

    <div class="typeahead-1-selections">
      <h3> Chosen from Typeahead: </h3>
      <p v-for="item of chosen_items_1"> {{item.state}} </p>
    </div>

    <p class="typeahead-label"><b> This Dropdown Typeahead instance deals with { first_name:
      string, last_name: string } objects and uses a scoped slot</b></p>
    <div class="control-width-2">
      <dropdown-typeahead
        placeholder_text="Enter a Character"
        :choices="strangers"
        @update_item_chosen="add_item_2($event)"
        :filter_fn="stranger_things_filter_fn">
        <template  slot-scope="{item}">
          <span> {{item.first_name}} {{item.last_name}}</span>
        </template>
      </dropdown-typeahead>
    </div>

    <div class="typeahead-2-selections">
      <h3> Chosen from Typeahead: </h3>
      <p v-for="item of chosen_items_2"> {{item.last_name}}, {{item.first_name}} </p>
    </div>

    <p class="typeahead-label">
      <b>
        This Dropdown Typeahead instance deals with string objects
        and uses the default scoped-slot styling. <br>
        It also has a custom "No results" message.
      </b>
    </p>
    <div class="control-width-3">
      <dropdown-typeahead
        placeholder_text="Enter a Season"
        :choices="seasons"
        @update_item_chosen="add_item_3($event)"
        :filter_fn="seasons_filter_fn">
        <template slot="no_matching_results">
          No Matching Results
        </template>
      </dropdown-typeahead>
    </div>

    <div class="typeahead-3-selections">
      <h3> Chosen from Typeahead: </h3>
      <p v-for="item of chosen_items_3"> {{item}} </p>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import DropdownTypeahead from '@/components/dropdown_typeahead.vue';

@Component({
  components: { DropdownTypeahead }
})
export default class ModalDemo extends Vue {

  states = [
    {state: "MissouriMissouriMissouriMissouriMissouri"},
    {state: "Mississippi"},
    {state: "Minnesota"},
    {state: "Massachusetts"},
    {state: "Maine"},
    {state: "Montana"},
    {state: "Michigan"},
    {state: "Maryland"}
  ];

  add_item_1(item: object) {
    this.chosen_items_1.push(item);
  }

  chosen_items_1: object[] = [];

  filter_fn_1(item: {state: string}, filter_text: string) {
    return item.state.indexOf(filter_text) >= 0;
  }

  strangers = [
    {first_name: "Joyce", last_name: "Byers"},
    {first_name: "Will", last_name: "Byers"},
    {first_name: "Jonathan", last_name: "Byers"},
    {first_name: "Nancy", last_name: "Wheeler"},
    {first_name: "Mike", last_name: "Wheeler"},
    {first_name: "Steve", last_name: "Harrington"},
    {first_name: "Jim", last_name: "Hopper"}
  ];

  stranger_things_filter_fn(item: {first_name: string, last_name: string},
                            filter_text: string) {
    let full_name: string = item.first_name + " " + item.last_name;
    return full_name.indexOf(filter_text) >= 0;
  }

  chosen_items_2: object[] = [];

  add_item_2(item: object) {
    this.chosen_items_2.push(item);
  }

  seasons = [
    "FallFallFallFallFallFallFallFallFallFallFallFallFallFallFallFall",
    "Winter",
    "Spring",
    "Summer"
  ];

  seasons_filter_fn(item: string, filter_text: string) {
    return item.indexOf(filter_text) >= 0;
  }

  chosen_items_3: object[] = [];

  add_item_3(item: object) {
    this.chosen_items_3.push(item);
  }

}
</script>

<style scoped lang="scss">

.typeahead-1-selections, .typeahead-2-selections, .typeahead-3-selections{
  margin: 30px 0 150px 0;
  padding: 30px;
  display: inline-block;
}

.typeahead-1-selections {
  background-color: darkseagreen;
}

.typeahead-2-selections {
  background-color: indianred;
}

.typeahead-3-selections {
  background-color: plum;
}

.typeahead-label {
  margin: 20px 0;
}

h3 {
  margin: 0;
}

p {
  margin: 10px 0;
}

.control-width-1 {
  width: 306.5px;
}

.control-width-2 {
  width: 50%;
  min-width: 300px;
}

.control-width-3 {
  width: 20%;
  min-width: 200px;
}

</style>
