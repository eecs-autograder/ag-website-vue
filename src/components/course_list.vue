import {Semester} from "ag-client-typescript";
import {Semester} from "ag-client-typescript";
<template>
  <div ref="course_list" id="course-list">
    <p id="course-announcement"> Courses </p>

    <div id="all-semesters">
      <div class="single-semester-container">
        <p class="semester-name"> Fall 2018 </p>
        <div class="courses-in-semester">
          <div v-for="course of courses">
            <div class="course">
              <p class="course-name"> {{course.name}} </p>
              <p class="semester-year"> {{course.semester}} {{course.year}} </p>
              <div class="edit-admin-settings">
                <p class="edit-settings-label"> Edit Settings
                  <i class="fas fa-cog cog"></i>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="no_files"
         id="not-enrolled-panel">
      <p> You are not enrolled in any courses. </p>
    </div>
  </div>
</template>

<script lang="ts">

  import { Course, Semester } from 'ag-client-typescript';
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

    courses_by_term: TermCourses[];

    first_course = new Course(
      {pk: 42, name: 'EECS 183', semester: Semester.winter, year: 2014, subtitle: '',
        num_late_days: 0, last_modified: ''});

    second_course = new Course(
      {pk: 42, name: 'EECS 183', semester: Semester.fall, year: 2015, subtitle: '',
        num_late_days: 0, last_modified: ''});

    third_course = new Course(
      {pk: 42, name: 'EECS 280', semester: Semester.winter, year: 2016, subtitle: '',
        num_late_days: 0, last_modified: ''});

    fourth_course = new Course(
      {pk: 42, name: 'EECS 281', semester: Semester.spring, year: 2016, subtitle: '',
        num_late_days: 0, last_modified: ''});

    fifth_course = new Course(
      {pk: 42, name: 'EECS 485', semester: Semester.fall, year: 2016, subtitle: '',
        num_late_days: 0, last_modified: ''});

    sixth_course = new Course(
      {pk: 42, name: 'EECS 370', semester: Semester.fall, year: 2016, subtitle: '',
        num_late_days: 0, last_modified: ''});

    seventh_course = new Course(
      {pk: 42, name: 'EECS 280', semester: Semester.winter, year: 2017, subtitle: '',
        num_late_days: 0, last_modified: ''});

    eighth_course = new Course(
      {pk: 42, name: 'EECS 484', semester: Semester.fall, year: 2017, subtitle: '',
        num_late_days: 0, last_modified: ''});

    ninth_course = new Course(
      {pk: 42, name: 'EECS 388', semester: Semester.fall, year: 2017, subtitle: '',
        num_late_days: 0, last_modified: ''});

    tenth_course = new Course(
      {pk: 42, name: 'EECS 280', semester: Semester.fall, year: 2017, subtitle: '',
        num_late_days: 0, last_modified: ''});

    eleventh_course = new Course(
      {pk: 42, name: 'EECS 280', semester: Semester.fall, year: 2017, subtitle: '',
        num_late_days: 0, last_modified: ''});

    twelfth_course = new Course(
      {pk: 42, name: 'EECS 280', semester: Semester.winter, year: 2018, subtitle: '',
        num_late_days: 0, last_modified: ''});

    thirteenth_course = new Course(
      {pk: 42, name: 'EECS 280', semester: Semester.spring, year: 2018, subtitle: '',
        num_late_days: 0, last_modified: ''});

    courses: Course[] = [this.first_course, this.second_course, this.third_course,
      this.fourth_course, this.fifth_course, this.sixth_course, this.seventh_course,
      this.eighth_course, this.ninth_course, this.tenth_course, this.eleventh_course,
      this.twelfth_course, this.thirteenth_course];

    compareTerms(term_a: TermCourses, term_b: TermCourses) {
      if (term_a.term.year > term_b.term.year) {
        return  -1;
      }
      else if (term_a.term.year === term_b.term.year) {
        // everything is less than fall
        if (term_a.term.semester === Semester.fall) {
          return -1;
        }
        else if (term_a.term.semester === Semester.spring) {
          if (term_b.term.semester === Semester.fall) {
            return 1;
          }
          // b must be winter
          return -1;
        }
        // a = winter, everything is greater than winter
        return 1;
      }
      return 1;
    }

    compareCourseNames(course_a: Course, course_b: Course) {
      return course_a.name < course_b.name;
    }

    sort_into_terms() {
      for (let i = 0; i < this.courses.length; ++i) {
        let current_course: Course = this.courses[i];
        let temp_term: Term = { semester: current_course.semester, year: current_course.year };
          // if the term wasn't already in the courses by term array
          let courses_in_term: TermCourses = { term: temp_term, course_list: [current_course] };
          this.courses_by_term.push(courses_in_term);

          // if the term was already in the courses array, add the course to the assoc. course_list

      }
      // sort by year desc
      // sort terms by Fall spring winter desc
      this.courses_by_term.sort(this.compareTerms);
    }

    sort_the_courses_in_each_term() {
      for (let i = 0; i < this.courses_by_term.length; ++i) {
        this.courses_by_term[i].course_list.sort(this.compareCourseNames);
      }
    }

    created() {
      document.body.style.margin = "0";
    }
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

.course-name {
  margin: 0;
  font-weight: 600;
}

.course:hover {
  background-color: darken(lavender, 10);
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
