<template>
  <div v-if="loading" class="loading-large">
    <div> <i class="fa fa-spinner fa-pulse"></i> </div>
  </div>
  <div v-else id="course-list">
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
import SingleCourse from '@/components/course_list/single_course.vue';
import {
  array_add_unique,
  array_get_unique,
  array_has_unique,
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
    SingleCourse
  }
})
export default class CourseList extends Vue implements CourseObserver {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  all_courses: AllCourses | null = null;
  courses_by_term: TermCourses[] = [];
  loading = true;


  async created() {
    Course.subscribe(this);
    await this.get_and_sort_courses();
    await this.d_globals.set_current_course(null);
    this.loading = false;
  }

  beforeDestroy() {
    Course.unsubscribe(this);
  }

  is_admin(course: Course) {
    return array_has_unique(
      this.all_courses!.courses_is_admin_for,
      course,
      (course_a: Course, course_b: Course) => {
        return course_a.name === course_b.name
               && course_a.semester === course_b.semester
               && course_a.year === course_b.year;
      }
    );
  }

  sort_into_terms(courses: Course[]) {
    for (let course of courses) {
      let current_term: Term = {semester: course.semester, year: course.year};
      let term_exists = array_has_unique(
        this.courses_by_term, current_term,
        (item: TermCourses, term: Term) => terms_equal(item.term, term)
      );
      if (term_exists) {
        let term_courses: TermCourses = array_get_unique(
          this.courses_by_term, current_term,
          (item: TermCourses, term: Term) => terms_equal(item.term, term)
        );
        term_courses.course_list.push(course);
      }
      else {
        array_add_unique(
          this.courses_by_term,
          {term: current_term, course_list: [course]},
          (first: TermCourses, second: TermCourses) => {
            return terms_equal(first.term, second.term);
          }
        );
      }
    }
  }

  async get_and_sort_courses() {
    this.all_courses = await Course.get_courses_for_user(this.d_globals.current_user);
    for (let [role, courses] of Object.entries(this.all_courses)) {
      this.sort_into_terms(courses);
    }
    this.courses_by_term.sort(term_descending);
    for (let term_courses of this.courses_by_term) {
      term_courses.course_list.sort((course_a: Course, course_b: Course) =>
        course_a.name.localeCompare(course_b.name, undefined, {numeric: true})
      );
    }
  }

  update_course_changed(course: Course): void { }

  update_course_created(course: Course): void {
    this.all_courses!.courses_is_admin_for.push(course);
    this.sort_into_terms([course]);
    this.courses_by_term.sort(term_descending);
    let index = this.courses_by_term.findIndex((term) => term.term.semester === course.semester
                                                         && term.term.year === course.year);
    this.courses_by_term[index].course_list.sort((course_a: Course, course_b: Course) =>
      course_a.name.localeCompare(course_b.name, undefined, {numeric: true})
    );
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
@import '@/styles/loading.scss';
@import '@/styles/section_header.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

#course-list {
  margin: 0 .5rem;
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
