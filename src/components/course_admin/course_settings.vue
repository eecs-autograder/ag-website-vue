<template>
  <div>
    <course-form :course="course"
                 @form_validity_changed="d_settings_form_is_valid = $event"
                 @submit="save_course_settings"
                 ref="course_form">
      <div class="api-errors-container">
        <APIErrors ref="api_errors"></APIErrors>
      </div>

      <div class="button-footer">
        <button id="save-button"
                class="save-button"
                type="submit"
                :disabled="!d_settings_form_is_valid || d_saving">Save</button>

        <div class="last-saved-timestamp">
          <template v-if="!d_saving">
            Last saved: {{format_datetime_short(course.last_modified)}}
          </template>
          <i v-else class="loading fa fa-spinner fa-pulse"></i>
        </div>
      </div>
    </course-form>

    <div class="danger-zone-container">
      <div class="danger-text">
        Delete Course: {{course.name}} {{course.semester}} {{course.year}}
      </div>
      <button data-testid="show_delete_course_modal_button" class="delete-button"
              type="button"
              @click="d_show_delete_course_modal = true">
        Delete
      </button>

      <modal v-if="d_show_delete_course_modal"
             @close="d_show_delete_course_modal = false"
             ref="delete_course_modal"
             size="large"
             :click_outside_to_close="!d_deleting"
             :show_closing_x="!d_deleting">
        <div class="modal-header">
          Confirm Delete
        </div>
        <div class="modal-body">
          Are you sure you want to pseudo-delete the course
          <span class="item-to-delete">{{course.name}} {{course.semester}} {{course.year}}</span>?
          <br><br>
          All associated projects will become inaccessible.<br>
          This action can be undone occasionally if you ask your system administrator nicely. :)
          <APIErrors ref="delete_errors"></APIErrors>
          <div class="modal-button-footer">
            <button data-testid="delete_course_button"
                    class="red-button"
                    :disabled="d_deleting"
                    @click="delete_course"> Delete </button>

            <button class="modal-cancel-button white-button"
                    @click="d_show_delete_course_modal = false">
              Cancel
            </button>
          </div>
        </div>
      </modal>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Course, Semester } from 'ag-client-typescript';

import APIErrors from "@/components/api_errors.vue";
import Modal from '@/components/modal.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { handle_api_errors_async, make_error_handler_func } from '@/error_handling';
import {
  deep_copy,
  format_datetime_short,
  safe_assign,
  toggle
} from '@/utils';
import {
  is_integer,
  is_non_negative,
  is_not_empty,
  is_number,
  make_min_value_validator,
  string_to_num
} from '@/validators';

import CourseForm, { CourseFormData } from './course_form.vue';

@Component({
  components: {
    APIErrors,
    CourseForm,
    Modal,
    Tooltip,
    ValidatedForm,
    ValidatedInput
  }
})
export default class CourseSettings extends Vue {
  @Prop({required: true, type: Course})
  course!: Course;

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

  d_saving = false;
  readonly semesters = [Semester.fall, Semester.winter, Semester.spring, Semester.summer];
  d_settings_form_is_valid = true;

  d_show_delete_course_modal = false;
  d_deleting = false;

  readonly Semester = Semester;

  readonly is_non_negative = is_non_negative;
  readonly is_not_empty = is_not_empty;
  readonly is_integer = is_integer;
  readonly is_number = is_number;
  readonly is_valid_course_year = make_min_value_validator(2000);
  readonly string_to_num = string_to_num;

  readonly format_datetime_short = format_datetime_short;

  created() {
    this.d_course = deep_copy(this.course, Course);
  }

  @handle_api_errors_async(make_error_handler_func())
  save_course_settings(form_data: CourseFormData) {
    return toggle(this, 'd_saving', () => {
      safe_assign(this.d_course, form_data);
      return this.d_course.save();
    });
  }

  @handle_api_errors_async(make_error_handler_func('delete_errors'))
  delete_course() {
    return toggle(this, 'd_deleting', async () => {
      await this.course.delete();
      this.$router.push({name: 'course_list'});
    });
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';
@import '@/styles/loading.scss';
@import '@/styles/modal.scss';

.suffix-element {
  padding-left: .625rem;
}

.api-errors-container {
  max-width: 500px;
}
</style>
