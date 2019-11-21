<template>
  <div ref="single-course-component" class="single-course-component">
    <div class="course">
      <router-link :to="`/web/course/${course.pk}`"
                   class="course-info">
        <div class="course-name">{{course.name}} </div>
        <div class="course-subtitle">{{course.subtitle}}</div>
      </router-link>

      <div class="toolbox">
        <div class="clone-course"
             @click="d_show_clone_course_modal = true"
             :title="'Clone ' + course.name"
             v-if="is_admin">
          <div class="clone-course-label">
            <i class="fas fa-copy copier"> </i>
          </div>
        </div>
        <router-link
                     :to="`/web/course_admin/${course.pk}`"
                     style="display: inline-block"
                     :title="'Edit ' + course.name"
                     v-if="is_admin">
          <div class="edit-course-settings">
            <div class="edit-settings-label">
              <i class="fas fa-cog cog"></i>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <modal v-if="d_show_clone_course_modal"
           @close="d_show_clone_course_modal = false"
           ref="clone_course_modal"
           click_outside_to_close
           size="large">
      <span class="modal-container">
        <p class="modal-header"> Cloning course:
          <span class="course-to-copy">{{format_course_name(course)}}</span>
        </p>
        <hr>
        <div id="clone-course-modal">
          <ValidatedForm ref="clone_course_form"
                         id="clone-course-form"
                         autocomplete="off"
                         @submit="make_copy_of_course">

            <div class="name-container">
              <label class="text-label"> Course name: </label>
              <ValidatedInput ref="copy_of_course_name"
                              v-model="new_course_name"
                              input_style="width: 100%; max-width: 500px;"
                              :validators="[is_not_empty]"
                              :num_rows="1"
                              @input_validity_changed="clone_course_form_is_valid = $event">
              </ValidatedInput>
            </div>

            <div class="semester-container">
              <label class="text-label"> Semester: </label>
              <div class="dropdown">
                <select id="semester"
                        v-model="new_course_semester"
                        class="select">
                  <option v-for="semester of semesters" :value="semester">{{semester}}</option>
                </select>
              </div>
            </div>

            <div class="year-container">
              <label class="text-label"> Year: </label>
              <ValidatedInput ref="copy_of_course_year"
                              v-model="new_course_year"
                              :num_rows="1"
                              input_style="width: 65px;"
                              :validators="[is_not_empty, is_number, is_valid_course_year]"
                              @input_validity_changed="clone_course_form_is_valid = $event">
              </ValidatedInput>
            </div>

            <APIErrors ref="api_errors"></APIErrors>

            <button type="submit"
                   class="create-clone-button"
                   :disabled="!clone_course_form_is_valid || clone_course_pending">
              Clone Course
            </button>
          </ValidatedForm>
        </div>
      </span>
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Course, Semester } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { format_course_name, handle_api_errors_async } from '@/utils';
import { is_not_empty, is_number, make_min_value_validator } from '@/validators';

@Component({
  components: {
    APIErrors,
    Modal,
    ValidatedForm,
    ValidatedInput
  }
})
export default class SingleCourse extends Vue {

  @Prop({required: true, type: Course})
  course!: Course;

  @Prop({default: false, type: Boolean})
  is_admin!: boolean;

  new_course_name = "";
  new_course_semester: Semester = Semester.fall;
  new_course_year: number = 2000;

  semesters = [Semester.fall, Semester.winter, Semester.spring, Semester.summer];
  clone_course_form_is_valid = false;

  clone_course_pending = false;
  d_show_clone_course_modal = false;

  readonly is_not_empty = is_not_empty;
  readonly is_number = is_number;
  readonly is_valid_course_year = make_min_value_validator(2000);
  readonly format_course_name = format_course_name;

  created() {
    this.new_course_name = this.course.name;
    if (this.course.semester !== null) {
      this.new_course_semester = this.course.semester;
    }
    let current_year = (new Date()).getFullYear();
    this.new_course_year = this.course.year !== null ? this.course.year : current_year;
  }

  @handle_api_errors_async(handle_add_copied_course_error)
  async make_copy_of_course() {
    try {
      this.clone_course_pending = true;
      await this.course.copy(
        this.new_course_name, this.new_course_semester, this.new_course_year
      );
      this.d_show_clone_course_modal = false;
    }
    finally {
      this.clone_course_pending = false;
    }
  }
}

function handle_add_copied_course_error(component: SingleCourse, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';

.toolbox {
  background-color: hsl(212, 60%, 94%);
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  border-top: none;
  box-sizing: border-box;
  padding: 1px 10px;
  min-height: 37px;
  text-align: right;
}

a {
  text-decoration: none;
  color: inherit;
}

.edit-settings-label, .clone-course-label {
  font-size: 16px;
  margin: 0;
}

.cog {
  font-size: 18px;
}

.copier {
  font-size: 18px;
}

.edit-course-settings, .clone-course {
  color: $dark-blue;
  cursor: pointer;
  display: inline-block;
  padding: 8px 10px;
}

.clone-course {
  margin-right: 5px;
}

.edit-course-settings:hover .cog  {
  color: mediumvioletred;
}

.clone-course:hover .copier {
  color: mediumvioletred;
}

.course {
  box-sizing: border-box;
  font-size: 23px;
  margin-bottom: 1rem;
  min-height: 75px;
  position: relative;
}

.course-info {
  display: block;
  padding: 15px;
  background-image: linear-gradient(to bottom right, $gray-blue-1, $gray-blue-2);
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  border-bottom: none;
}

.course-name {
  color: $dark-blue;
  font-size: 26px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
}

.course-subtitle {
  color: $dark-blue;
  font-size: 14px;
  margin: 0;
  min-height: 21px;
  padding-top: 2px;
}

/**** Modal *******************************************************************/

.modal-header {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  padding: 5px 0;
}

.name-container, .year-container,
.semester-container {
  display: block;
  max-width: 500px;
  padding-bottom: 16px;
}

.name-container {
  padding-top: 10px;
}

#all-semesters {
  margin-top: 40px;
}

.semester-dropdown-header {
  height: 39px;
  width: 140px;
}

.course-to-copy {
  color: $ocean-blue;
  letter-spacing: 1px;
  margin-left: 5px;
}

.create-clone-button {
  @extend .green-button;
}

.create-clone-button {
  margin: 12px 0 10px 0;
}

@media only screen and (min-width: 681px) {
  .single-course-component {
    display: inline-block;
    vertical-align: top;
    width: 50%;
  }
}

@media only screen and (min-width: 1081px) {
  .single-course-component {
    display: inline-block;
    min-width: 400px;
    max-width: 450px;
    width: 40%;
  }
}

</style>
