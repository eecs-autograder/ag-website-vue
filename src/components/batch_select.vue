<template>
  <div class="batch-select">
    <button class="button white-button batch-select-button"
            @click="show_batch_select_modal"
            aria-label="Open batch select"
    >
      Batch Select
    </button>
    <div @click.stop>
      <modal v-if="d_show_batch_select_modal"
             @close="d_show_batch_select_modal = false"
             size="large"
             click_outside_to_close
             :aria-label="aria_label">
        <div class="modal-header">
          Select Items ({{ d_selected_items.length }} out of
          {{ choices.length }} items selected)
        </div>
        <input class="input batch-search-field"
               type="text"
               aria-label="Filter"
               placeholder="Enter a name"
               v-model="d_batch_search_query"
        />
        <div>
          <ul
            class="batch-select-card-grid"
            ref="listbox_element"
            role="listbox"
            aria-multiselectable="true"
            aria-orientation="horizontal"
            :aria-activedescendant="active_option_id"
            @keydown.left.prevent.stop="focus_prev"
            @keydown.right.prevent.stop="focus_next"
            @keydown.up.prevent.stop="focus_prev"
            @keydown.down.prevent.stop="focus_next"
            tabindex="0"
            @focus="focus_enter()"
            @blur="d_current_focus_index = null"
            @keydown.space.prevent.stop="toggle_focused_element"
          >
            <li class="batch-select-card"
                v-for="(item, index) of batch_filtered_items"
                :key="item.pk"
                :id="option_id(index)"
                :class="{
                  selected: item_is_selected(item),
                  'active-descendant': d_current_focus_index === index,
                }"
                :aria-selected="item_is_selected(item) ? 'true' : 'false'"
                @click="batch_toggle_select(item)"
                ref="batch_select_option"
                role="option"
            >
              <slot v-bind:item="item"></slot>
            </li>
          </ul>
        </div>
        <div class="button-footer-right modal-button-footer">
          <button class="modal-confirm-button"
                  @click="confirm_selection">
            Confirm
          </button>
          <button class="modal-cancel-button"
                  @click="d_show_batch_select_modal = false">
            Cancel
          </button>
        </div>
      </modal>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import _ from 'lodash';

import Modal from '@/components/modal.vue';
import { assert_not_null, generate_uid } from '@/utils';

// types for function props
type Comparator = (lhs: unknown, rhs: unknown) => boolean;
type Filter = (item: unknown, filter_text: string) => boolean;

@Component({
  components: {
    Modal
  }
})
export default class BatchSelect extends Vue {
  @Prop({ required: true, type: Array })
  choices!: unknown[];

  @Prop({ type: Array })
  value!: unknown[];

  @Prop({ type: Function })
  are_items_equal!: Comparator;

  @Prop({ type: Function })
  filter_fn!: Filter;

  @Prop({required: true, type: String})
  aria_label!: string;

  d_show_batch_select_modal = false;
  d_batch_search_query: string = "";
  d_selected_items: unknown[] = [];

  d_current_focus_index: number | null = null;

  created() {
    this.d_selected_items = this.value.slice();
  }

  async show_batch_select_modal() {
    this.d_show_batch_select_modal = true
    await this.$nextTick();
    (<HTMLElement> this.$refs.listbox_element).focus();
  }

  @Watch("value", { deep: true })
  on_value_change(new_value: unknown[], old_value: unknown[]) {
    this.d_selected_items = this.value.slice();
  }

  focus_enter() {
    if (this.batch_filtered_items.length === 0) {
      return;
    }
    const first_selected_index = this.batch_filtered_items.findIndex((item) => this.item_is_selected(item));
    this.focus_index(first_selected_index === -1 ? 0 : first_selected_index);
  }

  focus_prev() {
    assert_not_null(this.d_current_focus_index);
    this.focus_index(Math.max(0, this.d_current_focus_index - 1));
  }

  focus_next() {
    assert_not_null(this.d_current_focus_index);
    this.focus_index(Math.min(this.batch_filtered_items.length - 1, this.d_current_focus_index + 1));
  }

  focus_index(index: number) {
    this.d_current_focus_index = index;
  }

  toggle_focused_element() {
    if (this.d_current_focus_index !== null) {
      this.batch_toggle_select(this.batch_filtered_items[this.d_current_focus_index]);
    }

  }

  batch_toggle_select(item: unknown) {
    if (_.some(this.d_selected_items, (el) => this.are_items_equal(el, item))) {
      this.d_selected_items = _.filter(
        this.d_selected_items,
        (el) => !this.are_items_equal(el, item)
      );
    }
    else {
      this.d_selected_items.push(item);
    }
  }

  get batch_filtered_items() {
    return _.isEmpty(this.d_batch_search_query) ?
      this.choices :
      _.filter(
        this.choices,
        (item) => this.filter_fn(item, this.d_batch_search_query)
      );
  }

  item_is_selected(item: unknown) {
    return this.d_selected_items.some((el) => this.are_items_equal(el, item))
  }

  get component_uid() {
    return generate_uid();
  }

  option_id(index: number) {
    return `batch-option-${this.component_uid}-${index}`;
  }

  get active_option_id() {
    if (this.d_current_focus_index === null
        || this.d_current_focus_index >= this.batch_filtered_items.length) {
      return undefined;
    }
    return this.option_id(this.d_current_focus_index);
  }

  // Call when user clicks the "confirm" button.
  confirm_selection() {
    this.$emit("input", this.d_selected_items);
    this.d_show_batch_select_modal = false;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';
@import '@/styles/modal.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.batch-select-button {
  margin-left: 1em;
  height: 100%;
}

.batch-search-field {
  margin-bottom: 1em;
  width: 100%;
}

.batch-select-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 0.5em;
  align-items: stretch;
  list-style-type: none;
  outline: none;

  .batch-select-card {
    display: block;
    padding: 1em;
    border-radius: 3px;
    background-color: $gray-blue-1;
    opacity: 0.5;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;

    &.selected {
      opacity: 1;
    }
  }
}

.active-descendant {
  outline-style: auto;
}

/* ---------------- MODAL ---------------- */

.modal-confirm-button {
  @extend .blue-button;
}

.modal-cancel-button {
  @extend .white-button;
}
</style>
