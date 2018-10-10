<template>
  <div id="dropdown-typeahead-container">
    <Dropdown ref="dropdown_component"
              :items="filtered_choices"
              @update_item_selected="$emit('update_item_chosen', $event)">
      <template slot="header">
        <input id="search-field"
               type=text
               :placeholder="placeholder_text"
               name="filtered_search"
               v-model="filter_text"
               @keydown="resume_search($event)">
      </template>
      <template slot-scope="{item}">
        <slot v-bind:item="item">
            {{item}}
        </slot>
      </template>
    </Dropdown>
    <div v-if="filtered_choices.length === 0 && $refs.dropdown_component.is_open"
         id="no-matching-results">
      <div id="no-matching-results-row">
        <slot name="no_matching_results" v-bind:filter_text="filter_text">
          We couldn't find any results containing: '{{filter_text}}'
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Dropdown from '@/components/dropdown.vue';

import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
@Component({
  components: { Dropdown }
})
export default class DropdownTypeahead extends Vue {

  @Prop({required: true, type: Array})
  choices!: object[];

  @Prop({required: true, type: String})
  placeholder_text!: string;

  @Prop({required: true, type: Function})
  filter_fn!: (item: object, filter: string) => boolean;

  d_choices: object[] = [];
  filter_text: string = "";
  private _filtered_choices: object[] = [];

  created() {
    this.d_choices = this.choices;
  }

  resume_search(key: KeyboardEvent) {
    let dropdown = <Dropdown> this.$refs.dropdown_component;
    if (!dropdown.is_open) {
      // don't want to automatically select what was previously selected
      if (key.code !== "Enter") {
        dropdown.show_the_dropdown_menu();
      }
    }
  }

  get filtered_choices() {
    if (this.filter_text === "") {
      return this.d_choices;
    }
    this._filtered_choices = this.d_choices.filter(
      (item) => this.filter_fn(item, this.filter_text));
    return this._filtered_choices;
  }

}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/components/dropdown_styles.scss';

#search-field {
  border-radius: 5px;
  background-color: $pebble-light;
  border: 2px solid $pebble-light;
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
  color: black;
  font-family: "Helvetica Neue", Helvetica, sans-serif;
  font-size: 16px;
  height: 24px;
  margin: 0;
  padding: 6px 10px;
  width: 100%;
}

#search-field:hover {
  background-color: $pebble-medium;
  border-color: $pebble-medium;
  color: black;
}

#search-field:focus {
  outline-color: $ocean-blue;
}

#no-matching-results {
  @extend %dropdown-content;
}

#no-matching-results-row {
  @extend %dropdown-row;
}

</style>
