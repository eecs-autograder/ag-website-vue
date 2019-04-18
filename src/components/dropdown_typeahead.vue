<template>
  <div id="dropdown-typeahead-container">
    <Dropdown ref="dropdown_component"
              :items="filtered_choices"
              @update_item_selected="$emit('update_item_chosen', $event)">
      <template slot="header">
        <input :class="typeahead_class"
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
    <div v-if="filtered_choices.length === 0
               && d_mounted_called && $refs.dropdown_component.is_open"
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

  @Prop({default: "search-field", type: String})
  typeahead_class!: string;

  d_choices: object[] = [];
  filter_text: string = "";
  private _filtered_choices: object[] = [];

  created() {
    this.d_choices = this.choices;
  }
  
  private d_mounted_called = false;
  
  mounted() {
    // When this is true, we can safely access $refs in the template.
    this.d_mounted_called = true;
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

  clear_filter_text() {
    this.filter_text = "";
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

#dropdown-typeahead-container {
  position: relative;
}

.search-field {
  background-color: white;
  border: 1px solid #ced4da;
  border-radius: .25rem;
  box-sizing: border-box;
  color: #495057;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
  padding: .375rem .75rem;
  width: 100%;
}

.search-field:hover {
  border: 1px solid $ocean-blue;
}

.search-field:focus {
  outline-color: $ocean-blue;
}

#no-matching-results {
  @extend %dropdown-content;
}

#no-matching-results-row {
  @extend %dropdown-row;
}

</style>
