<template>
  <div class="dropdown-typeahead-container">
    <Dropdown
      ref="dropdown_component"
      :items="filtered_choices"
      @item_selected="$emit('item_selected', $event)"
    >
      <template slot="header">
        <input
          :class="typeahead_class"
          type="text"
          :placeholder="placeholder_text"
          :aria-label="aria_label"
          name="filtered_search"
          v-model="filter_text"
          @keydown="resume_search($event)"
        />
      </template>
      <template slot-scope="{ item }">
        <slot v-bind:item="item">
          {{ item }}
        </slot>
      </template>
    </Dropdown>
    <div
      v-if="filtered_choices.length === 0 && is_dropdown_open"
      class="no-matching-results"
    >
      <div class="no-matching-results-row">
        <slot name="no_matching_results" v-bind:filter_text="filter_text">
          We couldn't find any results containing: '{{ filter_text }}'
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import Dropdown from "@/components/dropdown.vue";
import { DropdownExposed } from "@/exposed_component_types/dropdown_exposed";

const props = withDefaults(
  defineProps<{
    choices: object[];
    placeholder_text: string;
    filter_fn: (item: object, filter: string) => boolean;
    typeahead_class?: string;
    aria_label?: string;
  }>(),
  {
    typeahead_class: "search-field",
    aria_label: "",
  },
);

const emit = defineEmits<{
  item_selected: [item: unknown];
}>();

const filter_text = ref("");
const dropdown_component = ref<DropdownExposed>();

const filtered_choices = computed(() => {
  if (filter_text.value === "") {
    return props.choices;
  }
  return props.choices.filter((item) =>
    props.filter_fn(item, filter_text.value),
  );
});

const is_dropdown_open = computed(
  () => dropdown_component.value?.state.is_open ?? false,
);

function resume_search(key: KeyboardEvent) {
  if (!dropdown_component.value?.state.is_open) {
    // don't want to automatically select what was previously selected
    if (key.code !== "Enter") {
      dropdown_component.value?.show();
    }
  }
}

function clear_filter_text() {
  filter_text.value = "";
}

defineExpose({ filter_text, clear_filter_text });
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";
@import "@/styles/components/dropdown_styles.scss";

.dropdown-typeahead-container {
  position: relative;
}

.search-field {
  background-color: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-sizing: border-box;
  color: #495057;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
  padding: 0.375rem 0.75rem;
  width: 100%;
}

.search-field:hover {
  border: 1px solid $ocean-blue;
}

.search-field:focus {
  outline-color: $ocean-blue;
}

.no-matching-results {
  @extend %dropdown-content;
}

.no-matching-results-row {
  @extend %dropdown-row;
}
</style>
