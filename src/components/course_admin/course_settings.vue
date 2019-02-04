<template>
  <div id="settings-container">
    <div id="settings-container-inputs">
      <ValidatedForm id="course-settings-form"
                     autocomplete="off"
                     @submit.native.prevent="save_course_settings"
                     @form_validity_changed="settings_form_is_valid = $event">

        <div class="name-container">
          <label class="settings-input-label"> Course name: </label>
          <ValidatedInput ref="course_name"
                          v-model="course.name"
                          input_style="width: 100%; max-width: 500px; border-width: 2px"
                          :validators="[is_not_empty]"
                          :num_rows="1">
          </ValidatedInput>
        </div>

        <div class="semester-container">
          <label class="settings-input-label"> Semester: </label>
          <div class="semester-dropdown-wrapper">
            <dropdown ref="semester_dropdown"
                      :items="semesters"
                      @update_item_selected="course.semester = $event">
              <template slot="header">
                <div tabindex="1" class="input-wrapper">
                  <div id="input-course-semester"
                       class="settings-input">
                    {{course.semester}}
                    <i class="fas fa-caret-down dropdown-caret"></i>
                  </div>
                </div>
              </template>
              <div slot-scope="{item}">
                <span class="semester-item">{{item}}</span>
              </div>
            </dropdown>
          </div>
        </div>

        <div class="year-container">
          <label class="settings-input-label"> Year: </label>
          <ValidatedInput ref="course_year"
                          v-model="course.year"
                          :num_rows="1"
                          input_style="width: 65px; border-width: 2px"
                          :validators="[is_not_empty, is_number, is_valid_year]">
          </ValidatedInput>
        </div>


        <div class="late-days-container">
          <label class="settings-input-label"> Late days per student: </label>
          <ValidatedInput ref="course_late_days"
                          v-model="course.num_late_days"
                          :num_rows="1"
                          input_style="width: 50px; border-width: 2px"
                          :validators="[is_not_empty, is_number, is_non_negative]">
            <div slot="suffix" class="suffix-element">
              {{ course.num_late_days === 1 ? 'day' : 'days'}} </div>
          </ValidatedInput>
        </div>

        <ul class="error-ul">
          <li v-for="error of api_errors" class="error-li">{{error}}</li>
        </ul>

        <input id="settings-submit"
               type="submit"
               class="submit-button"
               value="Save Updates"
               :disabled="!settings_form_is_valid || saving">
        <div v-if="!saving"
             class="last-saved-timestamp">
          <span> Last Saved: </span>
          {{(new Date(course.last_modified)).toLocaleString(
          'en-US', last_modified_format
          )}}
        </div>
        <div v-else class="last-saved-spinner">
          <i class="fa fa-spinner fa-pulse"></i>
        </div>

      </ValidatedForm>
    </div>
  </div>
</template>

<script lang="ts">
import { Course, Semester, User } from 'ag-client-typescript';
import { AxiosResponse } from 'axios';

import Dropdown from '@/components/dropdown.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { handle_400_errors_async } from '@/utils';
import { is_non_negative, is_not_empty, is_number } from '@/validators';
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

  saving = false;

  semesters = [Semester.fall, Semester.winter, Semester.spring, Semester.summer];
  last_modified_format = {year: 'numeric', month: 'long', day: 'numeric',
                          hour: 'numeric', minute: 'numeric', second: 'numeric'};

  settings_form_is_valid = false;
  api_errors: string[] = [];
  d_course!: Course;

  created() {
    this.d_course = this.course;
  }

  is_valid_year(value: string): ValidatorResponse {
    return {
      is_valid: Number(value) >= 2000,
      error_msg: "Please enter a valid year"
    };
  }

  readonly is_not_empty = is_not_empty;
  readonly is_non_negative = is_non_negative;
  readonly is_number = is_number;

  @handle_400_errors_async(handle_save_course_settings_error)
  async save_course_settings() {
    try {
      console.log("Saving course settings");
      this.saving = true;
      this.api_errors = [];
      console.log("right before call");
      let response = await this.course.save();
      console.log(this.course);
      console.log("saving done");
    }
    finally {
      this.saving = false;
    }
  }
}

// mock the response so last modified timestamp is different
function handle_save_course_settings_error(component: CourseSettings, response: AxiosResponse) {
  let errors = response.data["__all__"];

  console.log("handling any errors");
  // when would this not be true?
  if (errors.length > 0) {
    component.api_errors = [errors[0]];
    console.log("ERRORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR");
  }
}
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';
  @import '@/styles/button_styles.scss';
  @import url('https://fonts.googleapis.com/css?family=Montserrat');
  @import url('https://fonts.googleapis.com/css?family=Sawarabi+Gothic');
  @import url('https://fonts.googleapis.com/css?family=Muli');

  $current-lang-choice: "Muli";
  $github-black-color: #24292e;

  .submit-button {
    @extend .green-button;
    text-align: center;
    display: block;
    font-family: $current-lang-choice;
    font-size: 16px;
    padding: 20px 15px;
    margin: 10px 0 20px 0;
  }

  .submit-button:disabled {
    @extend .gray-button;
  }

  .submit-button:disabled:hover {
    background-color: hsl(210, 13%, 63%);
    cursor: default;
  }

  #settings-container-inputs {
    width: 80%;
    margin-left: 10%;
    margin-right: 10%;
  }

  .settings-input-label {
    text-align: right;
    font-size: 17px;
    font-weight: bold;
    margin: 5px 15px 7px 0;
    display: inline-block;
    color: $github-black-color;
  }

  .settings-input {
    position: relative;
    display: block;
    width: 100%;
    padding: .375rem .75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: $github-black-color;
    background-color: #fff;
    border: 2px solid #ced4da;
    border-radius: .25rem;
    transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
  }

  .settings-input:focus {
    border-color: $ocean-blue;
  }

  .semester-dropdown-wrapper {
    display: block;
  }

  .name-container, .year-container, .semester-container, .late-days-container {
    padding-bottom: 16px;
    display: block;
    max-width: 500px;
  }

  #input-course-semester {
    width: 120px;
  }

  .semester-item {
    font-size: 17px;
  }

  .last-saved-timestamp {
    padding-top: 6px;
    margin: 0;
    font-size: 15px;
    color: lighten(#495057, 40);
  }

  .last-saved-spinner {
    font-size: 18px;
    color: $github-black-color;
    display: inline-block;
  }

  .input-wrapper {
    position: relative;
    display: inline-block;
    margin: 0;
  }

  .dropdown-caret {
    position: absolute;
    right: 18px;
    top: 4px;
    font-size: 30px;
    cursor: pointer;
  }

  .error-ul {
    list-style-type: none; /* Remove bullets */
    padding-left: 0;
    max-width: 500px;
    width: 100%
  }

  .error-li:first-child {
    margin-top: -10px;
    border-top-left-radius: .25rem;
    border-top-right-radius: .25rem;
  }

  .error-li:last-child {
    margin-bottom: 0;
    border-bottom-right-radius: .25rem;
    border-bottom-left-radius: .25rem;
  }

  .error-ul .error-li {
    box-sizing: border-box;
    word-wrap: break-word;
    position: relative;
    padding: 10px 15px;
    margin-bottom: -1px;
    color: #721c24;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
  }

  .input.error-input {
    border: 1px solid $warning-red;
  }

  .error-input:focus {
    outline: none;
    box-shadow: 0 0 10px $warning-red;
    border: 1px solid $warning-red;
    border-radius: .25rem;
  }

  .suffix-element {
    display: inline-block;
    vertical-align: top;
    padding-top: 10px;
    padding-left: 10px;
  }

@media only screen and (min-width: 481px) {

  .submit-button, .submit-button:disabled {
    padding: 10px 15px;
    font-family: $current-lang-choice;
    font-size: 16px;
    margin: 0 15px 12px 0;
    display: inline-block;
  }

  #settings-container {
    margin: 0;
  }

  #settings-container-inputs {
    margin: 0 0 0 40px;
  }

  #input-course-name {
    width: 400px;
  }
}
</style>
