<template>
  <div id="single-expected-student-file">

    <div :class="[editing ? 'editing-file' : 'file', odd_index ? 'odd' : 'even']">
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

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import ExpectedStudentFileForm, { ExpectedStudentFileFormData } from '@/components/project_admin/expected_student_files/expected_student_file_form.vue';

import { handle_api_errors_async, safe_assign } from '@/utils';
import { ExpectedStudentFile } from 'ag-client-typescript';

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

  @Prop({required: false, default: true})
  odd_index!: boolean;

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
  width: 100%;
  box-sizing: border-box;
  border-radius: 2px;
}

.editing-message {
  padding-left: 5px;
  vertical-align: top;
}

.matches-label {
  padding: 1px 0 5px 0;
  color: lighten(black, 45);
}

.editing-file, .file {
  padding: 5px 5px 5px 10px;
}

.editing-file {
  /*color: white;*/

  /*background-color: hsl(220, 30%, 92%);*/
  border-color: hsl(220, 30%, 92%);
  /*border: 2px solid hsl(220, 30%, 92%);*/
  background-color: hsl(212, 50%, 27%);
  border: 2px solid hsl(212, 50%, 27%);
  color: white;
  border-radius: 3px 3px 0 0;
}

.odd {

}

.even {

}

.special {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 32px;
}

.file {
  border-radius: 4px;
  margin-bottom: 10px;
  border: 2px solid hsl(210, 20%, 96%);
}

.file:hover {
  /*background-color: hsl(212, 50%, 27%);*/
  background-color: hsl(220, 30%, 95%);
  border: 2px solid hsl(220, 30%, 94%);

}

.form-editing {
  color: black;
  padding: 15px 25px 25px 25px;
  border: 2px solid hsl(212, 50%, 27%);
  /*background-color: hsl(220, 30%, 95%);*/
  /*border: 2px solid hsl(220, 30%, 94%);*/
  border-top: 0;
  border-radius: 0 0 3px 3px;
  margin-bottom: 10px;
}

.pattern {
  font-size: 17px;
  display: inline-block;
  word-wrap: break-word;
  font-weight: bold;
}

.icon-holder {
  display: inline-block;
  text-align: right;
}

.edit-file, .delete-file {
  padding: 5px;
  display: inline-block;
  color: hsl(212, 50%, 27%);
  border-radius: 4px;
  border: 2px solid transparent;
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
  margin-left: 10px;
  color: hsl(220, 30%, 25%);
}

/* ---------------- MODAL ---------------- */
#modal-header {
  padding: 5px 10px;
}

#modal-body {
  padding: 10px 10px 20px 10px;
}

.file-to-delete {
  letter-spacing: 1px;
  color: $ocean-blue;
}

#modal-button-container {
  text-align: right;
  padding: 10px;
}

.modal-cancel-button, .modal-delete-button {
  border-radius: 2px;
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
