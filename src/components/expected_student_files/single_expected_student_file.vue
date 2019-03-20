<template>
  <div id="single-expected-student-file" v-if="expected_student_file !== null">

    <div :class="[{'header-editing' : actively_updating},
                  {'odd-header': !actively_updating && odd_index },
                  {'even-header': !actively_updating && !odd_index}]">
      <div :class="['pattern', {'editing-pattern': actively_updating}]">
        <b>{{expected_student_file.pattern}}</b>
      </div>
      <span v-if="actively_updating" class="editing-message"> (Editing)</span>
      <span v-if="wildcard_is_present">
        <div class="matches-label">
          Minimum number of matches: {{expected_student_file.min_num_matches}}
        </div>

        <div class="matches-label">
          Maximum number of matches: {{expected_student_file.max_num_matches}}
        </div>
      </span>


      <div v-if="!actively_updating" class="icon-holder">
        <div class="delete-file"
             @click="$refs.delete_expected_student_file_modal.open()">
          <span> Delete </span>
          <i class="fas fa-trash delete-file-icon"></i>
        </div>
        <div class="edit-file"
             @click="actively_updating = true">
          <span> Edit </span>
          <i class="fas fa-edit edit-file-icon"></i>
        </div>
      </div>
    </div>

    <div v-if="actively_updating"
         :class="(actively_updating) ? 'form-editing' : 'form-not-editing'">
      <expected-student-file-form id="my_form"
                                  ref="form"
                                  @on_submit="update_expected_student_file($event)"
                                  :on_form_validity_change="(event) => { pattern_is_valid = event }"
                                  :expected_student_file="expected_student_file">

        <template slot="form_footer">
          <div v-for="error of api_errors" class="api-error-container">
            <div class="api-error">{{error}}</div>
            <button class="dismiss-error-button"
                    type="button"
                    @click="api_errors = []">
              <span class="dismiss-error"> Dismiss
              </span>
            </button>
          </div>

          <div class="button-container">
            <button class="cancel-update-button"
                    type="button"
                    @click="cancel_update"> Cancel
            </button>
            <button class="update-button"
                    type="submit"
                    :disabled="!pattern_is_valid"> Update
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
                :disabled="d_delete_pending"
                @click="delete_pattern_permanently"> Delete </button>
        <div class="modal-cancel-button"
             @click="$refs.delete_expected_student_file_modal.close()"> Cancel </div>
      </div>
    </modal>

  </div>
</template>

<script lang="ts">
  import ExpectedStudentFileForm from '@/components/expected_student_files/expected_student_file_form.vue';
  import Modal from '@/components/modal.vue';

  import { handle_400_errors_async } from '@/utils';

  import { AxiosResponse } from 'axios';

  import { ExpectedStudentFile } from 'ag-client-typescript';
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  @Component({
    components: { ExpectedStudentFileForm, Modal }
  })
  export default class SingleExpectedStudentFile extends Vue {

    @Prop({required: true, type: Object})
    expected_student_file!: ExpectedStudentFile;

    @Prop({required: false, default: true})
    odd_index!: boolean;

    actively_updating = false;
    d_delete_pending = false;
    pattern_is_valid = false;
    api_errors: string[] = [];

    get wildcard_is_present() {
      return this.expected_student_file.pattern.match('[*?![\\]]') !== null;
    }

    @handle_400_errors_async(handle_edit_expected_student_file_error)
    async update_expected_student_file(file: ExpectedStudentFile) {
      try {
        await file!.save();
        this.actively_updating = false;
        (<ExpectedStudentFileForm> this.$refs.form).reset_expected_student_file_values();
      }
      finally {}
    }

    cancel_update() {
      this.actively_updating = false;
      (<ExpectedStudentFileForm> this.$refs.form).reset_expected_student_file_values();
    }

    async delete_pattern_permanently() {
      try {
        this.d_delete_pending = true;
        await this.expected_student_file.delete();
        this.d_delete_pending = false;
      }
      finally {}
    }
  }

  export function handle_edit_expected_student_file_error(component: SingleExpectedStudentFile,
                                                          response: AxiosResponse) {
    let errors = response.data["__all__"];
    if (errors.length > 0) {
      component.api_errors = [errors[0]];
    }
  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';

// api errors ************************************************************
.api-error-container {
  box-sizing: border-box;
  width: 100%;
  position: relative;
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px 90px 10px 10px;
  border-radius: .25rem;
  margin-top: 11px;
}

.dismiss-error-button {
  font-size: 15px;
  position: absolute;
  right: 5px;
  top: 6px;
  padding: 4px 10px;
  background-color: white;
  border-radius: .25rem;
  cursor: pointer;
  border: 1px solid #f5c6cb;
}

.editing-message {
  padding-left: 5px;
  vertical-align: top;
}

.matches-label {
  padding: 5px 0 0 0;
}

.header-editing {
  padding: 14px 100px 14px 15px;
  background-image: linear-gradient(to bottom right, hsl(220, 20%, 37%), hsl(220, 20%, 39%));
  border-bottom: none;
  border-radius: 3px 3px 0 0;
  position: relative;
  color: white;
}

.odd-header {
  background-image: linear-gradient(to bottom right, hsl(212, 100%, 90%), hsl(212, 100%, 85%));
  padding: 14px 120px 14px 15px;
  border-radius: 3px;
  position: relative;
}

.even-header {
  background-image: linear-gradient(to bottom right, hsl(212, 100%, 84%), hsl(212, 100%, 85%));
  padding: 14px 120px 14px 15px;
  border-radius: 3px;
  position: relative;
}

#single-expected-student-file {
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 12px;
  border-radius: 2px;
}

.form-editing {
  color: black;
  padding: 15px 25px 30px 25px;
  border: 2px solid hsl(220, 20%, 39%);
  border-top: 0;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
}

.input-wrapper {
  padding: 10px 0 5px 0;
}

.input-label {
  font-size: 16px;
  font-weight: 500;
}

.pattern {
  font-size: 17px;
  display: inline-block;
  max-width: 200px;
  word-wrap: break-word;
}

.icon-holder {
  position: absolute;
  right: 10px;
  top: 8px;
}

.edit-file, .delete-file {
  font-size: 15px;
  padding: 5px;
  display: inline-block;
  color: hsl(220, 20%, 37%);
  border-radius: 4px;
  border: 2px solid hsl(212, 100%, 92%);
  background-color: hsl(212, 100%, 92%);
}

.edit-file span, .delete-file span {
  display: none;
}

.delete-file {
  margin-right: 10px;
}

.edit-file-icon, .delete-file-icon {
  font-size: 17px;
}

.odd-header:hover, .even-header:hover {

  .edit-file, .delete-file {
    background-color: white;
    border: 2px solid whitesmoke;
  }

  .edit-file:hover, .delete-file:hover {
    background-color: white;
    border: 2px solid hsl(220, 20%, 37%);
    cursor: pointer;
  }
}

.button-container {
  padding: 18px 0 0 0;
}

.update-button {
  @extend .blue-button;
  font-size: 15px;
}

.update-button:disabled, .update-button:disabled:hover {
  background-color: hsl(220, 30%, 85%);
  border-color: hsl(220, 30%, 80%);
  color: gray;
  cursor: default;
}

.cancel-update-button {
  @extend .orange-button;
  font-size: 15px;
  margin-right: 20px;
}

/* ---------------- MODAL ---------------- */
#modal-header {
  padding: 5px 10px;
}

#modal-body {
  padding: 10px 10px 20px 10px;
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
@media only screen and (min-width: 800px) {

  .edit-file span, .delete-file span {
    display: inline-block;
  }

  .edit-file, .delete-file {
    font-size: 15px;
    padding: 5px 8px;
    display: inline-block;
  }

  .edit-file-icon, .delete-file-icon {
    display: none;
  }
}
</style>
