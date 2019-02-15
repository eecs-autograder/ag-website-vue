<template>
  <div id="instructor-files-demo" v-if="my_project !== null">
    <instructor-files :project="my_project"></instructor-files>
  </div>
</template>

<script lang="ts">
  // cant get Course from ag-client-typescript
  import { Project, User } from 'ag-client-typescript';

  import { Component, Vue } from 'vue-property-decorator';

  import { Model } from '@/model';

  import InstructorFiles from '@/components/instructor_files/instructor_files.vue';

  @Component({
    components: { InstructorFiles }
  })
  export default class InstructorFilesDemo extends Vue {

    projects: Project[] = [];
    my_project: Project | null = null;
    user: User | null = null;

    async created() {
      this.user = await User.get_current();
      console.log(this.user);
      let courses = await Model.get_instance().get_courses_for_user(this.user);
      // console.log(courses);
      let admin_courses = courses.courses_is_admin_for;
      let first_admin_course = admin_courses[0];
      // console.log(first_admin_course);
      // console.log(first_admin_course.pk);
      try {
        // 500 internal server error
        this.my_project = await Project.get_by_pk(67);
        // this.my_project = this.projects[1];
      }
      catch (e) {
        console.log(e);
      }
      // console.log("Created Demo");
    }
  }

</script>

<style scoped lang="scss">
</style>
