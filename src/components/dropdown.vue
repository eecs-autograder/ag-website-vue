<template>
<<<<<<< 2f6ee573e0593083ef025b39d01af5bfd9cfedc4
  <div class="outermost-dropdown-container">
    <div class="dropdown-container"
         tabindex="1"
         @keydown="move_highlighted($event)"
         @blur="hide_the_dropdown_menu">

      <div @click="toggle_the_dropdown_menu">
        <slot name="header"> </slot>
      </div>

      <div class="dropdown-content" :style="content_styling">
        <a v-for="(item, index) of items"
        @click="choose_item_from_dropdown_menu(item, index)"
        :id="index === highlighted_index ? 'highlight' : ''">
        {{item}}
=======
  <div class="dropdown-container">
    <div class="dropdown" tabindex="1"
      @blur="hide_the_dropdown_menu()">
      <div id="dropdown-top"
         @click="toggle_dropdown_menu()">
        <p> {{chosen_item}} </p>
        <i class="fas fa-angle-down fa-lg arrow-down"> </i>
      </div>
      <div class="dropdown-content">
        <a v-for="(item, index) of items"
           @click="choose_item_from_dropdown_menu(item, index)"
           :id="index === highlighted_index ? 'highlight' : ''">
          {{item}}
>>>>>>> Created the initial layout for the dropdown component and basic functionality for the dropdown menu (show dropdown contents, hide dropdown contents, toggle dropdown menu, select an item from the dropdown menu, etc.).
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
<<<<<<< 2f6ee573e0593083ef025b39d01af5bfd9cfedc4
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  @Component
=======
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
    components: { }
  })

>>>>>>> Created the initial layout for the dropdown component and basic functionality for the dropdown menu (show dropdown contents, hide dropdown contents, toggle dropdown menu, select an item from the dropdown menu, etc.).
  export default class Dropdown extends Vue {

    @Prop({required: true, type: Array})
    incoming_items!: string[];

    @Prop({default: "", type: String})
    incoming_chosen_item!: string;

<<<<<<< 2f6ee573e0593083ef025b39d01af5bfd9cfedc4
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
=======
    dropdown_is_visible = false;
    items: string[] = [];

    chosen_item: string = "";

    highlighted_index = 0;
>>>>>>> Created the initial layout for the dropdown component and basic functionality for the dropdown menu (show dropdown contents, hide dropdown contents, toggle dropdown menu, select an item from the dropdown menu, etc.).

    created() {
      this.items = this.incoming_items;
      this.chosen_item = this.incoming_chosen_item === ""
        ? this.items[0] : this.incoming_chosen_item;
<<<<<<< 2f6ee573e0593083ef025b39d01af5bfd9cfedc4
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

    invoke_focus_on_dropdown() {
      let dropdown_outer = <HTMLElement> this.$el.getElementsByClassName("dropdown-container")[0];
      dropdown_outer.focus();
    }

    invoke_blur_on_dropdown() {
      let dropdown_outer = <HTMLElement> this.$el.getElementsByClassName("dropdown-container")[0];
      dropdown_outer.blur();
=======
      this.highlighted_index = this.items.findIndex(this.find_chosen_item);
    }

    find_chosen_item(item: string) {
      console.log(item);
      console.log(item === this.chosen_item);
      return item === this.chosen_item;
>>>>>>> Created the initial layout for the dropdown component and basic functionality for the dropdown menu (show dropdown contents, hide dropdown contents, toggle dropdown menu, select an item from the dropdown menu, etc.).
    }

    show_the_dropdown_menu() {
      let dropdown_menu = <HTMLElement> this.$el.getElementsByClassName("dropdown-content")[0];
      dropdown_menu.style.display = "block";
<<<<<<< 2f6ee573e0593083ef025b39d01af5bfd9cfedc4
      this.is_open_ = true;
    }

    hide_the_dropdown_menu() {
      let dropdown_menu = <HTMLElement> this.$el.getElementsByClassName("dropdown-content")[0];
      dropdown_menu.style.display = "none";
      this.is_open_ = false;
      this.invoke_blur_on_dropdown();
    }

    choose_item_from_dropdown_menu(item_selected: string, index: number) {
      if (item_selected) {
        this.chosen_item = item_selected;
        this.highlighted_index = index;
        this.$emit("update_item_selected", item_selected);
      }
      this.hide_the_dropdown_menu();
    }

    toggle_the_dropdown_menu() {
      if (this.is_open) {
        this.is_open_ = false;
        this.hide_the_dropdown_menu();
      }
      else {
        this.is_open_ = true;
=======
      this.dropdown_is_visible = true;
    }
    hide_the_dropdown_menu() {
      let dropdown_menu = <HTMLElement> this.$el.getElementsByClassName("dropdown-content")[0];
      dropdown_menu.style.display = "none";
      this.dropdown_is_visible = false;
      console.log("Closed it");
    }

    choose_item_from_dropdown_menu(item_selected: string, index: number) {
      this.chosen_item = item_selected;
      this.highlighted_index = index;
      this.hide_the_dropdown_menu();
    }

    toggle_dropdown_menu() {
      if (this.dropdown_is_visible) {
        this.hide_the_dropdown_menu();
      }
      else {
>>>>>>> Created the initial layout for the dropdown component and basic functionality for the dropdown menu (show dropdown contents, hide dropdown contents, toggle dropdown menu, select an item from the dropdown menu, etc.).
        this.show_the_dropdown_menu();
      }
    }

<<<<<<< 2f6ee573e0593083ef025b39d01af5bfd9cfedc4
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

=======
>>>>>>> Created the initial layout for the dropdown component and basic functionality for the dropdown menu (show dropdown contents, hide dropdown contents, toggle dropdown menu, select an item from the dropdown menu, etc.).

  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

<<<<<<< 2f6ee573e0593083ef025b39d01af5bfd9cfedc4
  .dropdown-container:focus {
    outline: none;
  }

  .dropdown-container {
=======
  .dropdown {
>>>>>>> Created the initial layout for the dropdown component and basic functionality for the dropdown menu (show dropdown contents, hide dropdown contents, toggle dropdown menu, select an item from the dropdown menu, etc.).
    display: inline-block;
    position: relative;
  }

<<<<<<< 2f6ee573e0593083ef025b39d01af5bfd9cfedc4
=======
  .dropdown:focus {
    outline:none;
  }

>>>>>>> Created the initial layout for the dropdown component and basic functionality for the dropdown menu (show dropdown contents, hide dropdown contents, toggle dropdown menu, select an item from the dropdown menu, etc.).
  .dropdown-content {
    background-color: white;
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
    display: none;
<<<<<<< 2f6ee573e0593083ef025b39d01af5bfd9cfedc4
    margin-top: 0px;
    width: 100%;
    position: absolute;
    z-index: 1;
  }

=======
    margin-top: 1px;
    position: absolute;
    width: 100%;
    z-index: 1;
  }
>>>>>>> Created the initial layout for the dropdown component and basic functionality for the dropdown menu (show dropdown contents, hide dropdown contents, toggle dropdown menu, select an item from the dropdown menu, etc.).
  .dropdown-content a {
    border-top: 1px solid $light-gray;
    color: black;
    cursor: pointer;
    display: block;
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    margin: 0;
    min-height: 13px;
<<<<<<< 2f6ee573e0593083ef025b39d01af5bfd9cfedc4
    padding: 10px 15px;
    text-decoration: none;
  }

  .dropdown-content a:first-child {
    border-top: none;
  }

  .dropdown-content a:hover {
    background-color: hsl(210, 13%, 95%);
  }

  #highlight:hover {
    background-color: hsl(210, 13%, 80%);
  }

=======
    padding: 8px 10px;
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
>>>>>>> Created the initial layout for the dropdown component and basic functionality for the dropdown menu (show dropdown contents, hide dropdown contents, toggle dropdown menu, select an item from the dropdown menu, etc.).
  #highlight {
    background-color: hsl(210, 13%, 80%);
  }

<<<<<<< 2f6ee573e0593083ef025b39d01af5bfd9cfedc4
  .outermost-dropdown-container {
    display: inline-block;
=======
  #dropdown-top {
    background-color: hsl(210, 13%, 90%);
    border: 2px solid hsl(210, 13%, 90%);
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
    color: black;
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    font-size: 16px;
    margin: 0;
    padding: 6px 10px;
    min-width: 200px;
  }

  #dropdown-top p {
    margin: 0;
    padding: 2px;
  }

  #dropdown-top:hover {
    background-color: hsl(210, 12%, 93%);
    border-color: hsl(210, 12%, 93%);
    color: black;
  }

  .arrow-down {
    position: absolute;
    right: 22px;
    top: 13px;
    color: hsl(210, 12%, 40%);
  }

  .arrow-down:hover {
    color: hsl(210, 12%, 30%);
>>>>>>> Created the initial layout for the dropdown component and basic functionality for the dropdown menu (show dropdown contents, hide dropdown contents, toggle dropdown menu, select an item from the dropdown menu, etc.).
  }

</style>
