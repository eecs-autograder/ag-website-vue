<template>
  <div>
    <div id="single-file-component"
         @click="$emit('open_file', file)">
      <div class="file-div file-name">
        <span v-if="editing">
          <div @click.stop>
            <validated-input ref='validated_input_2'
                             spellcheck="false"
                             v-model="new_file_name"
                             :validators="[is_not_empty]"
                             input_style="border-radius: 2px;
                                          border: 0px solid hsl(220, 30%, 72%);
                                          padding: 3px 5px;
                                          width: 200px;">
              <div slot="suffix" class="edit-buttons">
                <div class="update-file-name-button" @click.stop="rename_file"> Update </div>
                <div class="update-file-name-cancel-button" @click.stop="cancel_renaming_file"> Cancel </div>
              </div>

            </validated-input>
          </div>
        </span>
        <span v-else>
          {{file.name}}
          <div class="icon-holder">
            <i class="fas fa-file-download download-file"
               @click.stop="download_file"></i>
            <i class="fas fa-pencil-alt edit-file-name"
               @click.stop="new_file_name = file.name; editing = true;"></i>
          </div>
          <i class="far fa-trash-alt delete-file" @click.stop="$refs.delete_instructor_file_modal.open()"></i>
        </span>
      </div>
      <div class="file-div display-timestamp">
        {{(new Date(file.last_modified)).toLocaleString(
            'en-US', last_modified_format
        )}}
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
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  import { InstructorFile } from 'ag-client-typescript';
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
    d_file: InstructorFile;
    d_delete_pending = false;

    created() {
      console.log("Created");
      this.d_file = this.file;
    }

    is_not_empty(value: string): ValidatorResponse {
      return {
        is_valid: value !== "",
        error_msg: "This field is required."
      };
    }

    async rename_file() {
      if (this.file.name !== this.new_file_name) {
        let prev_name = this.file.name;
        // bad if another file already has the new name....
        await this.file.rename(this.new_file_name);
        this.editing = false;
      }
    }

    cancel_renaming_file() {
      this.editing = false;
    }

    download_file() {

    }

    async delete_file_permanently() {
      try {
        this.d_delete_pending = true;
        await this.file.delete();
        // this.instructor_files.splice(this.instructor_files.indexOf(this.file_to_delete), 1);
        // delete file from the mfv if it's being viewed :/
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

  .edit-buttons {
    display: inline-block;
  }

  .icon-holder {
    display: inline-block;
    padding-top: 2px;
  }

  .update-file-name-button {
    background-color: hsl(220, 30%, 60%);
    border-radius: 2px;
    padding: 4px 6px 5px 6px;
    color: white;
    margin-left: 12px;
    display: inline-block;
  }

  .update-file-name-cancel-button {
    background-color: hsl(220, 30%, 60%);
    border-radius: 2px;
    padding: 4px 6px 5px 6px;
    color: white;
    margin-left: 12px;
    display: inline-block;
  }

  .update-file-name-button:hover {
    background-color: hsl(220, 30%, 45%);
  }

  .delete-file {
    position: absolute;
    top: 11px;
    right: 12px;
    color: hsl(220, 20%, 75%);
  }

  .delete-file:hover {
    color: hsl(220, 20%, 55%);
  }

  .download-file {
    color: hsl(220, 30%, 60%);
    padding-left: 6px;
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

  .save-file-name {
    color: hsl(220, 30%, 60%);
    padding-left: 5px;
  }

  .save-file-name:hover {
    color: hsl(220, 30%, 35%);
  }

  .file-div {
    display: inline-block;
  }

  .timestamp {
    padding: 0 0 0 5px;
  }

  #single-file-component {
    margin-bottom: 5px;
    cursor: pointer;
    background-color: hsl(220, 40%, 94%);
    width: 380px;
    padding: 8px 2px 10px 10px;
    border-radius: .25rem;
    position: relative;
    box-sizing: border-box;
    word-wrap: break-word;
    word-break: break-word;
  }

  .file-name {
    font-size: 16px;
    padding-bottom: 1px;
  }

  .display-timestamp {
    display: block;
    padding-top: 5px;
    color: hsl(220, 20%, 65%);
    font-size: 15px;
  }


  .file-to-delete {
    background-color: hsl(220, 20%, 85%);
    letter-spacing: 1px;
  }

  #modal-header {
    padding: 5px 10px;
    font-family: $current-language;
  }

  #modal-body {
    padding: 10px 10px 20px 10px;
    font-family: $current-language;
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
