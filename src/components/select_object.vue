<template>
  <!-- This outer div insulates the wrapped select tag from attribute
       and event bindings on the component. -->
  <div>
    <select
      :id="input_id"
      class="select"
      v-model="selected_id"
      @change="update_value"
    >
      <slot></slot>
      <option
        v-for="item of items"
        :key="item[id_field]"
        :value="item[id_field]"
      >
        <slot name="option-text" v-bind:item="item">{{ item[id_field] }}</slot>
      </option>
    </select>
  </div>
</template>

<script lang="ts">
// Vue 2.7 <script setup> has no defineModel, so the custom v-model event
// ("change" instead of the default "input") is declared here.
export default {
  model: { prop: "value", event: "change" },
};
</script>

<script setup lang="ts">
import { ref, watch } from "vue";

type ItemType = { [key: string]: unknown };

const props = withDefaults(
  defineProps<{
    items?: ItemType[];
    /** The selected item, identified by its `id_field`. */
    value?: ItemType | null;
    /** The name of the field used to uniquely identify the items. */
    id_field: string;
    input_id?: string;
  }>(),
  {
    items: () => [],
    value: null,
    input_id: "",
  },
);

const emit = defineEmits<{
  change: [selected: ItemType | undefined];
}>();

const selected_id = ref<unknown>(
  props.value === null ? null : props.value[props.id_field],
);

watch(
  () => props.value,
  (new_value) => {
    selected_id.value = new_value === null ? null : new_value[props.id_field];
  },
);

function update_value() {
  emit(
    "change",
    props.items.find((item) => item[props.id_field] === selected_id.value),
  );
}
</script>

<style scoped lang="scss">
@import "@/styles/forms.scss";
</style>
