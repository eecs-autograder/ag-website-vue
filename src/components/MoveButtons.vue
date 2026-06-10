<template>
  <span class="move-buttons">
    <button
      ref="move_up_btn"
      type="button"
      class="icon move-button"
      aria-label="Move up"
      :disabled="index === 0"
      @click.stop="on_move_up"
    >
      <i class="fas fa-arrow-up"></i>
    </button>
    <button
      ref="move_down_btn"
      type="button"
      class="icon move-button"
      aria-label="Move down"
      :disabled="index === count - 1"
      @click.stop="on_move_down"
    >
      <i class="fas fa-arrow-down"></i>
    </button>
  </span>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue";

import { assert_not_null } from "@/utils";

interface PropTypes {
  /** The 0-based position of this item in the list. */
  index: number;
  /** Total number of items in the list. */
  count: number;
}

const props = defineProps<PropTypes>();

const emit = defineEmits<{
  /** Emitted when the user clicks the move-up button. */
  move_up: [];
  /** Emitted when the user clicks the move-down button. */
  move_down: [];
}>();

const move_up_btn = ref<HTMLButtonElement | null>(null);
const move_down_btn = ref<HTMLButtonElement | null>(null);

const enum PendingKeyboardMove {
  None,
  Up,
  Down,
}

// Set when the user activates a button via keyboard; cleared after focus is applied.
// This is used to track which button should be focused after a move is triggered
// by a keyboard user.
const pending_keyboard_move = ref<PendingKeyboardMove>(
  PendingKeyboardMove.None,
);

watch(
  () => props.index,
  async () => {
    if (pending_keyboard_move.value === PendingKeyboardMove.None) return;
    const move = pending_keyboard_move.value;
    pending_keyboard_move.value = PendingKeyboardMove.None;
    // Wait two ticks: one for Vue to settle blur from the disabled button,
    // and one for sortable.js's MutationObserver to finish its DOM patch
    // so it doesn't steal focus after we set it.
    await nextTick();
    await nextTick();
    const moved_up = move === PendingKeyboardMove.Up;
    const at_boundary = moved_up
      ? props.index === 0
      : props.index === props.count - 1;
    const same_direction_btn = moved_up
      ? move_up_btn.value
      : move_down_btn.value;
    const opposite_direction_btn = moved_up
      ? move_down_btn.value
      : move_up_btn.value;
    const target = at_boundary ? opposite_direction_btn : same_direction_btn;
    assert_not_null(target);

    // The button needs to be visible, or focus() will silently fail. Make sure
    // it's visible and then return control of the visibility to it's parent's
    // styling.
    target.style.visibility = "visible";
    target.focus();
    target.style.visibility = "";
  },
);

function on_move_up(event: MouseEvent) {
  if (event.detail === 0) pending_keyboard_move.value = PendingKeyboardMove.Up;
  emit("move_up");
}

function on_move_down(event: MouseEvent) {
  if (event.detail === 0)
    pending_keyboard_move.value = PendingKeyboardMove.Down;
  emit("move_down");
}
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";

.move-buttons {
  display: contents;
}

.move-button {
  background: none;
  border: none;
  padding: 0.375rem;
  cursor: pointer;
  color: inherit;

  &:hover {
    color: darken($stormy-gray-dark, 20%);
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
}
</style>
