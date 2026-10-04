<template>
  <div class="batch-select">
    <button
      class="button white-button batch-select-button"
      @click="show_batch_select_modal"
      aria-label="Open batch select"
    >
      Batch Select
    </button>
    <div @click.stop>
      <modal
        v-if="show_modal"
        @close="show_modal = false"
        size="large"
        click_outside_to_close
        :aria_label="aria_label"
      >
        <div class="modal-header">
          Select Items ({{ selected_items.length }} out of
          {{ choices.length }} items selected)
        </div>
        <input
          class="input batch-search-field"
          type="text"
          aria-label="Filter"
          placeholder="Enter a name"
          v-model="search_query"
        />
        <div>
          <ul
            class="batch-select-card-grid"
            ref="listbox_element"
            role="listbox"
            aria-multiselectable="true"
            aria-orientation="horizontal"
            :aria-activedescendant="active_option_id"
            aria-label="Select Files"
            @keydown.left.prevent.stop="focus_prev"
            @keydown.right.prevent.stop="focus_next"
            @keydown.up.prevent.stop="focus_prev"
            @keydown.down.prevent.stop="focus_next"
            tabindex="0"
            @focus="focus_enter()"
            @blur="current_focus_index = null"
            @keydown.space.prevent.stop="toggle_focused_element"
          >
            <li
              class="batch-select-card"
              v-for="(item, index) of batch_filtered_items"
              :key="item.pk"
              :id="option_id(index)"
              :class="{
                selected: item_is_selected(item),
                'active-descendant': current_focus_index === index,
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
          <button class="modal-confirm-button" @click="confirm_selection">
            Confirm
          </button>
          <button class="modal-cancel-button" @click="show_modal = false">
            Cancel
          </button>
        </div>
      </modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";

import _ from "lodash";

import Modal from "@/components/modal.vue";
import { assert_not_null, generate_uid } from "@/utils";

type Comparator = (lhs: unknown, rhs: unknown) => boolean;
type Filter = (item: unknown, filter_text: string) => boolean;

type PropTypes = {
  choices: unknown[];
  value?: unknown[];
  are_items_equal: Comparator;
  filter_fn: Filter;
  aria_label: string;
};

const props = withDefaults(defineProps<PropTypes>(), {
  value: () => [],
});

const emit = defineEmits<{
  input: [value: unknown[]];
}>();

const show_modal = ref(false);
const search_query = ref("");
const selected_items = ref<unknown[]>(props.value.slice());
const current_focus_index = ref<number | null>(null);
const listbox_element = ref<HTMLElement | null>(null);

watch(
  () => props.value,
  () => {
    selected_items.value = props.value.slice();
  },
  { deep: true },
);

async function show_batch_select_modal() {
  show_modal.value = true;
  await nextTick();
  assert_not_null(listbox_element.value);
  listbox_element.value.focus();
}

function focus_enter() {
  if (batch_filtered_items.value.length === 0) {
    return;
  }
  const first_selected_index = batch_filtered_items.value.findIndex((item) =>
    item_is_selected(item),
  );
  focus_index(first_selected_index === -1 ? 0 : first_selected_index);
}

function focus_prev() {
  assert_not_null(current_focus_index.value);
  focus_index(Math.max(0, current_focus_index.value - 1));
}

function focus_next() {
  assert_not_null(current_focus_index.value);
  focus_index(
    Math.min(
      batch_filtered_items.value.length - 1,
      current_focus_index.value + 1,
    ),
  );
}

function focus_index(index: number) {
  current_focus_index.value = index;
}

function toggle_focused_element() {
  if (current_focus_index.value !== null) {
    batch_toggle_select(batch_filtered_items.value[current_focus_index.value]);
  }
}

function batch_toggle_select(item: unknown) {
  if (_.some(selected_items.value, (el) => props.are_items_equal(el, item))) {
    selected_items.value = _.filter(
      selected_items.value,
      (el) => !props.are_items_equal(el, item),
    );
  } else {
    selected_items.value.push(item);
  }
}

const batch_filtered_items = computed(() => {
  return _.isEmpty(search_query.value)
    ? props.choices
    : _.filter(props.choices, (item) =>
        props.filter_fn(item, search_query.value),
      );
});

function item_is_selected(item: unknown) {
  return selected_items.value.some((el) => props.are_items_equal(el, item));
}

const component_uid = generate_uid();

function option_id(index: number) {
  return `batch-option-${component_uid}-${index}`;
}

const active_option_id = computed(() => {
  if (
    current_focus_index.value === null ||
    current_focus_index.value >= batch_filtered_items.value.length
  ) {
    return undefined;
  }
  return option_id(current_focus_index.value);
});

function confirm_selection() {
  emit("input", selected_items.value);
  show_modal.value = false;
}
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";
@import "@/styles/button_styles.scss";
@import "@/styles/forms.scss";
@import "@/styles/modal.scss";

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
