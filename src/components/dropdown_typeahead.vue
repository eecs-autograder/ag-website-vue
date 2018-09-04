<template>
  <div>
      <div class="dropdown">
        <input class="dropbtn"
               id="search-field"
               type="text"
               :placeholder="typeahead_placeholder_text"
               v-model="filter_text"
               @blur="hide_the_dropdown()"
               @keydown="move_highlighted($event)"
               @click="show_the_dropdown()">
        <div ref="dropdown_menu" class="dropdown-content">
          <a v-for="(item, index) of filtered_choices"
               @click.stop="select_item_from_menu(item)"
               @mousedown="$event.preventDefault()"
               :class="index == highlighted_index ? 'highlight' : ''">
            {{display_item_fn(item)}}
          </a>
        </div>
      </div>

  </div>
</template>

<script lang="ts">

  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component
  export default class DropdownTypeahead extends Vue {

    @Prop({default: () => ['bye', 'by', 'buy'], type: Array})
    incoming_choices!: any[];

    // @Prop({default: function(item: any, filter_text: string)
    //   { let toReturn = this.default_filter_fn; return toReturn }, type: Function})
    // incoming_filter_fn!: any;
    //
    // @Prop({default: function() {}, type: Function})
    // incoming_display_item_fn: any;

    @Prop({default: null, type: String})
    item_field_name!: string;

    @Prop({default: "Enter a username", type: String})
    placeholder_text!: string;

    display_item_fn: (item: any) => string = this.default_display_item_fn;

    field_name: string = null;

    filter_fn: (item: any, filter_text: string) => boolean = this.filter_words_fn;

    filter_text: string = null;

    _filtered_choices: any[] = null;

    highlighted_index = 0;

    choices: any[];

    typeahead_placeholder_text = "";

    created() {
      this.typeahead_placeholder_text = this.placeholder_text;
      this.choices = this.incoming_choices;
      this.field_name = this.item_field_name;
      // this.filter_fn = this.incoming_filter_fn;
      // this.display_item_fn = this.incoming_display_item_fn;
      console.log(this.typeahead_placeholder_text);
      console.log(this.choices);
      console.log(this.field_name);
      console.log(this.filter_fn);
      console.log(this.display_item_fn);
    }

    filter_words_fn(words: string[], filter_text: string) {
      let matching: string[] = [];
      let prefix = 'by';
      for (let word of words) {
        if (word.substr(0, 2) == prefix) {
          matching.push(word);
        }
      }
      return matching;
    }

    default_filter_fn(item: any, filter_text: string): boolean {
      if (this.item_field_name !== null) {
        item = item[this.item_field_name];
      }
      return item.indexOf(filter_text) >= 0;
    }

    default_display_item_fn(item: any): string {
      if (this.item_field_name !== null) {
        return item[this.item_field_name];
      }
      return item;
    }

    get filtered_choices() {
      if (!this.filter_text) {
        return this.choices;
      }
      if (this._filtered_choices !== null) {
        return this._filtered_choices;
      }
      this._filtered_choices = this.choices.filter(
        (item) => this.filter_fn(item, this.filter_text));
      // How can it be undefined here?
      console.log("I got here");
      if (this.highlighted_index >= this._filtered_choices.length) {
        this.highlighted_index = this._filtered_choices.length - 1;
      }
      return this._filtered_choices;
    }

    move_highlighted(event: KeyboardEvent) {
      if (event.code === 'ArrowDown' || event.keyCode === 40) {
        this.highlighted_index += 1;
        if (this.highlighted_index === this.filtered_choices.length) {
          this.highlighted_index = this.filtered_choices.length - 1;
        }
      }
      else if (event.code === 'ArrowUp' || event.keyCode === 38) {
        this.highlighted_index -= 1;
        if (this.highlighted_index < 0) {
          this.highlighted_index = 0;
        }
      }
      else if (event.code ===  'Escape' || event.keyCode === 27) {
          this.highlighted_index = 0;
      }
      else if (event.keyCode === 13) {
        this.select_item_from_menu(this.filtered_choices[this.highlighted_index]);
      }
    }

    select_item_from_menu(item) {
      this.$emit("change_item_selected", item);
      console.log("Selected an item!");
      this.hide_the_dropdown();
    }

    show_the_dropdown() {
      let dropdown_menu = <HTMLElement> this.$el.getElementsByClassName("dropdown-content")[0];
      dropdown_menu.style.display = "block";
    }

    hide_the_dropdown() {
      let dropdown_menu = <HTMLElement> this.$el.getElementsByClassName("dropdown-content")[0];
      dropdown_menu.style.display = "none";
      console.log("Hide the dropdown");
    }

    // select_highlighted() {
    //   this.$emit("change_item_selected", this.filtered_choices[this.highlighted_index]);
    //   console.log("Do I get called?");
    //   this.hide_the_dropdown();
    // }

  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  .item-highlighted {
    background-color: lightgray;
  }

  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-content {
    display: none;
    border-radius: 5px;
    position: absolute;
    background-color: white;
    min-width: 160px;
    width: 100%;
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
    z-index: 1;
    margin-top: 10px;
  }

  .dropdown-content a {
    color: black;
    padding: 8px 10px;
    text-decoration: none;
    display: block;
    border-top: 1px solid $light-gray;
    margin: 0;
    cursor: pointer;
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    min-height: 13px;
  }

  .dropdown-content a:first-child {
    border-radius: 5px 5px 0 0;
    border-top: none;
  }

  .dropdown-content a:last-child {
    border-radius: 0 0 5px 5px;
  }

  .dropdown-content a:hover {
    /*background-color: hsl(210, 12%, 93%);*/
    /*filter: brightness(80%);*/
  }

  #search-field {
    font-size: 16px;
    margin: 0;
    border-radius: 5px;
    background-color: hsl(210, 13%, 95%);
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    width: 400px;
    height: 24px;
    color: black;
    border: 2px solid hsl(210, 13%, 95%);
    padding: 8px 10px;
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
  }

  #search-field:hover {
    background-color: hsl(210, 12%, 93%);
    border-color: hsl(210, 12%, 93%);
    color: black;
  }

  input:focus {
    outline: none;
  }

  .highlight {
    background-color: hsl(210, 13%, 80%);
  }

</style>
