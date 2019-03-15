<template>
  <div id="settings-container">
    <div id="settings-container-inputs">
      <ValidatedForm id="course-settings-form"
                     autocomplete="off"
                     spellcheck="false"
                     @submit.native.prevent="save_course_settings"
                     @form_validity_changed="settings_form_is_valid = $event">

        <div class="name-container">
          <label class="input-label"> Course name: </label>
          <ValidatedInput ref="course_name_input"
                          v-model="d_course.name"
                          input_style="width: 100%;
                                       max-width: 500px;
                                       border: 1px solid #ced4da;"
                          :validators="[is_not_empty]"
                          :num_rows="1">
          </ValidatedInput>
        </div>

        <div class="semester-container">
          <label class="input-label"> Semester: </label>
          <div>
            <dropdown ref="semester_dropdown"
                      :items="semesters"
                      @update_item_selected="d_course.semester = $event">
              <template slot="header">
                <div tabindex="1" class="dropdown-header-wrapper">
                  <div id="input-course-semester" class="dropdown-header">
                    {{d_course.semester}}
                    <i class="fas fa-caret-down dropdown-caret"></i>
                  </div>
                </div>
              </template>
              <span slot-scope="{item}">
                <span class="semester-item">{{item}}</span>
              </span>
            </dropdown>
          </div>
        </div>

        <div class="year-container">
          <label class="input-label"> Year: </label>
          <ValidatedInput ref="course_year_input"
                          v-model="d_course.year"
                          :num_rows="1"
                          input_style="width: 65px;
                                       border: 1px solid #ced4da;"
                          :validators="[is_not_empty, is_number, is_integer, is_valid_course_year]"
                          :from_string_fn="string_to_num">
          </ValidatedInput>
        </div>


        <div class="late-days-container">
          <label class="input-label"> Late days per student: </label>
          <ValidatedInput ref="course_late_days_input"
                          v-model="d_course.num_late_days"
                          :num_rows="1"
                          input_style="width: 50px;
                                       border: 1px solid #ced4da;"
                          :validators="[is_not_empty, is_number, is_integer, is_non_negative]"
                          :from_string_fn="string_to_num">
            <div slot="suffix"
                 class="suffix-element">
              {{d_course.num_late_days.toString() === '1' ? 'day' : 'days'}}
            </div>
          </ValidatedInput>
        </div>

        <div v-for="error of api_errors"
             class="api-error-container">
          <div class="api-error">{{error}}</div>
          <button class="dismiss-error-button"
                  type="button"
                  @click="api_errors = []">
              <span class="dismiss-error"> Dismiss
              </span>
          </button>
        </div>

        <button id="save-button"
                type="submit"
                :disabled="!settings_form_is_valid || saving"> Save Updates </button>

        <div v-if="!saving"
             class="last-saved-timestamp">
          <span> Last Saved: </span>
          {{(new Date(course.last_modified)).toLocaleString('en-US', last_modified_format)}}
        </div>
        <div v-else class="last-saved-spinner">
          <i class="fa fa-spinner fa-pulse"></i>
        </div>

      </ValidatedForm>
    </div>
  </div>
</template>

<script lang="ts">
  import { Course, Semester } from 'ag-client-typescript';
  import { AxiosResponse } from 'axios';

  import Dropdown from '@/components/dropdown.vue';
  import Tooltip from '@/components/tooltip.vue';
  import ValidatedForm from '@/components/validated_form.vue';
  import ValidatedInput from '@/components/validated_input.vue';
  import { handle_400_errors_async } from '@/utils';
  import {
    is_non_negative,
    is_not_empty,
    is_number,
    is_integer,
    make_min_value_validator,
    string_to_num
  } from '@/validators';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
    components: {
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
    d_course!: Course;
    last_modified_format = {year: 'numeric', month: 'long', day: 'numeric',
                            hour: 'numeric', minute: 'numeric', second: 'numeric'};
    saving = false;
    semesters = [Semester.fall, Semester.winter, Semester.spring, Semester.summer];
    settings_form_is_valid = true;

    readonly is_non_negative = is_non_negative;
    readonly is_not_empty = is_not_empty;
    readonly is_number = is_number;
    readonly is_integer = is_integer;
    readonly is_valid_course_year = make_min_value_validator(2000);
    readonly string_to_num = string_to_num;

    created() {
      console.log('weee');
      this.d_course = this.course;
    }

    @handle_400_errors_async(handle_save_course_settings_error)
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

  function handle_save_course_settings_error(component: CourseSettings, response: AxiosResponse) {
    let errors = response.data["__all__"];
    if (errors.length > 0) {
      component.api_errors = [errors[0]];
    }
  }
</script>

<style scoped lang="scss">
@import '@/styles/components/course_admin.scss';
@import '@/styles/button_styles.scss';

#settings-container {
  padding-top: 15px;
}

.api-error-container {
  max-width: 500px;
}

#save-button {
  @extend .green-button;
}

#save-button:disabled {
  @extend .gray-button;
  cursor: default;
}

#save-button, #save-button:disabled {
  display: block;
  font-size: 16px;
  margin: 15px 0 15px 0;
  padding: 10px 15px;
}

#save-button:disabled:hover {
  background-color: hsl(210, 13%, 63%);
}

#settings-container-inputs {
  margin: 0 20px;
}

.name-container, .year-container, .semester-container, .late-days-container {
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
  color: black;
  display: inline-block;
  font-size: 18px;
}

.suffix-element {
  display: inline-block;
  padding-left: 10px;
  padding-top: 8px;
  vertical-align: top;
}
</style>
