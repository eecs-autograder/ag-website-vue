<template>
  <div class="outermost-dropdown-container">
    <div class="dropdown-container"
         @keydown="move_highlighted($event)">

      <div class="header-container">
        <slot name="header"> </slot>
      </div>

      <div class="dropdown-content"
           :style="[{display: state.d_is_open ? 'block' : 'none'}, {height: dropdown_height},
                    {overflowY: dropdown_height !== 'auto' ? 'scroll' : 'none'}]">
        <div :class="['dropdown-row', {'highlight': index === state.d_highlighted_index}]"
             v-for="(item, index) of state.d_items"
             @mousedown="$event.preventDefault()"
             @click.stop="choose_item_from_dropdown_menu(item, index)">
          <slot v-bind:item="item">{{item}}</slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch, onMounted, getCurrentInstance } from 'vue'

// Props
type PropTypes = {
  items: unknown[]
  initial_highlighted_index?: number
  dropdown_height?: string
}

const props = withDefaults(defineProps<PropTypes>(), {
  initial_highlighted_index: 0,
  dropdown_height: 'auto'
})

// Emits
const emit = defineEmits<{
  item_selected: [item: unknown]
}>()

// Get current instance to access $slots
const instance = getCurrentInstance()

// Reactive state object
const state = reactive({
  d_highlighted_index: 0,
  d_items: [] as unknown[],
  d_is_open: false
})

// Computed properties
const current_highlighted_index = computed(() => {
  return state.d_highlighted_index
})

const is_open = computed(() => {
  return state.d_is_open
})

// Watch for items prop changes
watch(() => props.items, (new_val: unknown[], old_val: unknown[]) => {
  state.d_items = new_val
  if (state.d_highlighted_index >= state.d_items.length && state.d_items.length > 0) {
    state.d_highlighted_index = state.d_items.length - 1
  }
})

// Methods
const show = () => {
  state.d_is_open = true
}

const hide = () => {
  state.d_is_open = false
}

const choose_item_from_dropdown_menu = (item_selected: unknown, index: number) => {
  state.d_highlighted_index = index
  emit("item_selected", item_selected)
  hide()
}

const move_highlighted = (event: KeyboardEvent) => {
  if (event.code === "Enter" && is_open.value && state.d_items.length > 0) {
    event.preventDefault()
    event.stopPropagation()
    choose_item_from_dropdown_menu(
      state.d_items[state.d_highlighted_index], state.d_highlighted_index
    )
  }
  else if (event.code === 'ArrowDown') {
    event.preventDefault()
    event.stopPropagation()

    show()

    if (state.d_highlighted_index < state.d_items.length - 1) {
      state.d_highlighted_index += 1
    }
  }
  else if (event.code === 'ArrowUp') {
    event.preventDefault()
    event.stopPropagation()

    show()

    if (state.d_highlighted_index > 0) {
      state.d_highlighted_index -= 1
    }
  }
  else if (event.code === 'Escape') {
    hide()
  }
}

// Lifecycle - equivalent to created()
state.d_items = props.items
state.d_highlighted_index = props.initial_highlighted_index

// Lifecycle - equivalent to mounted()
onMounted(() => {
  if (!instance || !instance.proxy || !instance.proxy.$slots.header) {
    throw Error('Missing required slot: "header"')
  }

  // Access slots through the instance proxy (Vue 2.7 style)
  const headerSlot = instance.proxy.$slots.header
  if (!headerSlot || !headerSlot[0] || !headerSlot[0].elm) {
    throw Error('Header slot element not found')
  }

  const header_slot_content = headerSlot[0].elm as HTMLElement

  header_slot_content.addEventListener("blur", () => {
    hide()
  })

  header_slot_content.addEventListener("click", () => {
    state.d_is_open = !state.d_is_open
  })
})

// Expose state and methods for external access (tests, parent components)
defineExpose({
  state,
  current_highlighted_index,
  is_open,
  show,
  hide
})
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/components/dropdown_styles.scss';

.dropdown-container {
  display: block;
  position: relative;
}

.dropdown-content {
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
