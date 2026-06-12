import { ArraySet } from '@/array_set';

export interface FileUploadExposed extends Vue {
  state: {
    files: ArraySet<File, {name: string}>
    empty_filenames: ArraySet<string>
    show_empty_files_found_in_upload_attempt_modal: boolean
    files_dragged_over_counter: number
  }
  files_dragged_over: boolean
  clear_files(): void
  add_files_from_button(event: Event): void
  add_dropped_files(event: DragEvent): void
  check_for_emptiness(file: File): void
}
