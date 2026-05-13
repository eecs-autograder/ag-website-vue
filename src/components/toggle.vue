<template>
  <div class="toggle-button-space">
    <button
      type="button"
      class="on-border"
      :class="state.is_on ? 'active-option-style' : 'inactive-option-style'"
      :style="state.is_on ? { backgroundColor: active_background_color } : {}"
      :aria-pressed="state.is_on"
      @click="!state.is_on && toggle()"
    >
      <slot name="on"> </slot>
    </button>
    <button
      type="button"
      class="off-border"
      :class="!state.is_on ? 'active-option-style' : 'inactive-option-style'"
      :style="!state.is_on ? { backgroundColor: active_background_color } : {}"
      :aria-pressed="!state.is_on"
      @click="state.is_on && toggle()"
    >
      <slot name="off"> </slot>
    </button>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";

// Props
type PropTypes = {
  value?: boolean;
  active_background_color?: string;
};

const props = withDefaults(defineProps<PropTypes>(), {
  value: false,
  active_background_color: "hsl(208, 59%, 44%)",
});

// Emits
const emit = defineEmits<{
  input: [value: boolean];
}>();

// Reactive state object
const state = reactive({
  is_on: false,
});

// Watch for prop changes (equivalent to @Watch('value'))
watch(
  () => props.value,
  (new_value: boolean, old_value: boolean) => {
    state.is_on = new_value;
  },
);

// Methods
const toggle = () => {
  state.is_on = !state.is_on;
  emit("input", state.is_on);
};

// Initialize (equivalent to created lifecycle)
state.is_on = props.value;

// Expose state for external access (tests, parent components)
defineExpose({
  state,
});
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.active-option-style,
.inactive-option-style {
  display: inline-block;
  padding: 0.5rem 0.75rem;
  border: none;
  font-family: inherit;
  font-size: inherit;
}

.active-option-style {
  box-shadow: 0 1px 1px $dark-gray;
  color: white;
  cursor: default;
}

.inactive-option-style {
  box-shadow: inset 1px 1px 3px $dark-gray;
  color: black;
  cursor: pointer;
  background-color: white;
}

.off-border {
  border-radius: 0 3px 3px 0;
}

.on-border {
  border-radius: 3px 0 0 3px;
}
</style>
