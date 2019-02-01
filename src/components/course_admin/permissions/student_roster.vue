<template>
  <div class="student-permissions-container">
    <permissions v-if="students !== null"
                 ref="student_permissions"
                 role="students"
                 :roster="students"
                 @add_permissions="add_students_to_roster($event)"
                 @remove_permission="remove_student_from_roster($event)">
    </permissions>
  </div>
</template>

<script lang="ts">
  import Permissions from '@/components/course_admin/permissions/permissions.vue';
  import { Course, User } from 'ag-client-typescript';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
    components: {
      Permissions
    }
  })
  export default class StudentRoster extends Vue {

    @Prop({required: true, type: Course})
    course!: Course;

    d_course!: Course;
    students: User[] | null = null;

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
