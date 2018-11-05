import { Course, Semester } from 'ag-client-typescript';

<template>
  <div ref="course_list" id="course-list">
    <p id="login-info"> Hi, Ashley! (ashberg@umich.edu) </p>
    <p id="log-button"> Sign Out </p>
    <p id="course-announcement"> Courses </p>
    <div v-if="any_courses" class="role-container">
      <div v-if="is_admin"
           class="role-panel">
        <p class="course-role"> Admin </p>
        <div v-for="(course, index) of admin_courses">
          <p :class="course.year === 2018 && course.semester === 'Fall'
                ? 'active-course' : 'inactive-course'">{{course.name}}
          </p>
          <p :class="course.year === 2018 && course.semester === 'Fall'
                ? 'active-edit-cog' : 'inactive-edit-cog'"><i class="fas fa-cog"></i></p>
        </div>
      </div>

      <div v-if="is_staff"
           class="role-panel">
        <p class="course-role"> Staff </p>
        <div v-for="(course, index) of staff_courses">
          <p :class="course.year === 2018 && course.semester === 'Fall'
                ? 'active-course' : 'inactive-course'">{{course.name}}
          </p>
        </div>
      </div>

      <div v-if="is_student"
           class="role-panel student">
        <p class="course-role"> Student </p>
        <div v-for="(course, index) of student_courses">
          <p :class="course.year === 2018 && course.semester === 'Fall'
                ? 'active-course' : 'inactive-course'">{{course.name}}
          </p>
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

  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component
  export default class CourseList extends Vue {
    is_admin = true;
    is_staff = true;
    is_student = true;
    no_files = false;
    any_courses = true;

    admin_courses = [{name: "EECS 484 Fall 2018", semester: "Fall", year: 2018},
      {name: "EECS 280 Fall 2018", semester: "Fall", year: 2018},
      {name: "EECS 183 Winter 2018", semester: "Winter", year: 2018}];

    staff_courses = [{name: "EECS 281 Fall 2018", semester: "Fall", year: 2018},
      {name: "EECS 370 Fall 2017", semester: "Fall", year: 2017},
      {name: "EECS 370 Winter 2017", semester: "Winter", year: 2017},
      {name: "EECS 281 Fall 2016", semester: "Fall", year: 2016},
      {name: "EECS 183 Spring 2016", semester: "Spring", year: 2016}];
    student_courses = [
      {name: "EECS 493 Fall 2018", semester: "Fall", year: 2018},
      {name: "EECS 484 Fall 2017", semester: "Fall", year: 2017},
      {name: "EECS 280 Winter 2017", semester: "Winter", year: 2017},
      {name: "EECS 370 Fall 2016", semester: "Fall", year: 2016},
      {name: "EECS 485 Fall 2016", semester: "Fall", year: 2016},
      {name: "EECS 281 Spring 2016", semester: "Spring", year: 2016},
      {name: "EECS 280 Winter 2016", semester: "Winter", year: 2016},
      {name: "EECS 183 Fall 2015", semester: "Fall", year: 2015},
      {name: "EECS 183 Winter 2014", semester: "Winter", year: 2014}];

    created() {
      document.body.style.margin = "0";
    }
  }

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

#course-list {
  font-family: "Helvetica Neue"
}

// height is 110
#course-announcement {
  font-size: 60px;
  margin: 0;
  padding: 20px;
}

.course-role {
  margin: 0;
  display: inline-block;
  font-size: 26px;
  padding: 15px;
  /*text-align: center;*/
}

.role-panel {
  margin-right: 55px;
  vertical-align: top;
  padding: 20px;
  display: inline-block;
}

.active-course {
  border-radius: 5px;
  font-size: 20px;
  padding: 15px;
  background-color: $sky-blue;
  display: inline-block;
  margin: 5px 0;
  width: 190px;
  cursor: pointer;
}

.inactive-course {
  border-radius: 5px;
  font-size: 20px;
  padding: 15px;
  background-color: $pebble-light;
  display: inline-block;
  margin: 5px 0;
  width: 190px;
  cursor: pointer;
}

#not-enrolled-panel {
  padding: 10px 25px;
}

.active-course:hover {
  background-color: darken($sky-blue, 10);
}

.inactive-course:hover {
  background-color: darken($pebble-light, 10);
}

#not-enrolled-panel p {
  border-radius: 5px;
  display: inline-block;
  padding: 10px;
  background-color: $sky-blue;
  font-size: 20px;
  margin: 0;
}

.active-edit-cog {
  background-color: white;
  font-size: 20px;
  display: inline-block;
  border-radius: 5px;
  margin: 0;
  padding: 15px;
  margin-left: 5px;
  cursor: pointer;
  color: black;
}

.active-edit-cog:hover {
  background-color: $sky-blue;
}

.inactive-edit-cog:hover {
  background-color: $pebble-light;
}

.inactive-edit-cog {
  background-color: white;
  font-size: 20px;
  display: inline-block;
  border-radius: 5px;
  margin: 0;
  padding: 15px;
  margin-left: 5px;
  cursor: pointer;
  color: black;
}

#login-info {
  font-size: 18px;
  position: absolute;
  right: 18px;
  top: 4px;
}

#log-button {
  font-size: 18px;
  position: absolute;
  right: 18px;
  top: 36px;
  padding: 10px;
  border-radius: 5px;
  background-color: $pebble-medium;
}

</style>
