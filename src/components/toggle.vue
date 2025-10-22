<template>
  <div class="toggle-button-space">
    <div v-if="state.is_on" class="active-option-style on-border"
         :style="[{backgroundColor: active_background_color}]">
      <slot name="on"> </slot>
    </div>
    <div v-else @click="_toggle()" class="inactive-option-style on-border cursor-pointer">
      <slot name="on"> </slot>
    </div>

    <div v-if="state.is_on" @click="_toggle()" class="inactive-option-style off-border">
      <slot name="off"> </slot>
    </div>
    <div v-else class="active-option-style off-border"
         :style="[{backgroundColor: active_background_color}]">
      <slot name="off"> </slot>
    </div>

  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

// Props
type PropTypes = {
  value?: boolean
  active_background_color?: string
}

const props = withDefaults(defineProps<PropTypes>(), {
  value: false,
  active_background_color: 'hsl(208, 59%, 49%)'
})

// Emits
const emit = defineEmits<{
  input: [value: boolean]
}>()

// Reactive state object
const state = reactive({
  d_is_on: false
})

// Watch for prop changes (equivalent to @Watch('value'))
watch(() => props.value, (new_value: boolean, old_value: boolean) => {
  state.is_on = new_value;
})

// Methods
const _toggle = () => {
  state.is_on = !state.is_on;
  emit('input', state.is_on);
}

// Initialize (equivalent to created lifecycle)
state.is_on = props.value;

// Expose state for external access (tests, parent components)
defineExpose({
  state
})
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.active-option-style, .inactive-option-style {
  display: inline-block;
  padding: .5rem .75rem;
}

.active-option-style {
  box-shadow: 0 1px 1px $dark-gray;
  color: white;
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
