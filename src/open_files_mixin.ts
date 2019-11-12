import { Component, Vue } from 'vue-property-decorator';

import { SafeMap } from './safe_map';

export type ProgressCallback = (event: ProgressEvent) => void;

@Component
export class OpenFilesMixin extends Vue {
    private d_open_files: SafeMap<string, Promise<string>> = new SafeMap();
    private d_current_filename: string | null  = null;
    private d_load_contents_progress: number | null = null;

    // If the requested file has already been open, returns a Promise of that file's contents
    // without calling get_content_func.
    // Otherwise, calls get_content_func, stores and returns the resulting Promise.
    open_file(filename: string,
              get_content_func: (progress_callback: ProgressCallback) => Promise<string>) {
        this.d_load_contents_progress = null;
        if (!this.d_open_files.has(filename)) {
            let content = get_content_func((event: ProgressEvent) => {
                if (event.lengthComputable) {
                    this.d_load_contents_progress = 100 * (1.0 * event.loaded / event.total);
                }
            });
            this.d_open_files.set(filename, content);
        }
        this.d_current_filename = filename;
    }

    update_file(filename: string, content: Promise<string>) {
        let new_open_files = new SafeMap(this.d_open_files);
        new_open_files.set(filename, content);
        this.d_open_files = new_open_files;
    }

    delete_file(filename: string) {
        if (this.d_current_filename === filename) {
            this.d_current_filename = null;
        }

        let new_open_files = new SafeMap(this.d_open_files);
        new_open_files.delete(filename);
        this.d_open_files = new_open_files;
    }

    rename_file(current_name: string, new_name: string) {
        let content = this.d_open_files.get(current_name, Promise.resolve(''));
        this.d_open_files.delete(current_name);
        this.d_open_files.set(new_name, content);
        if (this.d_current_filename === current_name) {
            this.d_current_filename = new_name;
        }
    }

    get current_file_contents() {
      if (this.d_current_filename === null) {
        // istanbul ignore next
        throw new Error('current_file_contents requested when d_current_filename is null');
      }
      return this.d_open_files.get(this.d_current_filename);
    }

    get load_contents_progress() {
        return this.d_load_contents_progress;
    }

    get current_filename() {
        return this.d_current_filename;
    }
}
