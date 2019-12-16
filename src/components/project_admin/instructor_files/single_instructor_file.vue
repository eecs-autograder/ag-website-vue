<template>
  <div class="single-instructor-file-component" v-on="$listeners">
    <div v-if="editing">
      <validated-form autocomplete="off"
                      spellcheck="false"
                      ref="rename_form"
                      @submit=rename_file>
        <validated-input ref='file_name'
                         v-model="new_file_name"
                         :validators="[is_not_empty]"
                         input_style="width: 200px;
                                     padding: 3px 5px;
                                     margin-right: 10px;"
                         @input_validity_changed="new_name_is_valid = $event">
        </validated-input>
        <div class="edit-name-buttons">
          <button class="update-file-name-button"
                  type="submit"
                  :disabled="!new_name_is_valid"
                  @click.stop>
            Save
          </button>
          <button class="update-file-name-cancel-button"
                  @click.stop="cancel_renaming_file"> Cancel
          </button>
        </div>
      </validated-form>
      <APIErrors ref="api_errors"></APIErrors>
    </div>
    <div v-else class="not-editing">
      <div class="file-name">{{file.name}}</div>
      <i class="fas fa-pencil-alt edit-file-name"
         @click.stop="new_file_name = file.name; editing = true;"></i>
      <i class="fas fa-file-download download-file"
         @click.stop="download_file"></i>
      <i class="far fa-trash-alt delete-file"
         @click.stop="d_show_delete_instructor_file_modal = true"></i>
    </div>
    <div class="display-timestamp">
      {{format_datetime(file.last_modified)}}
    </div>
    <div @click.stop>
      <modal v-if="d_show_delete_instructor_file_modal"
             @close="d_show_delete_instructor_file_modal = false"
             ref="delete_instructor_file_modal"
             size="large"
             click_outside_to_close>
        <div class="modal-header">Confirm Delete</div>
        <div> Are you sure you want to delete
          <span class="file-to-delete">{{file.name}}</span>? <br><br>
          <b>This action cannot be undone</b>. <br>
          Any test cases that rely on this file may have
          to be updated before they'll run correctly again.
        </div>

        <div class="button-footer-right modal-button-footer">
          <button class="modal-delete-button"
                  :disabled="d_delete_pending"
                  @click="delete_file_permanently"> Delete </button>
          <button class="modal-cancel-button"
                  @click="d_show_delete_instructor_file_modal = false"> Cancel </button>
        </div>
      </modal>
    </div>

    <progress-overlay v-if="d_downloading" :progress="d_download_progress"></progress-overlay>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { InstructorFile } from 'ag-client-typescript';
import * as FileSaver from 'file-saver';

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import ProgressOverlay from '@/components/progress_overlay.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { format_datetime, handle_api_errors_async, toggle } from '@/utils';
import { is_not_empty } from '@/validators';

@Component({
  components: {
    APIErrors,
    Modal,
    ProgressOverlay,
    ValidatedForm,
    ValidatedInput
  }
})
export default class SingleInstructorFile extends Vue {

  @Prop({required: true, type: InstructorFile})
  file!: InstructorFile;

  readonly is_not_empty = is_not_empty;
  readonly format_datetime = format_datetime;

  d_delete_pending = false;
  editing = false;
  new_file_name: string = "";
  new_name_is_valid = true;
  d_show_delete_instructor_file_modal = false;

  d_download_progress: number | null = null;
  d_downloading = false;

  @handle_api_errors_async(handle_rename_file_error)
  async rename_file() {
    if (this.new_file_name !== this.file.name) {
      await this.file.rename(this.new_file_name);
    }
    this.editing = false;
  }

  cancel_renaming_file() {
    this.editing = false;
  }

  download_file() {
    return toggle(this, 'd_downloading', async () => {
      let file_content = this.file.get_content((event: ProgressEvent) => {
        if (event.lengthComputable) {
          this.d_download_progress = 100 * (1.0 * event.loaded / event.total);
        }
      });
      FileSaver.saveAs(new File([await file_content], this.file.name));
      this.d_download_progress = null;
    });
  }

  async delete_file_permanently() {
    try {
      this.d_delete_pending = true;
      await this.file.delete();
      this.d_show_delete_instructor_file_modal = false;
    }
    finally {
      this.d_delete_pending = false;
    }
  }
}

export function handle_rename_file_error(component: SingleInstructorFile, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}

</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/modal.scss';

* {
  box-sizing: border-box;
}

.single-instructor-file-component {
  cursor: pointer;

  padding: .5rem .75rem;
  word-wrap: break-word;
  word-break: break-word;
}

.icon-holder {
  padding-top: .125rem;
}

.not-editing {
  display: flex;

  .file-name {
    font-size: 16px;
    padding-bottom: .125rem;
  }

  .edit-file-name, .download-file, .delete-file {
    margin: 0 .375rem;
  }

  .edit-file-name {
    color: hsl(220, 30%, 60%);
    margin-left: auto;
  }

  .edit-file-name:hover {
    color: hsl(220, 30%, 35%);
  }

  .download-file {
    color: hsl(220, 30%, 60%);
  }

  .download-file:hover {
    color: hsl(220, 30%, 35%);
  }

  .delete-file {
    color: hsl(220, 20%, 75%);
  }

  .delete-file:hover {
    color: hsl(220, 20%, 55%);
  }
}

.edit-name-buttons {
  display: flex;
  padding: .5rem 0;
}

.update-file-name-button {
  @extend .green-button;
}

.update-file-name-cancel-button {
  @extend .flat-white-button;
  margin-left: .625rem;
}

.update-file-name-button, .update-file-name-cancel-button {
  padding: .25rem .375rem;
}

.display-timestamp {
  display: block;
  color: hsl(220, 20%, 65%);
  font-size: .875rem;
}

/* ---------------- MODAL ---------------- */

.file-to-delete {
  color: darken($ocean-blue, 5%);
  font-weight: bold;
}

.modal-cancel-button {
  @extend .white-button;
}

.modal-delete-button {
  @extend .red-button;
}
</style>
