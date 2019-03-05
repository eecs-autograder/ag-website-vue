<template>
  <div id="manage-projects-demo" v-if="my_course !== null">
    <manage-projects :course="my_course"></manage-projects>
  </div>
</template>

<script lang="ts">
  import { Course, User } from 'ag-client-typescript';
  import { Component, Vue } from 'vue-property-decorator';

  import { Model } from '@/model';

  import ManageProjects from '@/components/manage_projects/manage_projects.vue';

  @Component({
    components: { ManageProjects }
  })
  export default class ManageProjectsDemo extends Vue {
    my_course: Course | null = null;
    user: User | null = null;

    async created() {
      this.user = await User.get_current();
      console.log(this.user);
      let courses = await Model.get_instance().get_courses_for_user(this.user);
      console.log(courses);
      let admin_courses = courses.courses_is_admin_for;
      this.my_course = admin_courses[0];
    }
  }
</script>

<style scoped lang="scss">
</style>
