<template>
  <div ref="course_list_component">
    <div id="course-list">

      <div v-if="courses_by_term.length === 0"
           id="not-enrolled-message">
        <p> You are not enrolled in any courses. </p>
      </div>

      <div v-else id="all-semesters">
        <div v-for="current_term of courses_by_term"
             class="single-semester-container">
          <p class="semester-name"> {{current_term.term.semester}} {{current_term.term.year}} </p>
          <div class="courses-in-semester">
            <span v-for="(course, index) of current_term.course_list"
                 :key="course.id">
              <single-course :course="course"
                              :is_admin="index % 2 == 0">
                                <!--:is_admin="is_admin(course)"-->
              </single-course>
            </span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">

  import SingleCourse from '@/components/course_list/single_course.vue';

  import { AllCourses, Model } from '@/model';
  import { Course, CourseObserver, Semester, User } from 'ag-client-typescript';

  import {
    array_add_unique,
    array_get_unique,
    array_has_unique,
  } from '@/utils';

  import { Component, Vue } from 'vue-property-decorator';

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

    all_courses: AllCourses | null = null;
    courses_by_term: TermCourses[] = [];

    beforeDestroy() {
      Course.unsubscribe(this);
    }

    async created() {
      Course.subscribe(this);
      await this.get_and_sort_courses();
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
      let user = await User.get_current();
      this.all_courses = await Model.get_instance().get_courses_for_user(user);
      for (let [role, courses] of Object.entries(this.all_courses)) {
        this.sort_into_terms(courses);
      }
      this.courses_by_term.sort(term_descending);
      for (let term_courses of this.courses_by_term) {
        term_courses.course_list.sort((course_a: Course, course_b: Course) => {
          return (course_a.name >= course_b.name) ? 1 : -1;
        });
      }
    }

    update_course_changed(course: Course): void { }

    update_course_created(course: Course): void {
      this.all_courses!.courses_is_admin_for.push(course);
      this.sort_into_terms([course]);
      this.courses_by_term.sort(term_descending);
      let index = this.courses_by_term.findIndex((term) => term.term.semester === course.semester
                                                           && term.term.year === course.year);
      this.courses_by_term[index].course_list.sort((course_a: Course, course_b: Course) => {
        return (course_a.name >= course_b.name) ? 1 : -1;
      });
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
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/course_admin.scss';

$current-lang-choice: "Poppins";

#course-list {
  font-family: $current-lang-choice;
  margin-left: 5%;
  margin-right: 5%;
  width: 90%;
}

.single-semester-container {
  display: block;
}

.semester-name {
  font-size: 24px;
  margin: 15px 15px 15px 15px;
  text-align: left;
  min-height: 35px;
  font-weight: 600;
}

#not-enrolled-message {
  padding: 20px;
  text-align: center;
}

.courses-in-semester {
  margin: 0;
}

#all-semesters {
  margin-top: 40px;
}

@media only screen and (min-width: 481px) {
  #course-list {
    margin: 0 5%;
    width: 90%;
  }
}

</style>
