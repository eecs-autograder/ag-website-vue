<template>
  <div id="course-permissions-demo" v-if="my_course !== null">
    <admin-roster :course="my_course"></admin-roster>
  </div>
</template>

<script lang="ts">
  import { Course, User } from 'ag-client-typescript';
  import { Component, Vue } from 'vue-property-decorator';

  import { Model } from '@/model';

  import AdminRoster from '@/components/permissions/admin_roster.vue';

  @Component({
    components: { AdminRoster }
  })
  export default class CoursePermissionsDemo extends Vue {
    my_course: Course | null = null;
    user: User | null = null;
    admin_roster = [];

    async created() {
      this.user = await User.get_current();
      let courses = await Model.get_instance().get_courses_for_user(this.user);
      let admin_courses = courses.courses_is_admin_for;
      this.my_course = admin_courses[0];
    }
  }
</script>

<style scoped lang="scss">
</style>
