<template>
  <div id="create-expected-student-file-component">
      <expected-student-file-form ref="form"
                                  @on_submit="create_expected_student_file($event)"
                                  :on_form_validity_change="(event) => { pattern_is_valid = event }">

        <template slot="form_footer">
          <a-p-i-errors ref="api_errors"> </a-p-i-errors>

          <button class="add-file-button"
                  type="submit"
                  :disabled="!pattern_is_valid"> Add File
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

  @Component({
    components: { APIErrors, ExpectedStudentFileForm }
  })
  export default class CreateExpectedStudentFile extends Vue {

    @Prop({required: true, type: Project})
    project!: Project;

    d_create_pending = false;
    pattern_is_valid = false;

    @handle_api_errors_async(handle_add_expected_student_file_error)
    async create_expected_student_file(new_expected_student_file_data: NewExpectedStudentFileData) {
      try {
        this.d_create_pending = true;
        (<APIErrors> this.$refs.api_errors).clear();
        await ExpectedStudentFile.create(this.project.pk, new_expected_student_file_data);
        (<ExpectedStudentFileForm> this.$refs.form).reset_expected_student_file_values();
      }
      finally {
        this.d_create_pending = false;
      }
    }
  }

  export function handle_add_expected_student_file_error(component: CreateExpectedStudentFile,
                                                  error: unknown) {
    (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
  }
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';

#create-expected-student-file-component {
  border-radius: 2px;
  box-sizing: border-box;
  margin-bottom: 12px;
  width: 100%;
}

.add-file-button {
  @extend .green-button;
}

.add-file-button:disabled {
  @extend .gray-button;
}

.add-file-button, .add-file-button:disabled {
  font-size: 15px;
  margin-top: 12px;
}

.add-file-button:disabled, .add-file-button:disabled:hover {
  background-color: hsl(220, 30%, 85%);
  border-color: hsl(220, 30%, 80%);
  color: gray;
  cursor: default;
}

</style>
