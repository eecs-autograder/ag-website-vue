<template>
  <div class="batch-select">
    <button class="button white-button batch-select-button"
            @click="d_show_batch_select_modal = true">
      Batch Select
    </button>
    <div @click.stop>
      <modal v-if="d_show_batch_select_modal"
             @close="d_show_batch_select_modal = false"
             size="large"
             click_outside_to_close>
        <div class="modal-header">
          Select Items ({{ d_selected_items.length }} out of
          {{ choices.length }} items selected)
        </div>
        <input class="input batch-search-field"
               type="text"
               placeholder="Enter a name"
               v-model="d_batch_search_query"
        />
        <div>
          <ul class="batch-select-card-grid">
            <li class="batch-select-card"
                :class="{
                  selected: d_selected_items.some((el) => are_items_equal(el, item)),
                }"
                v-for="item of batch_filtered_items"
                :key="item.pk"
                @click="batch_toggle_select(item)">
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

  d_show_batch_select_modal = false;
  d_batch_search_query: string = "";
  d_selected_items: unknown[] = [];

  created() {
    this.d_selected_items = this.value.slice();
  }

  @Watch("value", { deep: true })
  on_value_change(new_value: unknown[], old_value: unknown[]) {
    this.d_selected_items = this.value.slice();
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

/* ---------------- MODAL ---------------- */

.modal-confirm-button {
  @extend .blue-button;
}

.modal-cancel-button {
  @extend .white-button;
}
</style>
