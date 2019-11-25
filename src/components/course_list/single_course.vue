<template>
  <div ref="single-course-component" class="single-course-component">
    <div class="entity">
      <router-link :to="`/web/course/${course.pk}`"
                   class="info course-info"
                   :class="{'round-bottom-corners': !is_admin}">
        <div class="course-name name">{{course.name}} </div>
        <div class="course-subtitle">{{course.subtitle}}</div>
      </router-link>

      <div class="toolbox" v-if="is_admin">
        <div class="clone-course tool-icon"
             @click="d_show_clone_course_modal = true"
             :title="'Clone ' + course.name">
          <i class="fas fa-copy"> </i>
        </div>
        <router-link :to="`/web/course_admin/${course.pk}`"
                     :title="'Edit ' + course.name">
          <div class="edit-course-settings tool-icon">
            <i class="fas fa-cog"></i>
          </div>
        </router-link>
      </div>
    </div>

    <modal v-if="d_show_clone_course_modal"
           @close="d_show_clone_course_modal = false"
           ref="clone_course_modal"
           click_outside_to_close
           size="large">
      <div class="modal-header">
        Clone <span class="course-to-copy">"{{format_course_name(course)}}"</span>
      </div>
      <ValidatedForm ref="clone_course_form" autocomplete="off" @submit="make_copy_of_course">
        <div class="cloned-course-name form-field-wrapper">
          <label class="text-label"> Name </label>
          <ValidatedInput ref="copy_of_course_name"
                          v-model="new_course_name"
                          input_style="width: 100%; max-width: 500px;"
                          :validators="[is_not_empty]"
                          :num_rows="1"
                          @input_validity_changed="clone_course_form_is_valid = $event">
          </ValidatedInput>
        </div>

        <div class="form-field-wrapper">
          <label class="text-label"> Semester </label>
          <div class="dropdown">
            <select id="semester"
                    v-model="new_course_semester"
                    class="select">
              <option v-for="semester of semesters" :value="semester">{{semester}}</option>
            </select>
          </div>
        </div>

        <div class="form-field-wrapper">
          <label class="text-label"> Year </label>
          <ValidatedInput ref="copy_of_course_year"
                          v-model="new_course_year"
                          :num_rows="1"
                          input_style="width: 65px;"
                          :validators="[is_not_empty, is_number, is_valid_course_year]"
                          @input_validity_changed="clone_course_form_is_valid = $event">
          </ValidatedInput>
        </div>

        <APIErrors ref="api_errors"></APIErrors>

        <div class="button-footer modal-button-footer">
          <button type="submit"
                  class="create-clone-button"
                  :disabled="!clone_course_form_is_valid || clone_course_pending">
            Clone Course
          </button>
        </div>
      </ValidatedForm>
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
@import '@/styles/components/entity_with_toolbox.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';
@import '@/styles/modal.scss';

* {
  box-sizing: border-box;
}

.course-subtitle {
  color: darken($stormy-gray-dark, 15%);

  font-size: 1rem;
  padding-top: .25rem;
  min-height: 1.25rem;

  line-height: 1;
}

/**** Modal *******************************************************************/

.course-to-copy {
  color: $ocean-blue;
  margin-left: .125rem;
}

.cloned-course-name {
  margin-top: .5rem;
}

.create-clone-button {
  @extend .green-button;
}

</style>
