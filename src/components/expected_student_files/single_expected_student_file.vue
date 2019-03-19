<template>
  <div id="single-expected-student-file" v-if="d_expected_student_file !== null">

    <div :class="[{'header-editing' : actively_updating},
                  {'odd-header': !actively_updating && odd_index },
                  {'even-header': !actively_updating && !odd_index}]">
      <div :class="['pattern', {'editing-pattern': actively_updating}]">
        <b>{{expected_student_file.pattern}}</b>
      </div>
      <span v-if="actively_updating" class="editing-message"> (Editing)</span>
      <span v-if="expected_student_file.pattern.match('[*?![\\]]')">
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

      <validated-form id="edit-expected-student-file-form"
                      ref="edit_expected_student_file_form"
                      autocomplete="off"
                      spellcheck="false"
                      @submit.native.prevent="update_expected_student_file"
                      @form_validity_changed="pattern_is_valid = $event">

        <div class="input-wrapper">
          <label class="input-label">
            Filename
          </label>
          <validated-input ref='filename'
                           v-model="d_expected_student_file.pattern"
                           :validators="[is_not_empty]"
                           input_style="border-width: 1px; margin-top: 4px;">
          </validated-input>
        </div>

        <div class="exact-match-container">
          <div class="radio-input">
            <input type="radio"
                   id="exact-match"
                   :value="true"
                   v-model="exact_match">
            <label for="exact-match" class="exact-match-label"> Exact Match </label>
          </div>
          <div class="radio-input">
            <input type="radio"
                   id="shell-wildcard"
                   :value="false"
                   v-model="exact_match">
            <label for="shell-wildcard" class="wildcard-label"> Shell Wildcard </label>
          </div>
        </div>

        <span v-if="!exact_match || wildcard_is_present()"
              class="min-max-container">
          <div class="input-wrapper">
            <label class="input-label"> Minimum number of matches </label>
            <validated-input ref='min_matches'
                             v-model="d_expected_student_file.min_num_matches"
                             :validators="[is_not_empty,
                                           is_number,
                                           is_non_negative]"
                             input_style="width: 75px; border-width: 1px; margin-top: 4px;">
            </validated-input>
          </div>

          <div class="input-wrapper">
            <label class="input-label"> Maximum number of matches </label>
            <validated-input ref='max_matches'
                             v-model="d_expected_student_file.max_num_matches"
                             :validators="[is_not_empty,
                                           is_number,
                                           max_is_greater_than_or_equal_to_min]"
                             input_style="width: 75px; border-width: 1px; margin-top: 4px;">
            </validated-input>
          </div>
        </span>

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
          <button class="cancel-edit-button"
                  type="button"
                  @click="reset_expected_student_file_values"> Cancel
          </button>
          <button class="update-edit-button"
                  type="submit"
                  @click="update_expected_student_file"
                  :disabled="!pattern_is_valid"> Update
          </button>
        </div>
      </validated-form>
    </div>

    <modal ref="delete_expected_student_file_modal"
           size="large"
           :include_closing_x="false">
      <div id="modal-header">Confirm Deletion</div>
      <hr>
      <div id="modal-body"> Are you sure you want to delete the pattern
        <b class="file-to-delete">{{d_expected_student_file.pattern}}</b>?
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
  import Modal from '@/components/modal.vue';
  import Tooltip from '@/components/tooltip.vue';
  import ValidatedForm from '@/components/validated_form.vue';
  import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';

  import { handle_400_errors_async } from '@/utils';

  import { AxiosResponse } from 'axios';

  import { ExpectedStudentFile } from 'ag-client-typescript';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import { is_non_negative, is_not_empty, is_number } from '@/validators';

  @Component({
    components: { Modal, Tooltip, ValidatedForm, ValidatedInput }
  })
  export default class SingleExpectedStudentFile extends Vue {

    @Prop({required: true, type: Object})
    expected_student_file!: ExpectedStudentFile;

    @Prop({required: false, default: true})
    odd_index!: boolean;

    readonly is_non_negative = is_non_negative;
    readonly is_not_empty = is_not_empty;
    readonly is_number = is_number;

    max_is_greater_than_or_equal_to_min(value: string): ValidatorResponse {
      return {
        is_valid: this.is_number(value).is_valid
                  && Number(value) >= this.d_expected_student_file!.min_num_matches,
        error_msg: "Min matches must be less than or equal to Max Matches"
      };
    }

    min_is_less_than_or_equal_to_max(value: string): ValidatorResponse {
      return {
        is_valid: this.is_number(value).is_valid
                  && Number(value) <= this.d_expected_student_file!.max_num_matches,
        error_msg: "Min matches must be less than or equal to Max Matches"
      };
    }

    d_expected_student_file: ExpectedStudentFile | null = null;
    actively_updating = false;
    d_delete_pending = false;
    pattern_is_valid = false;
    exact_match = true;
    api_errors: string[] = [];

    created() {
      this.d_expected_student_file = new ExpectedStudentFile(this.expected_student_file);
    }

    reset_expected_student_file_values() {
      this.actively_updating = false;
      this.d_expected_student_file.pattern = this.expected_student_file.pattern;
      this.d_expected_student_file.min_num_matches = this.expected_student_file.min_num_matches;
      this.d_expected_student_file.max_num_matches = this.expected_student_file.max_num_matches;
    }

    wildcard_is_present() {
      if (this.d_expected_student_file!.pattern.match('[*?![\\]]') !== null) {
        this.exact_match = false;
      }
      return this.d_expected_student_file!.pattern.match('[*?![\\]]') !== null;
    }

    @handle_400_errors_async(handle_edit_expected_student_file_error)
    async update_expected_student_file() {
      if (this.exact_match || !this.wildcard_is_present()) {
        this.d_expected_student_file!.min_num_matches = 1;
        this.d_expected_student_file!.max_num_matches = 1;
      }
      try {
        await this.d_expected_student_file!.save();
        this.actively_updating = false;
        (<ValidatedInput> this.$refs.edit_expected_student_file_form).clear();
      }
      finally {}
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
@import url('https://fonts.googleapis.com/css?family=Quicksand');
$current-language: "Quicksand";

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

.radio-input {
  display: inline-block;
  padding: 4px 0;
}

.exact-match-container {
  padding: 4px 0 0 0;
}

.exact-match-container label {
  padding-left: 3px;
}

.exact-match-label {
  padding-right: 50px;
}

.min-max-container {
  padding-bottom: 5px;
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

.update-edit-button {
  @extend .blue-button;
  font-family: $current-language;
  font-size: 15px;
}

.update-edit-button:disabled, .update-edit-button:disabled:hover {
  background-color: hsl(220, 30%, 85%);
  border-color: hsl(220, 30%, 80%);
  color: gray;
  cursor: default;
}

.cancel-edit-button {
  @extend .orange-button;
  font-family: $current-language;
  font-size: 15px;
  margin-right: 20px;
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
