<template>
  <div id="create-expected-student-file-component">
      <expected-student-file-form ref="form"
                                  @on_submit="create_expected_student_file($event)"
                                  :on_form_validity_change="(event) => { pattern_is_valid = event }"
                                  :expected_student_file="d_new_expected_student_file">

        <template slot="form_footer">
          <a-p-i-errors ref="api_errors"> </a-p-i-errors>

          <button class="add-file-button"
                  type="submit"
                  :disabled="!pattern_is_valid"> Add
          </button>
        </template>

      </expected-student-file-form>
  </div>
</template>

<script lang="ts">
  import APIErrors from '@/components/api_errors.vue';
  import ExpectedStudentFileForm from '@/components/expected_student_files/expected_student_file_form.vue';

  import { handle_api_errors_async } from '@/utils';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import { ExpectedStudentFile, NewExpectedStudentFileData, Project } from 'ag-client-typescript';

  export class CreateExpectedStudentFileData implements NewExpectedStudentFileData {
    pattern: string = "";
    min_num_matches: number = 1;
    max_num_matches: number = 1;
  }

  @Component({
    components: { APIErrors, ExpectedStudentFileForm }
  })
  export default class CreateExpectedStudentFile extends Vue {

    @Prop({required: true, type: Project})
    project!: Project;

    d_new_expected_student_file = new CreateExpectedStudentFileData();
    pattern_is_valid = false;

    @handle_api_errors_async(handle_add_expected_student_file_error)
    async create_expected_student_file(new_expected_student_file_data: NewExpectedStudentFileData) {
      await ExpectedStudentFile.create(this.project.pk, new_expected_student_file_data);
      (<ExpectedStudentFileForm> this.$refs.form).reset_expected_student_file_values();
    }
  }

  export function handle_add_expected_student_file_error(component: CreateExpectedStudentFile,
                                                  error: unknown) {
    (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
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

.add-file-button {
  @extend .green-button;
}

.add-file-button:disabled {
  @extend .gray-button;
}

.add-file-button, .add-file-button:disabled {
  font-family: $current-language;
  font-size: 15px;
  margin-top: 12px;
}

.add-file-button:disabled, .add-file-button:disabled:hover {
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
