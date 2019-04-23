<template>
  <div class="expected-student-files-demo" v-if="project_1 !== null">
    <expected-student-files :project="project_1"></expected-student-files>
  </div>
</template>

<script lang="ts">
import ExpectedStudentFiles from '@/components/project_admin/expected_student_files/expected_student_files.vue';
import { Course, Project, User } from 'ag-client-typescript';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: { ExpectedStudentFiles }
})
export default class ExpectedStudentFilesDemo extends Vue {
  my_course: Course | null = null;
  project_1: Project | null = null;

  async created() {
    let user = await User.get_current();
    let courses = await Course.get_courses_for_user(user);
    let admin_courses = courses.courses_is_admin_for;
    this.my_course = admin_courses[1];
    let projects = await Project.get_all_from_course(this.my_course.pk);
    this.project_1 = projects[1];
  }
}
</script>

<style lang="scss">
</style>
