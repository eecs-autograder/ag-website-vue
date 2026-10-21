import { Ref, ref, watch, WatchSource } from "vue";

/**
 * Keeps document.title in sync with the given title.
 *
 * Pass a getter, ref, or computed to derive the title from reactive state.
 * Pass a string to get back a writable ref instead for Options API
 * components.
 *
 * Once all components use the composition API, we should delete the overload
 * that returns a writable ref.
 */
export function use_title(initial_title: string): Ref<string>;
export function use_title(title: WatchSource<string>): void;
export function use_title(
  title: string | WatchSource<string>,
): Ref<string> | void {
  if (typeof title !== "string") {
    watch(title, set_document_title, { immediate: true });
    return;
  }

  const title_ref = ref(title);
  watch(title_ref, set_document_title, { immediate: true });
  return title_ref;
}

function set_document_title(title: string) {
  document.title = title;
}
