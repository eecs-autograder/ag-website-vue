<template>
  <div id="instructor-files-demo" v-if="my_project !== null">
    <instructor-files :project="my_project"></instructor-files>
  </div>
</template>

<script lang="ts">
  import { Course, Project, User } from 'ag-client-typescript';

  import { Component, Vue } from 'vue-property-decorator';

  import InstructorFiles from '@/components/project_admin/instructor_files/instructor_files.vue';

  @Component({
    components: { InstructorFiles }
  })
  export default class InstructorFilesDemo extends Vue {

    projects: Project[] = [];
    my_project: Project | null = null;
    user: User | null = null;

    async created() {
      this.user = await User.get_current();
      let courses = await Course.get_courses_for_user(this.user);
      let admin_courses = courses.courses_is_admin_for;
      let first_admin_course = admin_courses[0];
      try {
        this.my_project = await Project.get_by_pk(66);
      }
      catch (e) {
        console.log(e);
      }
    }
  }

</script>

<style scoped lang="scss">
</style>
