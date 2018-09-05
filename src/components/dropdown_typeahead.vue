<template>
  <div class="droptype-container">
    <!--<p> <b> Filtered_choices: </b> {{filtered_choices}}</p>-->
    <p> <b> Filter Text: </b> {{filter_text}}</p>
    <!--<p> {{filtered_choices_priv === null ? "filter_text is null" : "filter_text is NOT NULL"}}</p>-->
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

  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  @Component
  export default class DropdownTypeahead extends Vue {

    @Prop({default: () => [{name: "Tommy", age: 1}, {name: "Phil", age: 2},
        {name: "Lil", age: 2}, {name: "Lila", age: 24}, {name: "Tominsky", age: 83},
        {name: "Tom", age: 40}, {name: "Liza", age: 40}], type: Array})
    incoming_choices!: any[];

    @Watch('filter_text')
    on_filter_text_changed(new_text: string, old_text: string) {
      console.log("Old: " + old_text + " New: " + new_text);
      if (new_text === "") {
        console.log("new text empty");
        this.filtered_choices_priv = null;
      }
    }


    // @Prop({default: function(item: any, filter_text: string) {
    //     console.log("Item");
    //     console.log(item);
    //   if (this.item_field_name !== null) {
    //     item = item[this.item_field_name];
    //   }
    //   return item.indexOf(filter_text) >= 0;
    //   }, type: Function})
    // incoming_filter_fn!: any;
    //
    // @Prop({default: function(item: any) {
    //   if (this.item_field_name !== null) {
    //     return item[this.item_field_name];
    //   }
    //   return item;
    //   }, type: Function})
    // incoming_display_item_fn: any;

    // @Prop({default: (item: any, filter_text: string) => { return this.default_filter_fn },
    // type: Function})
    // incoming_filter_fn!: any;
    //
    // @Prop({default: (item: any) => { return this.default_display_item_fn }, type: Function})
    // incoming_display_item_fn!: any;

    // @Prop({type: Function})
    // incoming_filter_fn = (item: any, filter_text: string) => boolean = this.default_filter_fn;
    //
    // @Prop({type: Function})
    // incoming_display_item_fn = (item: any) => string = this.default_display_item_fn;

    @Prop({default: "name", type: String})
    item_field_name!: string;

    @Prop({default: "Enter a username", type: String})
    placeholder_text!: string;

    display_item_fn = this.default_display_item_fn;

    field_name: string = null;

    filter_fn = this.default_filter_fn;

    filter_text: string  = null;

    filtered_choices_priv: any[] = [];

    highlighted_index = 0;

    choices: any[] = [];

    blah = this.filter_text === "T" ? "filter_text is null" : "filter_text is NOT NULL";

    typeahead_placeholder_text = "";

    created() {
      this.typeahead_placeholder_text = this.placeholder_text;
      this.choices = this.incoming_choices;
      this.field_name = this.item_field_name;
      // console.log("Filtered choices is null: ");
      // console.log(this.filtered_choices_priv === null);
      // this.filter_fn = this.incoming_filter_fn;
      // this.display_item_fn = this.incoming_display_item_fn;
      // console.log(this.typeahead_placeholder_text);
      // console.log(this.choices);
      // console.log(this.field_name);
      // console.log(this.filter_fn);
      // console.log(this.display_item_fn);
    }

    // v-on:change="reset_filtered_choices()"
    // reset_filtered_choices() {
    //   console.log("resetting");
    //   this.filtered_choices_priv = null;
    // }

    default_filter_fn(item: any, filter_text: string): boolean {
      // console.log("DEFAULT FILTER");
      if (this.item_field_name !== null) {
        item = item[this.item_field_name];
      }
      console.log(item.indexOf(filter_text));
      return item.indexOf(filter_text) >= 0;
    }

    default_display_item_fn(item: any): string {
      // console.log("DEFAULT DISPLAY");
      if (this.item_field_name !== null) {
        return item[this.item_field_name];
      }
      return item;
    }

    get filtered_choices() {
      // console.log("I ran");
      if (!this.filter_text) {
        // console.log("I returned choices");
        return this.choices;
      }

      if (this.filtered_choices_priv !== null) {
        // console.log("I returned _filtered_choices");
        return this.filtered_choices_priv;
      }

      // console.log("I computed _filtered_choices");
      this.filtered_choices_priv = this.choices.filter(
        (item) => this.filter_fn(item, this.filter_text));
      if (this.highlighted_index >= this.filtered_choices_priv.length) {
        this.highlighted_index = this.filtered_choices_priv.length - 1;
      }
      return this.filtered_choices_priv;
    }

    move_highlighted(event: KeyboardEvent) {
      // only allow movement when there are things to choose from
      if (this.filtered_choices) {
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
        else if (event.code === 'Escape' || event.keyCode === 27) {
          this.highlighted_index = 0;
        }
        else if (event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          this.select_item_from_menu(this.filtered_choices[this.highlighted_index]);
        }
      }
    }

    select_item_from_menu(item: any) {
      this.$emit("add_item_selected", item);
      this.hide_the_dropdown();
    }

    show_the_dropdown() {
      let dropdown_menu = <HTMLElement> this.$el.getElementsByClassName("dropdown-content")[0];
      dropdown_menu.style.display = "block";
    }

    hide_the_dropdown() {
      let dropdown_menu = <HTMLElement> this.$el.getElementsByClassName("dropdown-content")[0];
      dropdown_menu.style.display = "none";
    }

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

  .droptype-container {
    margin-left: 60px;
    margin-top: 60px;
  }

</style>
