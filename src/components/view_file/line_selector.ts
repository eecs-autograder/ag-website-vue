import { readonly, Ref, ref } from "vue";

export function useLineSelector(
  start_line_index: number,
  controls: "keyboard" | "mouse",
) {
  const range = ref({
    first: start_line_index,
    last: start_line_index,
  });
  // The anchor index is the line on which the selection is started.
  // When the selection range is updated, the anchor index is always
  // either the first or last line of the selection.
  const anchor_index = ref(start_line_index);

  // Expand the selection range to include the given line and maintain
  // the anchor index as either the first or last line of the range.
  // Cases are documented in the function body.
  // This method does not modify the anchor index.
  function update_selection(line_index: number) {
    // Since the anchor index is always either the first or last
    // line in the range, the following cases are possible:
    if (anchor_index.value === range.value.first) {
      // 1. The anchor is the first line, and line_index is before it:
      //    New range is [line_index, anchor].
      if (line_index < anchor_index.value) {
        range.value.first = line_index;
        range.value.last = anchor_index.value;
      }
      // 2. The anchor is the first line, and line_index is after it:
      //    New range is [first line (unchanged), line_index].
      //    This will automatically grow/shrink the end of the range
      //    according to the value of line_index.
      else {
        range.value.last = line_index;
      }
    } else if (anchor_index.value === range.value.last) {
      // 3. The anchor is the last line, and line_index is before it:
      //    New range is [line_index, last line (unchanged)].
      //    This will automatically grow/shrink the beginning of the range
      //    according to the value of line_index.
      if (line_index < anchor_index.value) {
        range.value.first = line_index;
      }
      // 4. The anchor is the last line, and line index is after it:
      //    New range is [anchor, line_index].
      else {
        range.value.first = anchor_index.value;
        range.value.last = line_index;
      }
    } else {
      throw new Error(
        "Invariant not maintained: anchor_index must always be equal to " +
          "the first or last line of the range.",
      );
    }
  }

  return readonly({
    update_selection,
    range: readonly(range),
    anchor_index: anchor_index,
    controls,
  });
}

export type LineSelector = ReturnType<typeof useLineSelector>;
