<template>
  <div id="expected-student-file-form-component">
    <validated-form id="expected-student-file-form"
                      ref="expected_student_file_form"
                      autocomplete="off"
                      spellcheck="false"
                      @submit.native.prevent="submit_form"
                      @form_validity_changed="$emit('on_form_validity_changed', $event)">

      <div class="input-wrapper">
        <label class="input-label"> Filename </label>
        <validated-input ref='pattern'
                         v-model="d_expected_student_file.pattern"
                         :validators="[is_not_empty]"
                         input_style="border-width: 1px; margin-top: 4px;">
        </validated-input>
      </div>

      <div class="exact-match-container">
        <div class="radio-input">
          <input ref="exact_match_button"
                 type="radio"
                 id="exact-match-button"
                 :disabled="wildcard_is_present"
                 :value="true"
                 v-model="d_exact_match">
          <label class="exact-match-label"> Exact Match </label>
        </div>
        <div class="radio-input">
          <input ref="not_exact_match_button"
                 type="radio"
                 id="not-exact-match-button"
                 :value="false"
                 v-model="d_exact_match">
          <label class="wildcard-label"> Shell Wildcard </label>
        </div>
      </div>

      <div v-if="!d_exact_match || wildcard_is_present"
           class="min-max-container">
        <div class="input-wrapper">
          <label class="input-label"> Minimum number of matches </label>
          <validated-input ref='min_num_matches'
                           v-model="d_expected_student_file.min_num_matches"
                           :validators="[is_not_empty,
                                         is_number,
                                         is_non_negative]"
                           input_style="width: 75px; border-width: 1px; margin-top: 4px;">
          </validated-input>
        </div>

        <div class="input-wrapper">
          <label class="input-label"> Maximum number of matches </label>
          <validated-input ref='max_num_matches'
                           v-model="d_expected_student_file.max_num_matches"
                           :validators="[is_not_empty,
                                         is_number]"
                           input_style="width: 75px; border-width: 1px; margin-top: 4px;">
          </validated-input>
        </div>
      </div>

      <slot name="form_footer"></slot>
    </validated-form>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';

import { is_non_negative, is_not_empty, is_number } from '@/validators';
import { NewExpectedStudentFileData } from 'ag-client-typescript';

export class ExpectedStudentFileFormData implements NewExpectedStudentFileData {
  pattern: string;
  min_num_matches: number;
  max_num_matches: number;

  constructor({
    pattern = "",
    min_num_matches = 1,
    max_num_matches = 1
  }: {pattern?: string, min_num_matches?: number, max_num_matches?: number}) {
    this.pattern = pattern;
    this.min_num_matches = min_num_matches;
    this.max_num_matches = max_num_matches;
  }
}

@Component({
  components: {
    Tooltip,
    ValidatedForm,
    ValidatedInput
  }
})
export default class ExpectedStudentFileForm extends Vue {

  @Prop({default: () => new ExpectedStudentFileFormData({})})
  expected_student_file!: ExpectedStudentFileFormData;

  d_expected_student_file: ExpectedStudentFileFormData = new ExpectedStudentFileFormData({});
  d_exact_match = true;

  readonly is_non_negative = is_non_negative;
  readonly is_not_empty = is_not_empty;
  readonly is_number = is_number;

  created() {
    this.d_expected_student_file = new ExpectedStudentFileFormData(this.expected_student_file);
  }

  get wildcard_is_present() {
    return this.d_expected_student_file.pattern.match('[*?![\\]]') !== null;
  }

  @Watch('wildcard_is_present')
  on_wildcard_is_present_changed(new_val: boolean, old_val: boolean) {
    if (new_val) {
      this.d_exact_match = false;
    }
  }

  submit_form() {
    if (this.d_exact_match || !this.wildcard_is_present) {
      this.d_expected_student_file.min_num_matches = 1;
      this.d_expected_student_file.max_num_matches = 1;
    }
    this.$emit('on_submit', this.d_expected_student_file);
  }

  reset_expected_student_file_values() {
    (<ValidatedForm> this.$refs.expected_student_file_form).reset_warning_state();
    this.d_expected_student_file = new ExpectedStudentFileFormData(this.expected_student_file);
  }
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

.input-wrapper {
  padding: 10px 0 5px 0;
}

.input-label {
  font-size: 16px;
  font-weight: 500;
}
</style>
