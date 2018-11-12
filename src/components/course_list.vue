<template>
  <div ref="course_list">
    <h1 id="course-announcement"> Courses </h1>
    <div id="course-list">
      <div v-if="courses_by_term.length === 0"
           id="not-enrolled-panel">
        <p> You are not enrolled in any courses. </p>
      </div>
      <div v-else id="all-semesters">
        <div v-for="(current_term, term_index) of courses_by_term"
             class="single-semester-container">
          <p class="semester-name">
            {{current_term.term.semester}}
            {{current_term.term.year}}</p>
          <div class="courses-in-semester">
            <div v-for="(course, course_index) of current_term.course_list">
              <div :class="['course',
                    {'course-last-child': course_index === current_term.course_list.length - 1},
                     {'inactive-course': term_index != 0}]"
                   @click="course_clicked(course)">
                <p class="course-name"> {{course.name}} </p>
                <p class="semester-year"> {{course.semester}} {{course.year}} </p>
                <div v-if="is_admin(course)"
                     class="edit-admin-settings"
                     @click="$event.stopPropagation(); edit_admin_settings(course)">
                  <p class="edit-settings-label"> Edit Settings
                    <i class="fas fa-cog cog"></i>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

  import { AllCourses, Model } from '@/model';
  import { Course, HttpClient, Semester, User } from 'ag-client-typescript';

  // import { ObserverComponent } from '@/observer_component';
  import { array_add_unique, array_get_unique, array_has_unique, UniqueArrayError } from '@/utils';

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
  export default class CourseList extends Vue {

    all_courses: AllCourses | null = null;
    courses_by_term: TermCourses[] = [];

    async created() {
      let user = await User.get_current();
      this.all_courses = await Model.get_instance().get_courses_for_user(user);
      for (let [role, courses] of Object.entries(this.all_courses)) {
        this.sort_into_terms(courses);
      }
      this.courses_by_term.sort(term_descending);
      this.sort_the_courses_in_each_term();
    }

    course_clicked(selected_course: Course) {
      console.log("A course was clicked on!");
    }

    edit_admin_settings(course: Course) {
      console.log("Editing Admin Settings");
    }

    is_admin(course: Course) {
      return array_has_unique(this.all_courses.courses_is_admin_for, course,
        (course_a: Course, course_b: Course) => {
          return course_a.name === course_b.name
                 && course_a.semester === course_b.semester
                 && course_a.year === course_b.year;
      });
    }

    sort_into_terms(courses: Course[]) {
      for (let course of courses) {
        console.log("Semester: " + course.semester);
        console.log("Year: " + course.year);
        let current_term: Term = { semester: course.semester, year: course.year };
        let term_exists = array_has_unique(
          this.courses_by_term, current_term,
          (item: TermCourses, term: Term) => { return terms_equal(item.term, term); }
        );
        if (term_exists) {
          let term_courses: TermCourses = array_get_unique(
            this.courses_by_term, current_term,
            (item: TermCourses, term: Term) => { return terms_equal(item.term, term); }
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

    sort_the_courses_in_each_term() {
      for (let i = 0; i < this.courses_by_term.length; ++i) {
        this.courses_by_term[i].course_list.sort((course_a: Course, course_b: Course) => {
           if (course_a.name >= course_b.name) {
             return 1;
           }
           return -1;
        });
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
@import url('https://fonts.googleapis.com/css?family=Roboto+Condensed');
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/colors.scss';

.cog {
  margin-left: 5px;
}

#all-semesters {
  margin-top: 40px;
}

#course-list {
  font-family: "Poppins";
  width: 90%;
  margin-left: 5%;
  margin-right: 5%;
  border-radius: 10px;
}

#not-enrolled-panel {
  padding: 20px;
  text-align: center;
}

#course-announcement {
  font-family: "Poppins";
  font-size: 50px;
  text-align: center;
  padding: 20px;
  margin: 0 0 20px 0;
  background-color: black;
  color: white;
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.1);
}

.single-semester-container {
  vertical-align: top;
  min-width: 320px;
}

.semester-name {
  text-align: center;
  font-size: 24px;
  margin: 15px 15px 25px 15px;
  color: lighten(black, 0);
  min-height: 35px;
}

.courses-in-semester {
  margin: 0;
}

.edit-settings-label {
  margin: 0;
  font-size: 16px;
}

.edit-admin-settings {
  background-color: white;
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.15);
  position: absolute;
  right: 15px;
  bottom: 15px;
  padding: 5px 10px;
  border-radius: 6px;
  transition: box-shadow 1s;
}

.edit-admin-settings:hover {
  background-color: black;
  color: white;
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.3);
}

.edit-admin-settings .cog {
  transition-duration: 1s;
  transform: rotate(0deg);
}

.edit-admin-settings:hover .cog  {
  transition-duration: 1s;
  transform: rotate(365deg);
}

.course {
  color: black;
  /*min-height: 95px;*/
  margin: 0 0 15px 0;
  padding: 15px;
  font-size: 23px;
  background-color: darken(lavender, 8);
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.15);
  transition: box-shadow 1s;
}

.course:hover {
  background-color: darken(lavender, 11);
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.3);
}

.inactive-course {
  background-color: darken(lavender, 8);
}

.inactive-course:hover {
  background-color: darken(lavender, 11);
}

.course-last-child {
  margin-bottom: 50px;
}

.course-name {
  margin: 0;
  padding-bottom: 0px;
  font-weight: 600;
  font-size: 26px;
  line-height: 1.2;
}

.semester-year {
  color: black;
  margin: 0;
  padding-bottom: 15px;
  min-height: 25px;
  font-size: 16px;
  position: relative;
}

//*****************************************************************************

@media only screen and (min-width: 481px) {

  #course-list {
    width: 80%;
    margin-left: 10%;
    margin-right: 10%;
  }

  #course-announcement {
    font-size: 40px;
    font-weight: 900;
    text-align: left;
    margin: 0 0 50px 0;
    padding: 25px 35px;
  }

}

@media only screen and (min-width: 768px) {

  #course-list {
    width: 80%;
    margin-left: 10%;
    margin-right: 10%;
  }

  .single-semester-container {
    width: 44%;
    margin: 3%;
    display: inline-block;
    vertical-align: top;
    min-width: 150px;
  }
}

@media only screen and (min-width: 1025px) {

  #course-list {
    width: 80%;
    margin-left: 10%;
    margin-right: 10%;
  }

  .single-semester-container {
    width: 45%;
    margin: 2.5%;
    display: inline-block;
    vertical-align: top;
  }
}

@media only screen and (min-width: 1281px) {

  #course-list {
    width: 80%;
    margin-left: 10%;
    margin-right: 10%;
  }

  .single-semester-container {
    width: 29%;
    margin: 2%;
    display: inline-block;
    vertical-align: top;
    min-width: 150px;
  }
}

</style>
