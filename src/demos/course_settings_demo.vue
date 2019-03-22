<template>
  <div id="course-settings-demo" v-if="my_course !== null">
    <course-settings :course="my_course"></course-settings>
  </div>
</template>

<script lang="ts">
  import { Course, User } from 'ag-client-typescript';
  import { Component, Vue } from 'vue-property-decorator';

  import CourseSettings from '@/components/course_admin/course_settings.vue';

  @Component({
    components: { CourseSettings }
  })
  export default class CourseSettingsDemo extends Vue {
    my_course: Course | null = null;
    user: User | null = null;

    async created() {
      this.user = await User.get_current();
      console.log(this.user);
      let courses = await Course.get_courses_for_user(this.user);
      console.log(courses);
      let admin_courses = courses.courses_is_admin_for;
      this.my_course = admin_courses[0];
    }
  }
</script>

<style scoped lang="scss">
</style>
