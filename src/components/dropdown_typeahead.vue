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
             :id="index == highlighted_index ? 'highlight' : ''">
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

    @Prop(
      { default: function(item: object) {
        if (this.item_field_name !== null) {
          return item[this.item_field_name];
        }
        return item;
        },
        type: Function
      }
    )
    incoming_display_item_fn!: (item: object) => object;

    @Prop(
      { default: function(item: object, filter_text: string) {
        if (this.item_field_name !== null) {
          item = item[this.item_field_name];
        }
        return item.indexOf(filter_text) >= 0;
        },
        type: Function
      }
    )
    incoming_filter_fn!: (item: object, filter: string) => boolean;

    display_item_fn = function(item: object) {
      return item;
    };

    filter_fn = function(item: object, filter: string) {
      return true;
    };

    field_name: string | null = "";

    filter_text = "";

    filtered_choices_priv: object[] | null = [];

    choices: object[] = [];

    highlighted_index = 0;

    placeholder_text = "";

    dropdown_visible = false;

    is_item: {[index: string ]: object} = {};

    created() {
      this.placeholder_text = this.incoming_placeholder_text;
      this.choices = this.incoming_choices;
      this.field_name = this.item_field_name;
      this.filter_fn = this.incoming_filter_fn;
      this.display_item_fn = this.incoming_display_item_fn;
    }

    get filtered_choices() {
      if (!this.filter_text) {
        this.highlighted_index = 0;
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
        if (this.dropdown_visible && this.highlighted_index !== -1) {
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
      else {
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

  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  .dropdown {
    display: inline-block;
    position: relative;
  }

  .dropdown-content {
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
    display: none;
    margin-top: 10px;
    min-width: 160px;
    position: absolute;
    width: 100%;
    z-index: 1;
  }

  .dropdown-content a {
    border-top: 1px solid $light-gray;
    color: black;
    cursor: pointer;
    display: block;
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    margin: 0;
    min-height: 13px;
    padding: 8px 10px;
    text-decoration: none;
  }

  .dropdown-content a:first-child {
    border-top: none;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  .dropdown-content a:last-child {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  .dropdown-content a:hover {
    background-color: hsl(210, 13%, 95%);
  }

  #highlight:hover {
    background-color: hsl(210, 13%, 80%);
  }

  #highlight {
    background-color: hsl(210, 13%, 80%);
  }

  #search-field {
    background-color: hsl(210, 13%, 95%);
    border: 2px solid hsl(210, 13%, 95%);
    border-radius: 5px;
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
    color: black;
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    font-size: 16px;
    height: 24px;
    margin: 0;
    padding: 6px 10px;
    width: 400px;
  }

  #search-field:focus {
    outline: none;
  }

  #search-field:hover {
    background-color: hsl(210, 12%, 93%);
    border-color: hsl(210, 12%, 93%);
    color: black;
  }

</style>
