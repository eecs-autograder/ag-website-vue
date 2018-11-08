<template>
  <div ref="course_list" id="course-list">
    <div v-if="courses_by_term.length === 0"
         id="not-enrolled-panel">
      <p> You are not enrolled in any courses. </p>
    </div>
    <div v-else id="all-semesters">
      <div v-for="(current_term, term_index) of courses_by_term"
           class="single-semester-container">
        <p class="semester-name"> {{current_term.term.semester}} {{current_term.term.year}}</p>
        <div class="courses-in-semester">
          <div v-for="(course, course_index) of current_term.course_list">
            <div :class="['course',
                  {'course-last-child': course_index === current_term.course_list.length - 1},
                   {'inactive-course': term_index != 0}]"
                 @click="course_clicked(course)">
              <p class="course-name"> {{course.name}} </p>
              <p class="semester-year"> {{course.semester}} {{course.year}} </p>
              <div v-if="array_has_unique(admin_courses, course_in, courses_are_equal)"
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
</template>

<script lang="ts">

  import { AllCourses, Model } from '@/model';
  import { Course, HttpClient, Semester, User } from 'ag-client-typescript';

  // import { ObserverComponent } from '@/observer_component';
  import { array_add_unique, array_get_unique, UniqueArrayError } from '@/utils';

  import { Component, Vue } from 'vue-property-decorator';

  import { array_has_unique } from '@/utils';

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
    // most_recent_term: Term;

    async created() {
      let user = await User.get_current();
      this.all_courses = await Model.get_instance().get_courses_for_user(user);
      console.log('qweaskjdflkasjdf')
      for (let value of Object.entries(this.all_courses)) {
        this.sort_into_terms(value);
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

    course_name_less_than(course_a: Course, course_b: Course) {
      if (course_a.name >= course_b.name) {
        return 1;
      }
      return -1;
    }

    sort_into_terms(courses: Course[]) {
      for (let course of courses) {
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
      return semester_a - semester_b;
    }

    let year_a = term_courses_a.term.year === null ? 0 : term_courses_a.term.year;
    let year_b = term_courses_b.term.year === null ? 0 : term_courses_b.term.year;
    return year_a - year_b;
  }

</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto+Condensed');
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/colors.scss';

.cog {
  margin-left: 5px;
}

#course-list {
  font-family: "Poppins";
}

#not-enrolled-panel {
  padding: 20px;
  text-align: center;
}

#course-announcement {
  font-size: 40px;
  text-align: center;
  padding: 20px;
  margin: 0 0 20px 0;
  background-color: black;
  color: white;
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.1);
}

#all-semesters {
  width: 100%;
}

.single-semester-container {
  width: 80%;
  margin-left: 10%;
  margin-right: 10%;
  display: inline-block;
  vertical-align: top;
  min-width: 150px;
}

.semester-name {
  text-align: center;
  font-size: 24px;
  margin: 15px;
  color: lighten(black, 22);
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
  padding: 5px;
  padding: 5px 10px;
  border-radius: 6px;
}

.edit-admin-settings:hover {
  background-color: black;
  color: white;
}

.edit-admin-settings:hover .cog  {
  transition-duration: 1s;
  transform: rotate(365deg);
}

.course {
  color: black;
  min-width: 300px;
  margin: 0 0 15px 0;
  padding: 20px 15px;
  font-size: 23px;
  background-color: darken(lavender, 8);
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.1);
}

.course:hover {
  background-color: darken(lavender, 11);
}

.inactive-course {
  background-color: $pebble-dark;
}

.inactive-course:hover {
  background-color: darken($pebble-dark, 10);
}

.course-last-child {
  margin-bottom: 100px;
}

.course-name {
  margin: 0;
  font-weight: 600;
}


.semester-year {
  color: black;
  margin: 0;
  font-size: 16px;
}

//*****************************************************************************
// Now
@media only screen and (min-width: 481px) {

  #course-announcement {
    font-size: 40px;
    font-weight: 900;
    text-align: left;
    margin: 0 0 50px 0;
    padding: 25px 35px;
  }

  #all-semesters {
    width: 100%;
  }
}

@media only screen and (min-width: 768px) {

  #all-semesters {
    width: 100%;
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
  #all-semesters {
    width: 100%;
    /*border: 2px solid black;*/
  }

  .single-semester-container {
    width: 28%;
    margin: 2.5%;
    display: inline-block;
    vertical-align: top;
  }
}


@media only screen and (min-width: 1281px) {
  #all-semesters {
    width: 100%;
    /*border: 2px solid yellow;*/
  }

  .single-semester-container {
    width: 29%;
    margin: 2%;
    display: inline-block;
    vertical-align: top;
    min-width: 150px;
    /*border: 2px solid red;*/
  }
}

</style>
