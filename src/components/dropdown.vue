<template>

  <div class="dropdown"
       tabindex="1"
       @keydown="move_highlighted($event)"
       @blur="hide_the_dropdown_menu">

    <div @click="toggle_dropdown_menu">
      <slot name="header"> </slot>
    </div>

    <div class="dropdown-container">
      <div class="dropdown-content" :style="content_styling">
        <a v-for="(item, index) of items"
        @click="choose_item_from_dropdown_menu(item, index)"
        :id="index === highlighted_index ? 'highlight' : ''">
        {{item}}
        </a>
      </div>
    </div>
  </div>

</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  @Component
  export default class Dropdown extends Vue {

    @Prop({required: true, type: Array})
    incoming_items!: string[];

    @Prop({default: "", type: String})
    incoming_chosen_item!: string;

    @Prop({default: "", type: String})
    dropdown_content_min_width!: string;

    @Prop({default: "", type: String})
    dropdown_content_max_width!: string;

    chosen_item: string = "";
    highlighted_index = 0;
    items: string[] = [];
    content_min_width = "";
    content_max_width = "";
    content_styling = {};
    is_open_ = false;

    created() {
      this.items = this.incoming_items;
      this.chosen_item = this.incoming_chosen_item === ""
        ? this.items[0] : this.incoming_chosen_item;
      this.highlighted_index = this.items.findIndex(item => item === this.chosen_item);
      this.content_min_width = this.dropdown_content_min_width;
      this.content_max_width = this.dropdown_content_max_width;
      this.add_styling();
    }

    get is_open() {
      return this.is_open_;
    }

    add_styling() {
      if (this.content_min_width !== "" && this.content_max_width !== "") {
        this.content_styling = {
          'minWidth' : this.content_min_width,
          'maxWidth' : this.content_max_width
        };
      }
      else if (this.content_min_width === "" && this.content_max_width !== "") {
        this.content_styling = {
          'maxWidth' : this.content_max_width
        };
      }
      else if (this.content_min_width !== "" && this.content_max_width === "") {
        this.content_styling = {
          'minWidth' : this.content_min_width
        };
      }
      else {
        this.content_styling = { };
      }
    }

    mounted() {
      if (this.is_open) {
        this.show_the_dropdown_menu();
      }
      else {
        this.hide_the_dropdown_menu();
      }
    }

    find_chosen_item(item: string) {
      return item === this.chosen_item;
    }

    show_the_dropdown_menu() {
      let dropdown_menu = <HTMLElement> this.$el.getElementsByClassName("dropdown-content")[0];
      dropdown_menu.style.display = "block";
      this.is_open_ = true;
    }

    hide_the_dropdown_menu() {
      let dropdown_menu = <HTMLElement> this.$el.getElementsByClassName("dropdown-content")[0];
      dropdown_menu.style.display = "none";
      this.is_open_ = false;
    }

    choose_item_from_dropdown_menu(item_selected: string, index: number) {
      if (item_selected) {
        this.chosen_item = item_selected;
        this.highlighted_index = index;
        this.$emit("update_item_selected", item_selected);
      }
      this.hide_the_dropdown_menu();
    }

    toggle_dropdown_menu() {
      if (this.is_open) {
        this.is_open_ = false;
        this.hide_the_dropdown_menu();
      }
      else {
        this.is_open_ = true;
        this.show_the_dropdown_menu();
      }
    }

    move_highlighted(event: KeyboardEvent) {
      event.preventDefault();
      event.stopPropagation();
      if (event.code === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        if (this.highlighted_index !== -1 && this.is_open) {
          this.choose_item_from_dropdown_menu(
            this.items[this.highlighted_index], this.highlighted_index
          );
        }
      }
      else {
        if (!this.is_open) {
          this.show_the_dropdown_menu();
        }
        if (event.code === 'ArrowDown') {
          if (this.highlighted_index < this.items.length - 1) {
            this.highlighted_index += 1;
          }
          console.log(this.highlighted_index);
        }
        else if (event.code === 'ArrowUp') {
          if (this.highlighted_index !== -1) {
            this.highlighted_index -= 1;
            if (this.highlighted_index < 0) {
              this.highlighted_index = 0;
              console.log(this.highlighted_index);
            }
          }
        }
        else if (event.code === 'Escape') {
          this.highlighted_index = 0;
        }
      }
    }


  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  .dropdown:focus {
    outline: none;
  }

  .dropdown {
    display: inline-block;
    position: relative;
  }

  .dropdown-outer:focus {
    outline: none;
  }

  .dropdown-content {
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
    display: none;
    margin-top: 10px;
    width: 100%;
    position: absolute;
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
    padding: 10px 15px;
    text-decoration: none;
  }
  .dropdown-content a:first-child {
    border-top: none;
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

</style>
