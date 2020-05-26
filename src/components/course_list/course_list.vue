<template>
  <div v-if="d_loading" class="loading-centered loading-large">
    <div> <i class="fa fa-spinner fa-pulse"></i> </div>
  </div>
  <div v-else id="course-list">
    <div v-if="d_can_create_courses" class="create-course-wrapper">
      <button type="button"
              class="flat-white-button"
              @click="d_show_create_course_modal = true"
              ref="show_create_course_modal_button">
        <i class="fas fa-plus plus"></i> New Course
      </button>

      <modal v-if="d_show_create_course_modal"
             ref="created_course_modal"
             @close="d_show_create_course_modal = false"
             :include_closing_x="!d_creating_course"
             :click_outside_to_close="!d_creating_course">
        <div class="modal-header">New Course</div>
        <course-form ref="new_course_form"
                     @submit="create_course"
                     @form_validity_changed="d_new_course_form_is_valid = $event">

          <APIErrors ref="create_course_api_errors"></APIErrors>
          <div class="modal-button-footer">
            <button type="submit"
                    ref="create_course_button"
                    class="save-button"
                    :disabled="!d_new_course_form_is_valid || d_creating_course">
              Save
            </button>
            <button type="button"
                    ref="cancel_create_course_button"
                    class="white-button"
                    @click="d_show_create_course_modal = false"
                    :disabled="d_creating_course">
              Cancel
            </button>
          </div>
        </course-form>
      </modal>
    </div>
    <div v-if="courses_by_term.length === 0"
        id="not-enrolled-message">
      <div> You are not enrolled in any courses. </div>
    </div>
    <div v-else id="all-semesters">
      <div v-for="current_term of courses_by_term"
           class="single-semester-container">
        <div class="semester-name">
          {{current_term.term.semester}} {{current_term.term.year}}
        </div>
        <div class="courses-in-semester">
          <single-course v-for="(course) of current_term.course_list"
                         :key="course.id"
                         class="course"
                         :course="course"
                         :is_admin="is_admin(course)">
          </single-course>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Inject, Vue } from 'vue-property-decorator';

import { AllCourses, Course, CourseObserver, Semester, User } from 'ag-client-typescript';

import { GlobalData } from '@/app.vue';
import APIErrors from '@/components/api_errors.vue';
import CourseForm, { CourseFormData } from '@/components/course_admin/course_form.vue';
import SingleCourse from '@/components/course_list/single_course.vue';
import Modal from '@/components/modal.vue';
import {
  handle_api_errors_async,
  handle_global_errors_async,
  make_error_handler_func,
} from '@/error_handling';
import {
  assert_not_null,
  toggle,
} from '@/utils';


interface Term {
  semester: Semester | null;
  year: number | null;
}

interface TermCourses {
  term: Term;
  course_list: Course[];
}

@Component({
  components: {
    APIErrors,
    CourseForm,
    Modal,
    SingleCourse
  }
})
export default class CourseList extends Vue implements CourseObserver {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  d_all_courses: AllCourses | null = null;
  d_can_create_courses = false;
  d_loading = true;

  d_show_create_course_modal = false;
  d_creating_course = false;
  d_new_course_form_is_valid = false;

  @handle_global_errors_async
  async created() {
    this.d_all_courses = await Course.get_courses_for_user(this.d_globals.current_user!);
    await this.d_globals.set_current_course(null);
    this.d_can_create_courses = await User.current_can_create_courses();
    Course.subscribe(this);
    this.d_loading = false;
  }

  beforeDestroy() {
    Course.unsubscribe(this);
  }

  @handle_api_errors_async(make_error_handler_func('create_course_api_errors'))
  create_course(form_data: CourseFormData) {
    return toggle(this, 'd_creating_course', async () => {
        await Course.create(form_data);
        this.d_show_create_course_modal = false;
    });
  }

  is_admin(course: Course) {
    assert_not_null(this.d_all_courses);
    return this.d_all_courses.courses_is_admin_for.find(
      item => item.pk === course.pk
    ) !== undefined;
  }

  get courses_by_term(): TermCourses[] {
    if (this.d_all_courses === null) {
      // istanbul ignore next
      return [];
    }

    let result: TermCourses[] = [];
    for (let course_list of Object.values(this.d_all_courses)) {
      for (let course of course_list) {
        let current_term: Term = {semester: course.semester, year: course.year};

        let term_courses = result.find(item => terms_equal(item.term, current_term));
        if (term_courses === undefined) {
          term_courses = {term: current_term, course_list: []};
          result.push(term_courses);
        }

        let has_course = term_courses.course_list.find(item => item.pk === course.pk) !== undefined;
        if (!has_course) {
          term_courses.course_list.push(course);
        }
      }
    }

    result.sort(term_descending);
    for (let term_courses of result) {
      term_courses.course_list.sort((course_a: Course, course_b: Course) =>
        course_a.name.localeCompare(course_b.name, undefined, {numeric: true})
      );
    }

    return result;
  }

  update_course_changed(course: Course): void { }

  update_course_created(course: Course): void {
    if (this.d_all_courses !== null) {
      this.d_all_courses.courses_is_admin_for.push(course);
    }
  }
}

function terms_equal(first: Term, second: Term) {
  return first.year === second.year && first.semester === second.semester;
}

function term_descending(term_courses_a: TermCourses, term_courses_b: TermCourses) {
  let semester_ordering = {
    [Semester.winter]: 1,
    [Semester.spring]: 2,
    [Semester.summer]: 3,
    [Semester.fall]: 4
  };

  if (term_courses_a.term.year === term_courses_b.term.year) {
    let semester_a = term_courses_a.term.semester === null
      ? 0 : semester_ordering[term_courses_a.term.semester];
    let semester_b = term_courses_b.term.semester === null
      ? 0 : semester_ordering[term_courses_b.term.semester];
    return semester_b - semester_a;
  }

  let year_a = term_courses_a.term.year === null ? 0 : term_courses_a.term.year;
  let year_b = term_courses_b.term.year === null ? 0 : term_courses_b.term.year;
  return year_b - year_a;
}

</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/loading.scss';
@import '@/styles/modal.scss';
@import '@/styles/section_header.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

#course-list {
  margin: 0 .5rem;
}

.create-course-wrapper {
  margin: .75rem 0;
}

.semester-name {
  font-size: 1.25rem;
  margin: .5rem 0;
  font-weight: bold;

  @include section-header();
}

.course {
  margin-bottom: 1rem;
  width: 100%;
  max-width: 300px;

  @media only screen and (min-width: 700px) {
    display: inline-block;
    margin-right: 20px;
  }
}

#not-enrolled-message {
  padding: 1rem 0;
}

</style>
