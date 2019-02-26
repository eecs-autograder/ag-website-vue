<template>
  <div>
    <div id="single-file-component" @click="$emit('open_file', file)">
      <div>
        <div v-if="editing">
          <div @click.stop>
            <validated-input ref='file_name'
                             spellcheck="false"
                             autocomplete="off"
                             v-model="new_file_name"
                             :validators="[is_not_empty]"
                             input_style="border-radius: 2px;
                                          border: 0px solid hsl(220, 30%, 72%);
                                          padding: 3px 5px;
                                          width: 360px;
                                          margin-right: 10px;
                                          box-sizing: border-box;"
                             @input_validity_changed="new_name_is_valid = $event">
              <div slot="suffix" class="edit-name-buttons">
                <button class="update-file-name-button"
                        :disabled="!new_name_is_valid"
                        @click.stop="rename_file"> Update
                </button>
                <button class="update-file-name-cancel-button"
                        @click.stop="cancel_renaming_file"> Cancel
                </button>
              </div>
            </validated-input>
          </div>
        </div>
        <div v-else class="not-editing">
          <div class="file-name"> <span>{{file.name}}</span>
            <div class="icon-holder">
              <i class="fas fa-file-download download-file"
                 @click.stop="download_file"></i>
              <i class="fas fa-pencil-alt edit-file-name"
                 @click.stop="new_file_name = file.name; editing = true;"></i>
            </div>
          </div>
          <i class="far fa-trash-alt delete-file"
             @click.stop="$refs.delete_instructor_file_modal.open()"></i>
        </div>
      </div>
      <div class="display-timestamp">
        {{(new Date(file.last_modified)).toLocaleString('en-US', last_modified_format)}}
      </div>
    </div>

    <modal ref="delete_instructor_file_modal"
           size="large"
           :include_closing_x="false">
      <div id="modal-header">Confirm Deletion</div>
      <hr>
      <div id="modal-body"> Are you sure you want to delete the file
        <b class="file-to-delete">{{file.name}}</b>?
        This action cannot be undone, and any test cases that rely on this file may have
        to be updated before they run correctly again.
      </div>

      <div id="modal-button-container">
        <button class="modal-delete-button"
                :disabled="d_delete_pending"
                @click="delete_file_permanently"> Delete </button>
        <div class="modal-cancel-button"
             @click="$refs.delete_instructor_file_modal.close()"> Cancel </div>
      </div>
    </modal>

  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import { InstructorFile } from 'ag-client-typescript';

  import * as FileSaver from 'file-saver';

  import Modal from '@/components/modal.vue';
  import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';

  @Component({
    components: { Modal, ValidatedInput }
  })
  export default class SingleFile extends Vue {

    @Prop({required: true, type: InstructorFile})
    file!: InstructorFile;

    editing = false;
    last_modified_format = {year: 'numeric', month: 'long', day: 'numeric',
                            hour: 'numeric', minute: 'numeric', second: 'numeric'};
    new_file_name: string = "";
    d_delete_pending = false;

    new_name_is_valid = true;

    is_not_empty(value: string): ValidatorResponse {
      return {
        is_valid: value.trim() !== "",
        error_msg: "File name cannot be an empty string."
      };
    }

    async rename_file() {
      if (this.new_file_name !== this.file.name) {
        await this.file.rename(this.new_file_name);
      }
      this.editing = false;
    }

    cancel_renaming_file() {
      this.editing = false;
    }

    async download_file() {
      FileSaver.saveAs(new File([await this.file.get_content()], this.file.name));
    }

    async delete_file_permanently() {
      try {
        this.d_delete_pending = true;
        await this.file.delete();
      }
      finally {
        this.d_delete_pending = false;
      }
    }

  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';
  @import '@/styles/button_styles.scss';
  @import url('https://fonts.googleapis.com/css?family=Quicksand');
  $current_language: "Quicksand";


  .icon-holder {
    display: inline-block;
    padding-top: 2px;
  }

  .not-editing {
    max-width: 250px;
  }

  .edit-name-buttons {
    display: block;
    padding: 9px 0 7px 0;
  }

  .update-file-name-button, .update-file-name-cancel-button {
    background-color: hsl(220, 30%, 60%);
    border-radius: 2px;
    border: 0;
    padding: 4px 6px 5px 6px;
    color: white;
    display: inline-block;
    font-family: $current-language;
    font-size: 15px;
    cursor: pointer;
  }

  .update-file-name-button:disabled, .update-file-name-button:disabled:hover {
    background-color: hsl(220, 30%, 85%);
    color: gray;
    cursor: default;
  }

  .update-file-name-cancel-button {
    margin-left: 10px;
  }

  .update-file-name-button:hover, .update-file-name-cancel-button:hover {
    background-color: hsl(220, 30%, 45%);
  }

  .delete-file {
    position: absolute;
    top: 12px;
    right: 12px;
    color: hsl(220, 20%, 75%);
  }

  .delete-file:hover {
    color: hsl(220, 20%, 55%);
  }

  .download-file {
    color: hsl(220, 30%, 60%);
    padding-left: 1px;
  }

  .download-file:hover {
    color: hsl(220, 30%, 35%);
  }

  .edit-file-name {
    color: hsl(220, 30%, 60%);
    padding-left: 10px;
  }

  .edit-file-name:hover {
    color: hsl(220, 30%, 35%);
  }

  #single-file-component {
    margin-bottom: 5px;
    cursor: pointer;
    background-color: hsl(220, 40%, 94%);
    width: 380px;
    padding: 9px 11px 7px 11px;
    border-radius: .25rem;
    position: relative;
    box-sizing: border-box;
    word-wrap: break-word;
    word-break: break-word;
  }

  .file-name {
    display: inline-block;
    font-size: 16px;
    padding-bottom: 2px;
    box-sizing: border-box;
  }

  .file-name span {
    padding-right: 8px;
  }

  .display-timestamp {
    display: block;
    color: hsl(220, 20%, 65%);
    font-size: 15px;
  }

  /* ---------------- MODAL ---------------- */

  #modal-header {
    padding: 5px 10px;
    font-family: $current-language;
  }

  #modal-body {
    padding: 10px 10px 20px 10px;
    font-family: $current-language;
  }

  .file-to-delete {
    background-color: hsl(220, 20%, 85%);
    letter-spacing: 1px;
  }

  #modal-button-container {
    text-align: right;
    padding: 10px;
  }

  .modal-cancel-button, .modal-delete-button {
    border-radius: 2px;
    font-family: $current-language;
    font-size: 15px;
    font-weight: bold;
  }

  .modal-cancel-button {
    @extend .gray-button;
  }

  .modal-delete-button {
    @extend .red-button;
    margin-right: 20px;
  }

</style>
