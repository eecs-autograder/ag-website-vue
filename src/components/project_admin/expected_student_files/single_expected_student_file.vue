<template>
  <div id="single-expected-student-file">

    <div :class="[editing ? 'editing-file' : 'file']">
      <div class="special">
        <div :class="['pattern', {'editing-pattern': editing}]">
          {{expected_student_file.pattern}}
          <span v-if="editing" class="editing-message">(Editing)</span>
        </div>

        <div v-show="!editing" class="icon-holder">
          <div class="delete-file"
               :title="'Delete ' + expected_student_file.pattern"
               @click="$refs.delete_expected_student_file_modal.open()">
            <i class="fas fa-trash delete-file-icon"></i>
          </div>
          <div class="edit-file"
               :title="'Edit ' + expected_student_file.pattern"
               @click="editing = true">
            <i class="fas fa-edit edit-file-icon"></i>
          </div>
        </div>
      </div>


      <span v-if="wildcard_is_present">
        <div class="matches-label">
          Minimum number of matches: {{expected_student_file.min_num_matches}}
        </div>
        <div class="matches-label">
          Maximum number of matches: {{expected_student_file.max_num_matches}}
        </div>
      </span>
    </div>

    <div v-if="editing"
         :class="(editing) ? 'form-editing' : 'form-not-editing'">
      <expected-student-file-form ref="form"
                                  @on_submit="update_expected_student_file($event)"
                                  :expected_student_file="expected_student_file"
                                  @on_form_validity_changed="pattern_is_valid = $event">
        <template slot="form_footer">
          <APIErrors ref="api_errors"> </APIErrors>

          <div class="button-container">
            <button class="save-button"
                    type="submit"
                    :disabled="!pattern_is_valid"> Save
            </button>
            <button class="cancel-save-button"
                    type="button"
                    @click="cancel_update"> Cancel
            </button>
          </div>
        </template>
      </expected-student-file-form>
    </div>

    <modal ref="delete_expected_student_file_modal"
           size="large"
           :include_closing_x="false">
      <div id="modal-header">Confirm Deletion</div>
      <hr>
      <div id="modal-body"> Are you sure you want to delete the pattern
        <b class="file-to-delete">{{expected_student_file.pattern}}</b>?
        This action cannot be undone, and any test cases that rely on this file may have
        to be updated before they run correctly again.
      </div>
      <div id="modal-button-container">
        <button class="modal-delete-button"
                type="button"
                :disabled="d_delete_pending"
                @click="delete_expected_student_file"> Delete </button>
        <button class="modal-cancel-button"
                type="button"
                @click="$refs.delete_expected_student_file_modal.close()"> Cancel </button>
      </div>
    </modal>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { ExpectedStudentFile } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import ExpectedStudentFileForm, { ExpectedStudentFileFormData } from '@/components/project_admin/expected_student_files/expected_student_file_form.vue';
import { handle_api_errors_async, safe_assign } from '@/utils';

@Component({
  components: {
    APIErrors,
    ExpectedStudentFileForm,
    Modal
  }
})
export default class SingleExpectedStudentFile extends Vue {

  @Prop({required: true, type: Object})
  expected_student_file!: ExpectedStudentFile;

  editing = false;
  d_delete_pending = false;

  // Using a default value here is cleaner than making this field nullable and using
  // the non-null assertion operator at all use points
  d_expected_student_file: ExpectedStudentFile = new ExpectedStudentFile({
    pk: 0,
    project: 0,
    pattern: "",
    min_num_matches: 1,
    max_num_matches: 1,
    last_modified: ""
  });
  d_saving = false;
  pattern_is_valid = false;

  created() {
    this.d_expected_student_file = new ExpectedStudentFile(this.expected_student_file);
  }

  @Watch('expected_student_file')
  on_expected_student_file_changed(new_file: ExpectedStudentFile,
                                   old_file: ExpectedStudentFile) {
    this.d_expected_student_file.pattern = new_file.pattern;
    this.d_expected_student_file.min_num_matches = new_file.min_num_matches;
    this.d_expected_student_file.max_num_matches = new_file.max_num_matches;
  }

  get wildcard_is_present() {
    return this.expected_student_file.pattern.match('[*?![\\]]') !== null;
  }

  @handle_api_errors_async(handle_edit_expected_student_file_error)
  async update_expected_student_file(file: ExpectedStudentFileFormData) {
    try {
      this.d_saving = true;
      (<APIErrors> this.$refs.api_errors).clear();
      safe_assign(this.d_expected_student_file, file);
      await this.d_expected_student_file.save();
      (<ExpectedStudentFileForm> this.$refs.form).reset();
      this.editing = false;
    }
    finally {
      this.d_saving = false;
    }
  }

  cancel_update() {
    (<ExpectedStudentFileForm> this.$refs.form).reset();
    this.editing = false;
  }

  async delete_expected_student_file() {
    try {
      this.d_delete_pending = true;
      await this.expected_student_file.delete();
    }
    finally {
      this.d_delete_pending = false;
    }
  }
}

export function handle_edit_expected_student_file_error(component: SingleExpectedStudentFile,
                                                        error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';

#single-expected-student-file {
  border-radius: 2px;
  box-sizing: border-box;
  width: 100%;
}

.editing-message {
  font-weight: normal;
  padding-left: 5px;
  vertical-align: top;
}

.matches-label {
  padding: 1px 0 5px 0;
  color: lighten(black, 20);
}

.editing-file, .file {
  padding: 5px 5px 5px 10px;
}

.editing-file {
  background-color: hsl(212, 50%, 90%);
  border: 2px solid hsl(212, 50%, 90%);
  border-radius: 3px 3px 0 0;
}

.special {
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: 32px;
}

.file {
  border: 2px solid hsl(210, 20%, 96%);
  border-radius: 4px;
  margin-bottom: 5px;
}

.file:hover {
  background-color: hsl(220, 30%, 95%);
  border: 2px solid hsl(220, 30%, 94%);
}

.form-editing {
  border: 2px solid hsl(212, 50%, 90%);
  border-top: none;
  border-radius: 0 0 3px 3px;
  margin-bottom: 5px;
  padding: 15px 25px 25px 25px;
}

.pattern {
  display: inline-block;
  font-size: 17px;
  font-weight: bold;
  word-wrap: break-word;
}

.icon-holder {
  display: inline-block;
  text-align: right;
}

.edit-file, .delete-file {
  border-radius: 4px;
  border: 2px solid transparent;
  color: hsl(212, 50%, 27%);
  display: inline-block;
  padding: 5px;
}

.delete-file {
  margin-right: 5px;
}

.edit-file-icon, .delete-file-icon {
  font-size: 15px;
}

.file:hover {
  .edit-file:hover, .delete-file:hover {
    background-color: white;
    cursor: pointer;
    border: 2px solid hsl(212, 50%, 87%);
  }
}

.button-container {
  padding: 18px 0 0 0;
}

.save-button {
  @extend .green-button;
  font-size: 15px;
}

.save-button:disabled, .save-button:disabled:hover {
  @extend .gray-button;
}

.cancel-save-button {
  @extend .light-gray-button;
  color: hsl(220, 30%, 25%);
  margin-left: 10px;
}

/* ---------------- MODAL ---------------- */

#modal-header {
  padding: 5px 10px;
}

#modal-body {
  padding: 10px 10px 20px 10px;
}

.file-to-delete {
  color: $ocean-blue;
  letter-spacing: 1px;
}

#modal-button-container {
  padding: 10px;
  text-align: right;
}

.modal-cancel-button {
  @extend .gray-button;
}

.modal-delete-button {
  @extend .red-button;
  margin-right: 20px;
}

</style>
