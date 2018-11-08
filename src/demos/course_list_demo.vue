<template>
  <div>
    <CourseList></CourseList>
  </div>
</template>

<script lang="ts">
  import { HttpClient } from 'ag-client-typescript';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import CourseList from '@/components/course_list.vue';

  @Component({
    components: { CourseList}
  })
  export default class CourseListDemo extends Vue {
    created() {
      HttpClient.set_base_url('http://localhost:9000/api/');
      // HttpClient.set_default_headers({
      //   // Note: Make sure the test server is using fake authentication.
      //   Cookie: 'username=multi_role'
      // });
      // console.log('WAAAAAAAA');
    }
  }

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

</style>
