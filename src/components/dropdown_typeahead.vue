<template>
  <div class="dropdown-typeahead-container">
      <div class="dropdown">
        <input id="search-field"
               type="text"
               :placeholder="placeholder_text"
               v-model="filter_text"
               @blur="hide_the_dropdown()"
               @keydown="move_highlighted($event)"
               @click="show_the_dropdown()">
        <div class="dropdown-content">
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

    @Prop({required: true, type: Array})
    incoming_choices!: object[];

    @Prop({default: null, type: String})
    item_field_name!: string | null;

    @Prop({required: true, type: String})
    incoming_placeholder_text!: string;

    @Watch('filter_text')
    on_filter_text_changed() {
      this.filtered_choices_priv = null;
    }

    display_item_fn = this.default_display_item_fn;

    field_name: string = "";

    filter_fn = this.default_filter_fn;

    filter_text: string = "";

    filtered_choices_priv: object[] = [];

    highlighted_index = 0;

    choices: object[] = [];

    placeholder_text = "";

    dropdown_visible = false;

    created() {
      this.placeholder_text = this.incoming_placeholder_text;
      this.choices = this.incoming_choices;
      this.field_name = this.item_field_name;
      // this.filter_fn = this.incoming_filter_fn;
      // this.display_item_fn = this.incoming_display_item_fn;
    }

    default_filter_fn(item: object, filter_text: string): boolean {
      if (this.item_field_name !== null) {
        item = item[this.item_field_name];
      }
      return item.indexOf(filter_text) >= 0;
    }

    default_display_item_fn(item: object): object {
      if (this.item_field_name !== null) {
        return item[this.item_field_name];
      }
      return item;
    }

    get filtered_choices() {
      if (!this.filter_text) {
        return this.choices;
      }
      if (this.filtered_choices_priv !== null) {
        return this.filtered_choices_priv;
      }
      this.filtered_choices_priv = this.choices.filter(
        (item) => this.filter_fn(item, this.filter_text));
      if (this.highlighted_index >= this.filtered_choices_priv.length) {
        this.highlighted_index = this.filtered_choices_priv.length - 1;
      }
      // Reset to 0th index when backtracking
      if (this.filtered_choices_priv.length > 0 && this.highlighted_index < 0) {
        this.highlighted_index = 0;
      }
      return this.filtered_choices_priv;
    }

    move_highlighted(event: KeyboardEvent) {
      if (event.code === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        if (this.dropdown_visible) {
          this.select_item_from_menu(this.filtered_choices[this.highlighted_index]);
        }
      }
      else {
        if (!this.dropdown_visible) {
          this.show_the_dropdown();
        }
        if (event.code === 'ArrowDown') {
          this.highlighted_index += 1;
          if (this.highlighted_index >= this.filtered_choices.length) {
            this.highlighted_index = this.filtered_choices.length - 1;
          }
        }
        else if (event.code === 'ArrowUp') {
          if (this.highlighted_index !== -1) {
            this.highlighted_index -= 1;
            if (this.highlighted_index < 0) {
              this.highlighted_index = 0;
            }
          }
        }
        else if (event.code === 'Escape') {
          this.highlighted_index = 0;
        }
      }
    }

    select_item_from_menu(item: object) {
      if (item) {
        this.$emit("add_item_selected", item);
        this.highlighted_index = 0;
        this.hide_the_dropdown();
      }
    }

    show_the_dropdown() {
      let dropdown_menu = <HTMLElement> this.$el.getElementsByClassName("dropdown-content")[0];
      dropdown_menu.style.display = "block";
      this.dropdown_visible = true;
    }

    hide_the_dropdown() {
      let dropdown_menu = <HTMLElement> this.$el.getElementsByClassName("dropdown-content")[0];
      dropdown_menu.style.display = "none";
      this.dropdown_visible = false;
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
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    border-top: none;
  }

  .dropdown-content a:last-child {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
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
    padding: 6px 10px;
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

  .dropdown-typeahead-container {
    margin-left: 100px;
    margin-top: 60px;
  }

</style>
