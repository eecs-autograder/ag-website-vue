<template>
  <div id="outermost-dropdown-container">
    <div id="dropdown-container"
         @keydown="move_highlighted($event)">

      <div id="header-container">
        <slot name="header"> </slot>
      </div>

      <div id="dropdown-content"
           :style="[{display: is_open ? 'block' : 'none'}]">
        <div class="dropdown-row" v-for="(item, index) of items"
             @mousedown="$event.preventDefault()"
             @click="choose_item_from_dropdown_menu(item, index)"
             :id ="index === highlighted_index ? 'highlight': ''">
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
    on_items_changed(new_val: object[], old_val: object[]) {
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
@import '@/styles/components/dropdown_styles.scss';

#dropdown-container {
  display: block;
  position: relative;
}

#dropdown-content {
  @extend %dropdown-content;
}

.dropdown-row {
  @extend %dropdown-row;
  cursor: pointer;
}

.dropdown-row:first-child {
  border-top: none;
}

.dropdown-row:hover {
  background-color: $pebble-light;
}

#highlight:hover {
  background-color: $pebble-dark;
}

#highlight {
  background-color: $pebble-dark;
}

</style>
