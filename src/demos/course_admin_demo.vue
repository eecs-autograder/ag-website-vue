<template>
  <div id="course-admin-demo">
    <course-admin></course-admin>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  import CourseAdmin from '@/components/course_admin.vue';

  @Component({
    components: { CourseAdmin }
  })
  export default class CourseAdminDemo extends Vue {

  }

</script>

<style scoped lang="scss">

</style>
