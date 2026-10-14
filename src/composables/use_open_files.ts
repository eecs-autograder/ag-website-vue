import { computed, ref, shallowRef } from "vue";

import { SafeMap } from "@/safe_map";
import { blob_to_string } from "@/utils";

export type ProgressCallback = (event: ProgressEvent) => void;

/**
 * Tracks a set of open files and which one is currently being viewed.
 * File contents are loaded lazily and cached by filename.
 */
export function use_open_files() {
  const d_open_files = shallowRef(new SafeMap<string, Promise<string>>());
  const d_current_filename = ref<string | null>(null);
  const d_load_contents_progress = ref<number | null>(null);

  const current_file_contents = computed(() => {
    if (d_current_filename.value === null) {
      // istanbul ignore next
      throw new Error(
        "current_file_contents requested when d_current_filename is null",
      );
    }
    return d_open_files.value.get(d_current_filename.value);
  });

  const load_contents_progress = computed(() => d_load_contents_progress.value);

  const current_filename = computed(() => d_current_filename.value);

  /**
   * If the requested file has already been opened, reuses that file's contents
   * without calling get_content_func. Otherwise, calls get_content_func and
   * stores the resulting Promise.
   */
  function open_file(
    filename: string,
    get_content_func: (progress_callback: ProgressCallback) => Promise<Blob>,
  ) {
    d_load_contents_progress.value = null;
    if (!d_open_files.value.has(filename)) {
      const content = get_content_func((event: ProgressEvent) => {
        if (event.lengthComputable) {
          d_load_contents_progress.value =
            (100 * (1.0 * event.loaded)) / event.total;
        }
      });
      const new_open_files = new SafeMap(d_open_files.value);
      new_open_files.set(filename, blob_to_string(content));
      d_open_files.value = new_open_files;
    }
    d_current_filename.value = filename;
  }

  function update_file(filename: string, content: Promise<Blob>) {
    const new_open_files = new SafeMap(d_open_files.value);
    new_open_files.set(filename, blob_to_string(content));
    d_open_files.value = new_open_files;
  }

  function delete_file(filename: string) {
    if (d_current_filename.value === filename) {
      d_current_filename.value = null;
    }

    const new_open_files = new SafeMap(d_open_files.value);
    new_open_files.delete(filename);
    d_open_files.value = new_open_files;
  }

  function close_all_files() {
    d_open_files.value = new SafeMap();
    d_current_filename.value = null;
    d_load_contents_progress.value = null;
  }

  function rename_file(current_name: string, new_name: string) {
    const content = d_open_files.value.get(current_name, Promise.resolve(""));
    const new_open_files = new SafeMap(d_open_files.value);
    new_open_files.delete(current_name);
    new_open_files.set(new_name, content);
    d_open_files.value = new_open_files;
    if (d_current_filename.value === current_name) {
      d_current_filename.value = new_name;
    }
  }

  return {
    current_file_contents,
    load_contents_progress,
    current_filename,
    open_file,
    update_file,
    delete_file,
    close_all_files,
    rename_file,
  };
}
