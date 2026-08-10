import { createFocusTrap, FocusTrap, Options } from "focus-trap";
import { onMounted, onUnmounted, Ref } from "vue";

import { assert_not_null } from "@/utils";

/**
 * Traps keyboard focus inside `container` for as long as the calling component
 * is mounted. `options` is passed through to focus-trap unchanged.
 */
export function use_focus_trap(
  container: Ref<HTMLElement | null>,
  options?: Options,
) {
  let trap: FocusTrap | null = null;

  onMounted(() => {
    const element = container.value;
    assert_not_null(element);

    trap = createFocusTrap(element, options);
    trap.activate();
  });

  onUnmounted(() => {
    trap?.deactivate();
  });
}
