<template>
  <div>
    <CourseList></CourseList>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import CourseList from '@/components/course_list.vue';

  @Component({
    components: { CourseList}
  })
  export default class CourseListDemo extends Vue {}

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

</style>
