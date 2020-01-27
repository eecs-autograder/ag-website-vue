<template>
  <validated-form ref="form"
                  class="course-form"
                  @submit='submit'
                  @form_validity_changed="$emit('form_validity_changed', $event)">
    <div class="form-field-wrapper">
      <label class="label"> Course name </label>
      <validated-input ref="course_name_input"
                       v-model="d_form_data.name"
                       input_style="width: 100%;
                                    max-width: 500px;"
                       :validators="[is_not_empty]">
      </validated-input>
    </div>

    <div class="form-field-wrapper">
      <label class="label">
        Course subtitle
        <tooltip width="large" placement="top">
          A more descriptive course title, such as "Programming and Intro Data Structures"
        </tooltip>
      </label>
      <ValidatedInput ref="subtitle"
                      v-model="d_form_data.subtitle"
                      input_style="width: 100%;
                                    max-width: 500px;"
                      :validators="[]">
      </ValidatedInput>
    </div>

    <div class="form-field-wrapper">
      <label class="label" for="semester"> Semester </label>
      <div>
        <select ref="semester" v-model="d_form_data.semester" class="select">
          <option v-for="semester of semesters" :value="semester">{{semester}}</option>
        </select>
      </div>
    </div>

    <div class="form-field-wrapper">
      <label class="label"> Year </label>
      <ValidatedInput ref="course_year_input"
                      v-model="d_form_data.year"
                      input_style="width: 65px;"
                      :validators="[is_not_empty, is_number, is_integer, is_valid_course_year]"
                      :from_string_fn="string_to_num">
      </ValidatedInput>
    </div>

    <div class="form-field-wrapper">
      <label class="label">
        Late day tokens per student
        <tooltip width="large" placement="top">
          When a project's hard deadline (and a student's extension, if any)
          has passed, students with late day tokens can continue to submit
          after the hard deadline. <br><br>
          Tokens are used automatically the first time a student submits after  a project's
          hard deadline. <br><br>
          Using one token will allow a student to submit until 24 hours
          after the hard deadline.
        </tooltip>
      </label>
      <ValidatedInput ref="course_late_days_input"
                      v-model="d_form_data.num_late_days"
                      input_style="width: 50px;"
                      :validators="[is_not_empty, is_number, is_integer, is_non_negative]"
                      :from_string_fn="string_to_num">
      </ValidatedInput>
    </div>

    <div class="form-field-wrapper">
      <label class="label">
        Guest usernames must end with
        <tooltip width="large" placement="top">
          If "Anyone with the link can submit" is checked in a project's settings,
          users not in the roster (guests) can only submit if their username ends with
          the string here. <br>
          For example, specifying "@umich.edu" here would only allow guests from
          that domain.
        </tooltip>
      </label>
      <ValidatedInput ref="allowed_guest_domain"
                      v-model="d_form_data.allowed_guest_domain"
                      :validators="[]"
                      input_style="width: 200px;">
      </ValidatedInput>
    </div>

    <slot></slot>
  </validated-form>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';

import { Course, Semester } from 'ag-client-typescript';

import { GlobalData } from '@/app.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { deep_copy, format_datetime_short, handle_api_errors_async } from '@/utils';
import {
  is_integer,
  is_non_negative,
  is_not_empty,
  is_number,
  make_min_value_validator,
  string_to_num
} from '@/validators';

export class CourseFormData {
  name: string;
  semester: Semester | null;
  year: number | null;
  subtitle: string;
  num_late_days: number;
  allowed_guest_domain: string;

  constructor({
    name = '',
    semester = Semester.fall,
    year = (new Date()).getFullYear(),
    subtitle = '',
    num_late_days = 0,
    allowed_guest_domain = '',
  }: Partial<CourseFormData> = {}) {
    this.name = name;
    this.semester = semester;
    this.year = year;
    this.subtitle = subtitle;
    this.num_late_days = num_late_days;
    this.allowed_guest_domain = allowed_guest_domain;
  }
}

@Component({
  components: {
    Tooltip,
    ValidatedForm,
    ValidatedInput,
  }
})
export default class CourseForm extends Vue {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  @Prop({default: null, type: [Course, CourseFormData]})
  course!: Course | null;

  d_form_data = new CourseFormData();

  @Watch('course')
  on_course_changed(new_value: Course, old_value: Course) {
    this.d_form_data = new CourseFormData(new_value);
  }

  semesters = [Semester.fall, Semester.winter, Semester.spring, Semester.summer];

  readonly Semester = Semester;

  readonly is_non_negative = is_non_negative;
  readonly is_not_empty = is_not_empty;
  readonly is_integer = is_integer;
  readonly is_number = is_number;
  readonly is_valid_course_year = make_min_value_validator(2000);
  readonly string_to_num = string_to_num;

  readonly format_datetime_short = format_datetime_short;

  created() {
    if (this.course === null) {
      let split_username = this.d_globals.current_user!.username.split('@');
      let current_user_domain = split_username.length === 2 ? '@' + split_username[1] : '';
      this.d_form_data = new CourseFormData({
        allowed_guest_domain: current_user_domain
      });
    }
    else {
      this.d_form_data = new CourseFormData(this.course);
    }

    this.$nextTick(() => {
      (<ValidatedInput> this.$refs.course_name_input).focus();
    });
  }

  submit() {
    this.$emit('submit', this.d_form_data);
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/forms.scss';
</style>
