<template>
  <div id="outermost-dropdown-container">
    <div id="dropdown-container"
         @keydown="move_highlighted($event)">

      <div id="header-container">
        <slot name="header"> </slot>
      </div>

      <div id="dropdown-content"
           :style="[{display: is_open ? 'block' : 'none'}, {height: dropdown_height},
                    {overflowY: dropdown_height !== 'auto' ? 'scroll' : 'none'}]">
        <div :class="['dropdown-row', {'highlight': index === d_highlighted_index}]"
             v-for="(item, index) of d_items"
             @mousedown="$event.preventDefault()"
             @click="choose_item_from_dropdown_menu(item, index)">
          <slot v-bind:item="item">{{item}}</slot>
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
  items!: object[];

  @Prop({default: 0, type: Number})
  initial_highlighted_index!: number;

  @Prop({default: "auto", type: String})
  dropdown_height!: string;

  private d_highlighted_index = 0;
  private d_items: object[] = [];
  private d_is_open = false;

  created() {
    this.d_items = this.items;
    this.d_highlighted_index = this.initial_highlighted_index;
    console.log("Dropdown created");
  }

  mounted() {
    if (this.$slots.header === undefined) {
      throw Error('Missing required slot: "header"');
    }

    let header_slot_content = this.$slots.header[0].elm!;
    header_slot_content.addEventListener("blur", () => {
      this.hide_the_dropdown_menu();
    });
    header_slot_content.addEventListener("click", () => {
      this.d_is_open = !this.d_is_open;
    });
    console.log("Dropdown mounted");
  }

  get current_highlighted_index() {
    return this.d_highlighted_index;
  }

  @Watch('items')
  on_items_changed(new_val: object[], old_val: object[]) {
    this.d_items = new_val;
    if (this.d_highlighted_index >= this.d_items.length && this.d_items.length > 0) {
      this.d_highlighted_index = this.d_items.length - 1;
    }
  }

  get is_open() {
    return this.d_is_open;
  }

  show_the_dropdown_menu() {
    this.d_is_open = true;
  }

  hide_the_dropdown_menu() {
    this.d_is_open = false;
  }

  choose_item_from_dropdown_menu(item_selected: object, index: number) {
    this.d_highlighted_index = index;
    this.$emit("update_item_selected", item_selected);
    this.hide_the_dropdown_menu();
  }

  move_highlighted(event: KeyboardEvent) {
    if (event.code === "Enter" && this.is_open && this.d_items.length > 0) {
      event.preventDefault();
      event.stopPropagation();
      this.choose_item_from_dropdown_menu(
        this.d_items[this.d_highlighted_index], this.d_highlighted_index
      );
    }
    else if (event.code === 'ArrowDown') {
      event.preventDefault();
      event.stopPropagation();

      this.show_the_dropdown_menu();

      if (this.d_highlighted_index < this.d_items.length - 1) {
        this.d_highlighted_index += 1;
      }
    }
    else if (event.code === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();

      this.show_the_dropdown_menu();

      if (this.d_highlighted_index > 0) {
        this.d_highlighted_index -= 1;
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

.highlight:hover {
  background-color: $pebble-dark;
}

.highlight {
  background-color: $pebble-dark;
}

</style>
