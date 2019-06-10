<template>
  <div id="settings-container">
    <div id="settings-container-inputs">
      <ValidatedForm id="course-settings-form"
                     autocomplete="off"
                     spellcheck="false"
                     @submit="save_course_settings"
                     @form_validity_changed="settings_form_is_valid = $event">

        <div class="input-container">
          <label class="text-label"> Course name </label>
          <ValidatedInput ref="course_name_input"
                          v-model="d_course.name"
                          input_style="width: 100%;
                                       max-width: 500px;"
                          :validators="[is_not_empty]">
          </ValidatedInput>
        </div>

        <div class="input-container">
          <label class="text-label" for="semester"> Semester </label>
          <div>
            <select id="semester" v-model="d_course.semester" class="select">
              <option :value="Semester.fall">{{Semester.fall}}</option>
              <option :value="Semester.winter">{{Semester.winter}}</option>
              <option :value="Semester.spring">{{Semester.spring}}</option>
              <option :value="Semester.summer">{{Semester.summer}}</option>
            </select>
          </div>
        </div>

        <div class="input-container">
          <label class="text-label"> Year </label>
          <ValidatedInput ref="course_year_input"
                          v-model="d_course.year"
                          input_style="width: 65px;"
                          :validators="[is_not_empty, is_number, is_integer, is_valid_course_year]"
                          :from_string_fn="string_to_num">
          </ValidatedInput>
        </div>

        <div class="input-container">
          <label class="text-label"> Late days per student </label>
          <ValidatedInput ref="course_late_days_input"
                          v-model="d_course.num_late_days"
                          input_style="width: 50px;"
                          :validators="[is_not_empty, is_number, is_integer, is_non_negative]"
                          :from_string_fn="string_to_num">
            <div slot="suffix"
                 class="suffix-element">
              {{d_course.num_late_days === 1 ? 'day' : 'days'}}
            </div>
          </ValidatedInput>
        </div>

        <div class="input-container">
          <label class="text-label">
            Guest usernames must end with
            <i class="fas fa-question-circle input-tooltip">
              <tooltip width="large" placement="right">
                If "Anyone with the link can submit" is checked in a project's settings,
                users not in the roster (guests) can only submit if their username ends with
                the string here. <br>
                For example, specifying "@umich.edu" here would only allow guests from
                that domain.
              </tooltip>
            </i>
          </label>
          <ValidatedInput id="allowed-guest-domain"
                          v-model="d_course.allowed_guest_domain"
                          :validators="[]"
                          input_style="width: 200px;">
          </ValidatedInput>
        </div>

        <APIErrors ref="api_errors"></APIErrors>

        <button id="save-button"
                type="submit"
                :disabled="!settings_form_is_valid || saving"> Save Updates </button>

        <div v-if="!saving"
             class="last-saved-timestamp">
          <span> Last Saved: </span>
          {{format_datetime(d_course.last_modified)}}
        </div>
        <div v-else class="last-saved-spinner">
          <i class="fa fa-spinner fa-pulse"></i>
        </div>

      </ValidatedForm>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Course, Semester } from 'ag-client-typescript';

import APIErrors from "@/components/api_errors.vue";
import Dropdown from '@/components/dropdown.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { deep_copy, format_datetime, handle_api_errors_async } from '@/utils';
import {
  is_integer,
  is_non_negative,
  is_not_empty,
  is_number,
  make_min_value_validator,
  string_to_num
} from '@/validators';

@Component({
  components: {
    APIErrors,
    Dropdown,
    Tooltip,
    ValidatedForm,
    ValidatedInput
  }
})
export default class CourseSettings extends Vue {
  @Prop({required: true, type: Course})
  course!: Course;

  api_errors: string[] = [];
  d_course: Course = new Course({
    pk: 0,
    name: '',
    semester: Semester.fall,
    year: 0,
    subtitle: '',
    num_late_days: 0,
    allowed_guest_domain: '',
    last_modified: '',
  });

  saving = false;
  semesters = [Semester.fall, Semester.winter, Semester.spring, Semester.summer];
  settings_form_is_valid = true;

  readonly Semester = Semester;

  readonly is_non_negative = is_non_negative;
  readonly is_not_empty = is_not_empty;
  readonly is_integer = is_integer;
  readonly is_number = is_number;
  readonly is_valid_course_year = make_min_value_validator(2000);
  readonly string_to_num = string_to_num;

  readonly format_datetime = format_datetime;

  created() {
    this.d_course = deep_copy(this.course, Course);
  }

  @handle_api_errors_async(handle_save_course_settings_error)
  async save_course_settings() {
    try {
      this.saving = true;
      this.api_errors = [];
      await this.d_course.save();
    }
    finally {
      this.saving = false;
    }
  }
}

function handle_save_course_settings_error(component: CourseSettings, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';

#settings-container {
  padding-top: 5px;
  margin: 0 5%;
}

.api-error-container {
  max-width: 500px;
}

#save-button {
  @extend .green-button;
}

#save-button {
  display: block;
  margin: 15px 0 15px 0;
}

.input-container {
  display: block;
  max-width: 500px;
  padding-bottom: 16px;
}

#input-course-semester {
  width: 140px;
  height: 39px;
}

.semester-item {
  font-size: 16px;
}

.last-saved-timestamp {
  color: lighten(#495057, 40);
  font-size: 15px;
}

.last-saved-spinner {
  color: $ocean-blue;
  display: inline-block;
  font-size: 18px;
}

.suffix-element {
  display: inline-block;
  padding-left: 10px;
  padding-top: 8px;
  vertical-align: top;
}

@media only screen and (min-width: 481px) {
  #settings-container {
    margin: 0 2.5%;
  }
}
</style>
