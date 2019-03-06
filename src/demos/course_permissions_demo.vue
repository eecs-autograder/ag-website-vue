<template>
  <div id="course-permissions-demo" v-if="my_course !== null">
    <admin-roster :course="my_course"></admin-roster>
    <!--<handgrader-roster :course="my_course"></handgrader-roster>-->
    <!--<staff-roster :course="my_course"></staff-roster>-->
    <!--<student-roster :course="my_course"></student-roster>-->
  </div>
</template>

<script lang="ts">
  import { Course, User } from 'ag-client-typescript';
  import { Component, Vue } from 'vue-property-decorator';

  import { Model } from '@/model';

  import AdminRoster from '@/components/course_admin/permissions/admin_roster.vue';
  import HandgraderRoster from '@/components/course_admin/permissions/handgrader_roster.vue';
  import StaffRoster from '@/components/course_admin/permissions/staff_roster.vue';
  import StudentRoster from '@/components/course_admin/permissions/student_roster.vue';

  @Component({
    components: { AdminRoster, HandgraderRoster, StaffRoster, StudentRoster }
  })
  export default class CoursePermissionsDemo extends Vue {
    my_course: Course | null = null;
    user: User | null = null;

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
