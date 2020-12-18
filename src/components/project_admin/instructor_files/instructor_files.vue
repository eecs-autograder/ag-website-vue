<template>
  <div id="instructor-files-component">
    <file-upload ref="instructor_files_upload"
                 @upload_files="add_instructor_files($event)"
                 :disable_upload_button="d_uploading">
    </file-upload>

    <div v-if="d_upload_progress !== null" class="progress-wrapper">
      <progress-bar :progress="d_upload_progress"></progress-bar>
    </div>

    <APIErrors ref="api_errors"></APIErrors>

    <div class="sidebar-container">
      <div class="sidebar-menu">
        <div :class="['sidebar-header', {'sidebar-header-closed': d_collapsed}]">
          <span class="sidebar-collapse-button" @click="d_collapsed = !d_collapsed">
            <i class="fas fa-bars"></i>
          </span>
          <span class="sidebar-header-text"
                v-if="!d_collapsed || current_filename === null">Uploaded Files</span>
          <button v-if="!d_collapsed"
                  class="batch-delete-files-button"
                  :class="{'red-button': batch_mode, 'gray-button': !batch_mode}"
                  :disabled="!batch_mode"
                  @click.stop="request_batch_delete()"
          >
            Batch Delete
          </button>
        </div>

        <div class="sidebar-content" v-if="!d_collapsed">
          <single-instructor-file
            v-for="instructor_file of instructor_files"
            :key="instructor_file.pk"
            :file="instructor_file"
            @click="view_file(instructor_file)"
            v-bind:selected="d_batch_to_be_deleted.some((f) => f.pk === instructor_file.pk)"
            v-on:update:selected="toggle_file_for_batch_operation(instructor_file, $event)"
            @delete_requested="request_single_delete(instructor_file)"
            class="sidebar-item"
            :class="{ active: current_filename === instructor_file.name }"
          >
          </single-instructor-file>
        </div>
      </div>
      <div :class="['body', {'body-closed': d_collapsed}]" v-if="current_filename !== null">
        <view-file :filename="current_filename"
                   :file_contents="current_file_contents"
                   :progress="load_contents_progress"></view-file>
      </div>
    </div>
    <div @click.stop>
      <modal
        v-if="d_show_delete_modal"
        @close="d_show_delete_modal = false"
        size="large"
        click_outside_to_close
      >
        <div class="modal-header">Confirm Delete</div>
        <div>
          Are you sure you want to delete the following file(s):
          <ul class="files-to-delete">
            <li v-for="file of d_to_be_deleted" :key="file.pk" class="filename">
              {{ file.name }}
            </li>
          </ul>
          <br />

          If you want to <b>update the file's contents</b>, cancel this dialogue
          and <b>re-upload the file instead.</b> <br /><br />

          <b>This action cannot be undone</b>. <br />
          Any test cases that rely on this file may have to be updated before
          they'll run correctly again.
        </div>

        <APIErrors ref="delete_errors"></APIErrors>
        <div class="button-footer-right modal-button-footer">
          <button
            class="modal-delete-button"
            :disabled="d_delete_pending"
            @click="delete_files_permanently"
          >
            Delete
          </button>
          <button
            class="modal-cancel-button"
            @click="d_show_delete_modal = false"
          >
            Cancel
          </button>
        </div>
      </modal>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { InstructorFile, InstructorFileObserver, Project } from 'ag-client-typescript';

import APIErrors from "@/components/api_errors.vue";
import FileUpload from '@/components/file_upload.vue';
import Modal from '@/components/modal.vue';
import ProgressBar from '@/components/progress_bar.vue';
import ViewFile from '@/components/view_file.vue';
import {
  handle_api_errors_async,
  handle_global_errors_async,
  make_error_handler_func,
} from "@/error_handling";
import { BeforeDestroy, Created } from '@/lifecycle';
import { OpenFilesMixin } from '@/open_files_mixin';
import { SafeMap } from '@/safe_map';
import { toggle } from '@/utils';

import SingleInstructorFile from './single_instructor_file.vue';

@Component({
  components: {
    APIErrors,
    Modal,
    FileUpload,
    ProgressBar,
    SingleInstructorFile,
    ViewFile,
  },
})
export default class InstructorFiles extends OpenFilesMixin implements InstructorFileObserver,
                                                                       Created,
                                                                       BeforeDestroy {
  @Prop({required: true, type: Project})
  project!: Project;

  d_collapsed = false;
  d_uploading = false;
  d_upload_progress: number | null = null;

  // Array of files that will be deleted after the user confirms any kind of
  // deletion (single or batch); allows us to reuse 1 modal for both kinds of
  // deletion
  d_to_be_deleted = new Array<InstructorFile>();
  d_delete_pending = false;
  d_show_delete_modal = false;

  // Array of files selected for deletion in batch mode
  d_batch_to_be_deleted = new Array<InstructorFile>();

  // Toggle a file to be included or excluded for a batch operation
  toggle_file_for_batch_operation(file: InstructorFile, value: Boolean) {
    if (value) 
      this.d_batch_to_be_deleted.push(file);
    else 
      this.d_batch_to_be_deleted = this.d_batch_to_be_deleted.filter((f) => f.pk !== file.pk);
  }

  // Called when a user presses the delete button inside of child SingleInstructorFile component
  request_single_delete(file: InstructorFile) {
    this.d_to_be_deleted = [];
    this.d_to_be_deleted.push(file);
    this.d_show_delete_modal = true;
  }

  // Called when a user presses the batch delete button from this component
  request_batch_delete() {
    this.d_to_be_deleted = this.d_batch_to_be_deleted;
    this.d_show_delete_modal = true;
  }

  @handle_api_errors_async(make_error_handler_func("delete_errors"))
  async delete_files_permanently() {
    try {
      this.d_delete_pending = true;

      // Delete all files in parallel
      await Promise.all(
        this.d_to_be_deleted.map(async (file) => {
          await file.delete();
        })
      );

      this.d_batch_to_be_deleted = [];
      this.d_show_delete_modal = false;
    }
    finally {
      this.d_delete_pending = false;
      this.d_to_be_deleted = [];
    }
  }


  // Returns whether we are in batch deletion mode
  get batch_mode() {
    return this.d_batch_to_be_deleted.length > 0;
  }

  // Do NOT modify the contents of this array!!
  get instructor_files(): ReadonlyArray<Readonly<InstructorFile>> {
    // Since this component is only used in project admin, we know that
    // this.project.instructor files will never be undefined.
    return this.project.instructor_files!;
  }

  created() {
    InstructorFile.subscribe(this);
  }

  beforeDestroy() {
    InstructorFile.unsubscribe(this);
  }

  view_file(file: InstructorFile) {
    this.open_file(file.name, (progress_callback) => file.get_content(progress_callback));
  }

  @handle_api_errors_async(handle_file_upload_errors)
  add_instructor_files(files: File[]) {
    this.d_upload_progress = null;
    (<APIErrors> this.$refs.api_errors).clear();
    return toggle(this, 'd_uploading', async () => {
      for (let file of files) {
        let file_to_update = this.instructor_files.find(item => item.name === file.name);
        if (file_to_update !== undefined) {
          await file_to_update.set_content(file, (event: ProgressEvent) => {
            if (event.lengthComputable) {
              this.d_upload_progress = 100 * (1.0 * event.loaded / event.total);
            }
          });
        }
        else {
          await InstructorFile.create(
            this.project.pk, file.name, file, (event: ProgressEvent) => {
              if (event.lengthComputable) {
                this.d_upload_progress = 100 * (1.0 * event.loaded / event.total);
              }
            }
          );
        }
      }
      this.d_upload_progress = null;
      (<FileUpload> this.$refs.instructor_files_upload).clear_files();
    });
  }

  update_instructor_file_content_changed(instructor_file: InstructorFile, file_content: Blob) {
    if (instructor_file.project === this.project.pk) {
      this.update_file(instructor_file.name, Promise.resolve(file_content));
    }
  }

  update_instructor_file_deleted(instructor_file: InstructorFile) {
    if (instructor_file.project === this.project.pk) {
      this.delete_file(instructor_file.name);
    }
  }

  update_instructor_file_renamed(instructor_file: InstructorFile, old_name: string) {
    if (instructor_file.project === this.project.pk) {
      this.rename_file(old_name, instructor_file.name);
    }
  }

  update_instructor_file_created(instructor_file: InstructorFile) {}
}

function handle_file_upload_errors(component: InstructorFiles, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";
@import "@/styles/button_styles.scss";
@import "@/styles/collapsible_sidebar.scss";
@import "@/styles/forms.scss";
@import "@/styles/modal.scss";

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

#instructor-files-component {
  margin-top: .625rem;
}

.progress-wrapper {
  padding-top: .625rem;
}

$border-color: hsl(220, 40%, 94%);

@include collapsible-sidebar(
  $sidebar-width: 300px,
  $sidebar-header-height: 2.25rem,
  $border-color: $border-color,
  $include-top-border: true,
  $background-color: white,
  $active-color: $pebble-light
);


.batch-delete-files-button {
  font-size: .875rem;
  margin-left: auto;
  white-space: nowrap;
}

.batch-select-all-checkbox {
  margin: 0 .5em;
}

.sidebar-container {
  margin-top: .875rem;

  .body {
    border-top: 1px solid hsl(220, 40%, 94%);
  }

  .sidebar-menu {
    .sidebar-header {
      display: flex;
      justify-content: space-between;
      padding-top: .5rem;
      padding-bottom: .5rem;
      font-weight: bold;
      font-size: 1.125rem;

      .sidebar-header-text {
        white-space: nowrap;
      }
    }
  }

  .sidebar-content {
    .sidebar-item {
      border-top: 1px solid $border-color;
    }

    .sidebar-collapse-button {
      color: $ocean-blue;
      outline: none;

      &:hover {
        color: darken($ocean-blue, 10);
      }
    }
  }
}


/* ---------------- MODAL ---------------- */

.files-to-delete {
  margin-left: 0;
  padding-left: 40px;

  .filename {
    color: darken($ocean-blue, 5%);
    font-weight: bold;
  }
}

.modal-cancel-button {
  @extend .white-button;
}

.modal-delete-button {
  @extend .red-button;
}
</style>
