<template>
  <div class="outermost-dropdown-container">

    <div class="dropdown-container"
         @keydown="move_highlighted($event)">

      <div class="header-container">
        <slot name="header"> </slot>
      </div>

      <div class="dropdown-content" :style="content_styling">
        <div class="dropdown-row" v-for="(item, index) of items"
             @mousedown="$event.preventDefault()"
             @click="choose_item_from_dropdown_menu(item, index)"
             :id="index === highlighted_index ? 'highlight' : ''">
          <slot v-bind="item">  </slot>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  @Component
  export default class Dropdown extends Vue {

    @Prop({required: true, type: Array})
    incoming_items!: object[];

    @Prop({default: 0, type: Number})
    highlighted_index_in!: number;

    @Prop({default: "", type: String})
    dropdown_content_min_width!: string;

    @Prop({default: "", type: String})
    dropdown_content_max_width!: string;

    chosen_item: object = {};
    highlighted_index = 0;
    items: object[] = [];
    content_min_width = "";
    content_max_width = "";
    content_styling = {};
    is_open_ = false;

    created() {
      this.items = this.incoming_items;
      this.highlighted_index = this.highlighted_index_in;
      this.content_min_width = this.dropdown_content_min_width;
      this.content_max_width = this.dropdown_content_max_width;
      this.add_styling();
      this.hide_the_dropdown_menu = this.hide_the_dropdown_menu.bind(this);
    }

    mounted() {
      let dropdown_container = <HTMLElement> this.$el.childNodes[0];
      let header_container = <HTMLElement> dropdown_container.childNodes[0];
      let header_slot_content = <HTMLElement> header_container.childNodes[0];
      header_slot_content.addEventListener("blur", () => {
        this.hide_the_dropdown_menu();
      });
      header_slot_content.addEventListener("click", () => {
        this.toggle_the_dropdown_menu();
      });
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

    choose_item_from_dropdown_menu(item_selected: object, index: number) {
      if (item_selected !== undefined) {
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
        this.show_the_dropdown_menu();
      }
    }

    move_highlighted(event: KeyboardEvent) {
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
          this.toggle_the_dropdown_menu();
        }
      }
    }
  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.dropdown-container:focus {
  outline: none;
}

.dropdown-container {
  display: inline-block;
  position: relative;
}

.dropdown-content {
  background-color: white;
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
  display: none;
  margin-top: 0.5px;
  width: 100%;
  position: absolute;
  z-index: 1;
}

.dropdown-row {
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

.dropdown-row:first-child {
  border-top: none;
}

.dropdown-row:hover {
  background-color: hsl(210, 13%, 95%);
}

#highlight:hover {
  background-color: hsl(210, 13%, 80%);
}

#highlight {
  background-color: hsl(210, 13%, 80%);
}

.outermost-dropdown-container {
  display: inline-block;
}

.chosen {
  background-color: #ace7c9;
}

</style>
