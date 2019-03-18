<template>
  <div class="student-permissions-container">
    <roster v-if="students !== null"
            ref="student_roster"
            role="students"
            :roster="students"
            @add_permissions="add_students_to_roster($event)"
            @remove_permission="remove_student_from_roster($event)">
    </roster>
  </div>
</template>

<script lang="ts">
  import Roster from '@/components/course_admin/roster/roster.vue';
  import { Course, User } from 'ag-client-typescript';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
    components: {
      Roster
    }
  })
  export default class StudentRoster extends Vue {
    @Prop({required: true, type: Course})
    course!: Course;

    d_course!: Course;
    students: User[] = [];

    async created() {
      this.d_course = this.course;
      this.students = await this.d_course.get_students();
    }

    async add_students_to_roster(new_students: string[]) {
      await this.d_course.add_students(new_students);
      this.students = await this.d_course.get_students();
    }

    async remove_student_from_roster(students_to_delete: User[]) {
      await this.d_course.remove_students(students_to_delete);
    }
  }
</script>

<style scoped lang="scss"> </style>
