<template>
  <div class="outermost-dropdown-container">
    <div class="dropdown-container"
         @keydown="move_highlighted($event)">

      <div class="header-container">
        <slot name="header"> </slot>
      </div>

      <div class="dropdown-content"
           :style="[{display: is_open ? 'block' : 'none'}]">
        <div class="dropdown-row" v-for="(item, index) of items"
             @mousedown="$event.preventDefault()"
             @click="choose_item_from_dropdown_menu(item, index)"
             :id="index === highlighted_index ? 'highlight' : ''">
          <slot v-bind:item="item"> </slot>
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

    chosen_item: object = {};
    highlighted_index = 0;
    items: object[] = [];
    is_open_ = false;

    @Watch('incoming_items')
    on_filter_text_changed(new_val: object[], old_val: object[]) {
      this.items = new_val;
      if (this.highlighted_index >= this.items.length && this.items.length > 0) {
        this.highlighted_index = this.items.length - 1;
      }
    }

    created() {
      this.items = this.incoming_items;
      this.highlighted_index = this.highlighted_index_in;
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

    show_the_dropdown_menu() {
      this.is_open_ = true;
    }

    hide_the_dropdown_menu() {
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
      this.is_open_ = !this.is_open_;
    }

    move_highlighted(event: KeyboardEvent) {
      if (event.code === "Enter" && this.is_open && this.items.length > 0) {
        event.preventDefault();
        event.stopPropagation();
        this.choose_item_from_dropdown_menu(
          this.items[this.highlighted_index], this.highlighted_index
        );
      }
      else if (event.code === 'ArrowDown') {
        event.preventDefault();
        event.stopPropagation();

        this.show_the_dropdown_menu();

        if (this.highlighted_index < this.items.length - 1) {
          this.highlighted_index += 1;
        }
      }
      else if (event.code === 'ArrowUp') {
        event.preventDefault();
        event.stopPropagation();

        this.show_the_dropdown_menu();

        if (this.highlighted_index > 0) {
          this.highlighted_index -= 1;
        }
      }
      else if (event.code === 'Escape') {
        this.hide_the_dropdown_menu();
      }
    }
  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.dropdown-container {
  display: block;
  position: relative;
}

.dropdown-content {
  background-color: white;
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
  display: block;
  margin-top: 0.5px;
  position: absolute;
  z-index: 1;
}

.dropdown-row {
  border-top: 1px solid $pebble-dark;
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

.chosen {
  background-color: #ace7c9;
}

</style>
