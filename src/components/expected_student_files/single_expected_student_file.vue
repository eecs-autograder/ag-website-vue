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
      <expected-student-file-form ref="form"
                                  @on_submit="update_expected_student_file($event)"
                                  :expected_student_file="expected_student_file"
                                  @on_form_validity_changed="pattern_is_valid = $event">
        <template slot="form_footer">
          <a-p-i-errors ref="api_errors"> </a-p-i-errors>

          <div class="button-container">
            <button class="cancel-update-button"
                    type="button"
                    @click="cancel_update"> Cancel
            </button>
            <button class="update-button"
                    type="submit"
                    :disabled="!pattern_is_valid"> Update File
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
                @click="delete_pattern_permanently"> Delete </button>
        <button class="modal-cancel-button"
                type="button"
             @click="$refs.delete_expected_student_file_modal.close()"> Cancel </button>
      </div>
    </modal>

  </div>
</template>

<script lang="ts">
  import APIErrors from '@/components/api_errors.vue';
  import ExpectedStudentFileForm,
         { ExpectedStudentFileFormData }
         from '@/components/expected_student_files/expected_student_file_form.vue';
  import Modal from '@/components/modal.vue';
  import { handle_api_errors_async, safe_assign } from '@/utils';

  import { ExpectedStudentFile } from 'ag-client-typescript';
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  @Component({
    components: { APIErrors, ExpectedStudentFileForm, Modal }
  })
  export default class SingleExpectedStudentFile extends Vue {

    @Prop({required: true, type: Object})
    expected_student_file!: ExpectedStudentFile;

    @Prop({required: false, default: true})
    odd_index!: boolean;

    actively_updating = false;
    d_expected_student_file: ExpectedStudentFile | null = null;
    d_delete_pending = false;
    d_saving = false;
    pattern_is_valid = false;

    created() {
      this.d_expected_student_file = new ExpectedStudentFile(this.expected_student_file);
    }

    @Watch('expected_student_file')
    on_expected_student_file_changed(new_file: ExpectedStudentFile,
                                     old_file: ExpectedStudentFile) {
      this.d_expected_student_file!.pattern = new_file.pattern;
      this.d_expected_student_file!.min_num_matches = new_file.min_num_matches;
      this.d_expected_student_file!.max_num_matches = new_file.max_num_matches;
    }

    get wildcard_is_present() {
      return this.expected_student_file.pattern.match('[*?![\\]]') !== null;
    }

    @handle_api_errors_async(handle_edit_expected_student_file_error)
    async update_expected_student_file(file: ExpectedStudentFileFormData) {
      try {
        this.d_saving = true;
        (<APIErrors> this.$refs.api_errors).clear();
        safe_assign(this.d_expected_student_file!, file);
        await this.d_expected_student_file!.save();
        (<ExpectedStudentFileForm> this.$refs.form).reset_expected_student_file_values();
        this.actively_updating = false;
      }
      finally {
        this.d_saving = false;
      }
    }

    cancel_update() {
      (<ExpectedStudentFileForm> this.$refs.form).reset_expected_student_file_values();
      this.actively_updating = false;
    }

    async delete_pattern_permanently() {
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
  margin-bottom: 12px;
  border-radius: 2px;
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

.odd-header, .even-header {
  padding: 14px 120px 14px 15px;
  border-radius: 3px;
  position: relative;
}

.odd-header {
  background-image: linear-gradient(to bottom right, hsl(212, 100%, 90%), hsl(212, 100%, 85%));
}

.even-header {
  background-image: linear-gradient(to bottom right, hsl(212, 100%, 84%), hsl(212, 100%, 85%));
}

.form-editing {
  color: black;
  padding: 15px 25px 25px 25px;
  border: 2px solid hsl(220, 20%, 39%);
  border-top: 0;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
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
