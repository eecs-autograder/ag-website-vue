import { Course, Semester } from 'ag-client-typescript';

<template>
  <div ref="course_list" id="course-list">
    <p id="course-announcement"> Courses </p>
    <div v-if="any_courses" class="role-container">
      <div v-if="is_admin"
           class="role-panel">
        <p class="course-role"> Admin </p>
        <div v-for="(course, index) of admin_courses">
          <p :class="index % 2 == 0? 'course-name-odd' : 'course-name-even'">{{course}} </p>
        </div>
      </div>

      <div v-if="is_staff"
           class="role-panel">
        <p class="course-role"> Staff </p>
        <div v-for="(course, index) of staff_courses">
          <p :class="index % 2 == 0? 'course-name-odd' : 'course-name-even'">{{course}} </p>
        </div>
      </div>

      <div v-if="is_student"
           class="role-panel">
        <p class="course-role"> Student </p>
        <div v-for="(course, index) of student_courses">
          <p :class="index % 2 == 0? 'course-name-odd' : 'course-name-even'">{{course}} </p>
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

    admin_courses = ["EECS 280 Spring 2018", "EECS 490 Fall 2018"];
    staff_courses = ["EECS 280 Fall 2017", "EECS 280 Winter 2018", "EECS 280 Spring 2018"];
    student_courses = ["EECS 485 Fall 2016", "EECS 280 Winter 2017"];
  }

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

#course-announcement {
  font-size: 34px;
  margin: 0;
  padding: 20px 35px;
}

.course-role {
  margin: 0 0 10px 0;
  border-radius: 5px;
  display: inline-block;
  font-size: 22px;
  padding: 10px;
}

.role-container {
  margin-left: 20px;
}

.role-panel {
  padding: 10px;
  border-radius: 5px;
  margin: 15px;
  /*display: inline-block;*/
  vertical-align: top;
}

.course-name {
  display: inline-block;
  border-radius: 5px;
  font-size: 18px;
  margin: 5px 0;
  padding: 10px;
  cursor: pointer;
}

.course-name-odd {
  display: inline-block;
  background-color: white;
  border-radius: 5px;
  font-size: 18px;
  margin: 5px 0;
  padding: 10px;
  cursor: pointer;
}

.course-name-even {
  display: inline-block;
  background-color: white;
  border-radius: 5px;
  font-size: 18px;
  margin: 5px 0;
  padding: 10px;
  cursor: pointer;

}

.course-name-even:hover, .course-name-odd:hover {
  background-color: $pebble-medium;
}

#not-enrolled-panel {
  padding: 10px 25px;
}

#not-enrolled-panel p {
  border-radius: 5px;
  display: inline-block;
  padding: 10px;
  background-color: $sky-blue;
  font-size: 20px;
  margin: 0;
}

</style>
