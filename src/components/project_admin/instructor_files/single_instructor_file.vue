<template>
  <div class="single-instructor-file-component" v-on="$listeners">
    <div v-if="editing">
      <validated-form autocomplete="off"
                      spellcheck="false"
                      ref="rename_form"
                      @submit="rename_file">
        <validated-input ref="file_name"
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
                  @click.stop="cancel_renaming_file">
            Cancel
          </button>
        </div>
      </validated-form>
      <APIErrors ref="api_errors"></APIErrors>
    </div>
    <div v-else class="not-editing">
      <input class="select-checkbox" 
             @click.stop 
             :checked="selected_for_deletion" 
             @change="$emit('selected_for_deletion', $event.target.checked)"
             type="checkbox" />
      <div class="file-info-actions">
        <div class="file-name">{{file.name}}</div>
        <i class="fas fa-pencil-alt edit-file-name"
          @click.stop="new_file_name = file.name; editing = true;"></i>
        <i class="fas fa-file-download download-file"
          @click.stop="download_file"></i>
        <i class="far fa-trash-alt delete-file"
          @click.stop="$emit('delete_requested')"
        ></i>
      </div>
    </div>
    <div class="display-timestamp">
      {{format_datetime(file.last_modified)}}
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
import {
  handle_api_errors_async,
  handle_global_errors_async,
  make_error_handler_func,
} from '@/error_handling';
import { format_datetime, toggle } from '@/utils';
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

  @Prop({required: false, type: Boolean})
  selected_for_deletion!: boolean;

  readonly is_not_empty = is_not_empty;
  readonly format_datetime = format_datetime;

  editing = false;
  new_file_name: string = "";
  new_name_is_valid = true;

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

  @handle_global_errors_async
  download_file() {
    this.d_download_progress = null;
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

  padding: .5rem .10rem;
  word-wrap: break-word;
  word-break: break-word;
}

.icon-holder {
  padding-top: .125rem;
}

.not-editing {
  display: flex;

  .select-checkbox {
    width: 1.35rem;
    transform: scale(1.35);
  }

  .file-info-actions {
    display: flex;
    justify-content: space-between;
    width: 90%;

    .file-name {
      font-size: 16px;
      padding-bottom: .125rem;
      margin-right: auto;
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
  margin-left: 1.75rem;
}
</style>
