<template>
  <div id="create-expected-student-file-component">
    <div>

      <validated-form id="create-expected-student-file-form"
                      ref="create_expected_student_file_form"
                      autocomplete="off"
                      spellcheck="false"
                      @submit.native.prevent
                      @form_validity_changed="pattern_is_valid = $event">

        <div class="input-wrapper">
          <label class="input-label"> Filename </label>
          <validated-input ref='filename'
                           v-model="d_new_expected_student_file.pattern"
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

        <div v-if="!exact_match || wildcard_is_present()"
             class="min-max-container">
          <div class="input-wrapper">
            <label class="input-label"> Minimum number of matches </label>
            <validated-input ref='min_matches'
                             v-model="d_new_expected_student_file.min_num_matches"
                             :validators="[is_not_empty,
                                           is_number,
                                           is_non_negative]"
                             input_style="width: 75px; border-width: 1px; margin-top: 4px;">
            </validated-input>
          </div>

          <div class="input-wrapper">
            <label class="input-label"> Maximum number of matches </label>
            <validated-input ref='max_matches'
                             v-model="d_new_expected_student_file.max_num_matches"
                             :validators="[is_not_empty,
                                           is_number,
                                           max_is_greater_than_or_equal_to_min]"
                             input_style="width: 75px; border-width: 1px; margin-top: 4px;">
            </validated-input>
          </div>
        </div>

        <div v-for="error of api_errors" class="api-error-container">
          <div class="api-error">{{error}}</div>
          <button class="dismiss-error-button"
                  type="button"
                  @click="api_errors = []">
              <span class="dismiss-error"> Dismiss
              </span>
          </button>
        </div>

        <button class="add-filename-button"
                @click="create_pattern"
                :disabled="!pattern_is_valid">
          Add Filename
        </button>

      </validated-form>
    </div>
  </div>
</template>

<script lang="ts">
  import Tooltip from '@/components/tooltip.vue';
  import ValidatedForm from '@/components/validated_form.vue';
  import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import { AxiosResponse } from 'axios';

  import { handle_400_errors_async } from '@/utils';

  import { is_non_negative, is_not_empty, is_number } from '@/validators';

  import { ExpectedStudentFile, NewExpectedStudentFileData, Project } from 'ag-client-typescript';

  class CreateExpectedStudentFileData implements NewExpectedStudentFileData {
    pattern: string = "";
    min_num_matches: number = 1;
    max_num_matches: number = 1;
  }

  @Component({
    components: { Tooltip, ValidatedForm, ValidatedInput }
  })
  export default class CreateExpectedStudentFile extends Vue {

    @Prop({required: true, type: Project})
    project!: Project;

    readonly is_non_negative = is_non_negative;
    readonly is_not_empty = is_not_empty;
    readonly is_number = is_number;

    d_new_expected_student_file = new CreateExpectedStudentFileData();
    pattern_is_valid = false;
    exact_match = true;
    api_errors: string[] = [];

    wildcard_is_present() {
      if (this.d_new_expected_student_file!.pattern.match('[*?![\\]]') !== null) {
        this.exact_match = false;
      }
      return this.d_new_expected_student_file!.pattern.match('[*?![\\]]') !== null;
    }

    @handle_400_errors_async(handle_add_expected_student_file_error)
    async create_pattern() {
      if (this.exact_match || !this.wildcard_is_present()) {
        this.d_new_expected_student_file!.min_num_matches = 1;
        this.d_new_expected_student_file!.max_num_matches = 1;
      }
      await ExpectedStudentFile.create(this.project.pk, this.d_new_expected_student_file);
      this.d_new_expected_student_file = new CreateExpectedStudentFileData();
      (<ValidatedInput> this.$refs.create_expected_student_file_form).clear();
    }

    max_is_greater_than_or_equal_to_min(value: string): ValidatorResponse {
      return {
        is_valid: this.is_number(value).is_valid
                  && Number(value) >= this.d_new_expected_student_file!.min_num_matches,
        error_msg: "Min matches must be less than or equal to Max Matches"
      };
    }
  }

  export function handle_add_expected_student_file_error(component: CreateExpectedStudentFile,
                                                  response: AxiosResponse) {
    let errors = response.data["__all__"];
    if (errors.length > 0) {
      component.api_errors = [errors[0]];
    }
  }
</script>

<style scoped lang="scss">
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

#create-expected-student-file-component {
  border-radius: 2px;
  box-sizing: border-box;
  margin-bottom: 12px;
  width: 100%;
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

.add-filename-button {
  @extend .green-button;
}

.add-filename-button:disabled {
  @extend .gray-button;
}

.add-filename-button, .add-filename-button:disabled {
  font-family: $current-language;
  font-size: 15px;
  margin-top: 12px;
}

.add-filename-button:disabled, .add-filename-button:disabled:hover {
  background-color: hsl(220, 30%, 85%);
  border-color: hsl(220, 30%, 80%);
  color: gray;
  cursor: default;
}

.input-wrapper {
  padding: 10px 0 5px 0;
}

.input-label {
  font-size: 16px;
  font-weight: 500;
}
</style>
