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
    const at_boundary =
      move === PendingKeyboardMove.Up
        ? props.index === 0
        : props.index === props.count - 1;
    const target = at_boundary
      ? move === PendingKeyboardMove.Up
        ? move_down_btn.value
        : move_up_btn.value
      : move === PendingKeyboardMove.Up
        ? move_up_btn.value
        : move_down_btn.value;
    if (!target) return;
    // On move-down, Vue's keyed-list diff physically relocates *this item's*
    // DOM node, blurring the focused button. If the host hides controls until
    // :focus-within (a common pattern), that rule un-applies the moment focus
    // leaves, leaving the target inside a visibility:hidden subtree —
    // .focus() then silently no-ops. visibility:visible on a descendant
    // overrides an ancestor's visibility:hidden, so we briefly opt this one
    // button out long enough for focus to land; once it does, :focus-within
    // (if present) restores the ancestor visibility on its own.
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
