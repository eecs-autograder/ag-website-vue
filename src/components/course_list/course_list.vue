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
          <p class="semester-name">{{current_term.term.semester}} {{current_term.term.year}}</p>
          <div class="courses-in-semester">
            <div v-for="(course, course_index) of current_term.course_list">
              <div :class="['course',
                   {'last-course-in-semester':
                   course_index === current_term.course_list.length - 1}]">
                <p class="course-name">{{course.name}}</p>
                <p class="course-semester-year">{{course.semester}} {{course.year}}</p>
                <router-link tag="div"
                             :to="`/web/course_admin/${course.pk}`"
                             v-if="is_admin(course)"
                             class="edit-admin-settings">
                  <a>
                    <p class="edit-settings-label"> Edit Settings
                      <i class="fas fa-cog cog"></i>
                    </p>
                  </a>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

  import { AllCourses, Model } from '../../model';
  import { Course, Semester, User } from 'ag-client-typescript';

  import { ObserverComponent } from '../../observer_component';
  import { array_add_unique, array_get_unique, array_has_unique } from '../../utils';

  import { Component, Vue } from 'vue-property-decorator';

  interface Term {
    semester: Semester | null;
    year: number | null;
  }

  interface TermCourses {
    term: Term;
    course_list: Course[];
  }

  @Component
  export default class CourseList extends ObserverComponent {

    all_courses: AllCourses | null = null;
    courses_by_term: TermCourses[] = [];

    beforeDestroy() {
      super.beforeDestroy();
    }

    async created() {
      super.created();
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

    is_admin(course: Course) {
      return array_has_unique(this.all_courses!.courses_is_admin_for,
                              course,
                              (course_a: Course, course_b: Course) => {
          return course_a.name === course_b.name
                 && course_a.semester === course_b.semester
                 && course_a.year === course_b.year;
      });
    }

    sort_into_terms(courses: Course[]) {
      for (let course of courses) {
        let current_term: Term = { semester: course.semester, year: course.year };
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
@import '@/styles/colors.scss';

#all-semesters {
  margin-top: 40px;
}

#course-list {
  margin-left: 5%;
  margin-right: 5%;
  width: 90%;
}

a {
  text-decoration: none;
  color: black;
}

#not-enrolled-message {
  padding: 20px;
  text-align: center;
}

.single-semester-container {
  vertical-align: top;
}

.semester-name {
  color: black;
  font-size: 24px;
  margin: 15px 15px 25px 15px;
  min-height: 35px;
  text-align: center;
}

.courses-in-semester {
  margin: 0;
}

.edit-settings-label {
  font-size: 16px;
  margin: 0;
}

.cog {
  margin-left: 5px;
  transform: rotate(0deg);
  transition-duration: 1s;
}

.edit-admin-settings {
  background-color: lighten(lavender, 2);
  border-radius: 4px;
  border: 1.5px solid darken(lavender, 11);
  bottom: 15px;
  padding: 5px 10px;
  position: absolute;
  right: 15px;
  transition: box-shadow 1s;
}

.edit-admin-settings:hover {
  background-color: white;
  border: 1.5px solid darken(lavender, 5);
}

.edit-admin-settings:hover .cog  {
  transform: rotate(365deg);
  transition-duration: 1s;
}

.course {
  background-color: darken(lavender, 8);
  border-radius: 2px;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.1);
  color: black;
  cursor: pointer;
  font-size: 23px;
  margin: 0 0 15px 0;
  min-height: 75px;
  padding: 15px;
  position: relative;
  transition: box-shadow 1s;
}

.course:hover {
  background-color: darken(lavender, 11);
  box-shadow: 0 5px 9px 0 rgba(0,0,0,0.2);
}

.last-course-in-semester {
  margin-bottom: 50px;
}

.course-name {
  font-size: 26px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
}

.course-semester-year {
  color: black;
  font-size: 16px;
  margin: 0;
  min-height: 25px;
  padding-bottom: 15px;
  position: relative;
}

//*****************************************************************************

@media only screen and (min-width: 481px) {
  #course-list {
    margin-left: 10%;
    margin-right: 10%;
    width: 80%;
  }
}

@media only screen and (min-width: 768px) {
  #course-list {
    margin-left: 10%;
    margin-right: 10%;
    width: 80%;
  }

  .single-semester-container {
    display: inline-block;
    margin: 3%;
    width: 44%;
  }
}

@media only screen and (min-width: 1025px) {
  #course-list {
    margin-left: 10%;
    margin-right: 10%;
    width: 80%;
  }

  .single-semester-container {
    display: inline-block;
    margin: 2.5%;
    width: 45%;
  }
}

@media only screen and (min-width: 1281px) {
  #course-list {
    margin-left: 10%;
    margin-right: 10%;
    width: 80%;
  }

  .single-semester-container {
    display: inline-block;
    margin: 2%;
    width: 29%;
  }
}

</style>
