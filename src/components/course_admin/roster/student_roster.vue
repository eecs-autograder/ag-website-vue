<template>
  <div v-if="d_loading" class="loading-wrapper loading-large">
    <i class="loading-centered fa fa-spinner fa-pulse"></i>
  </div>
  <div v-else class="student-roster-container">
    <roster ref="student_roster"
            role="students"
            :roster="students"
            :include_replace_button="true"
            @add_users="add_students_to_roster($event)"
            @replace_users="replace_roster($event)"
            @remove_user="remove_student_from_roster($event)">
      <template v-slot:before_save_button>
        <APIErrors ref="api_errors"></APIErrors>
      </template>
    </roster>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Course, User } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import Roster from '@/components/course_admin/roster/roster.vue';
import { handle_api_errors_async, handle_global_errors_async, make_error_handler_func } from '@/error_handling';

@Component({
  components: {
    APIErrors,
    Roster
  }
})
export default class StudentRoster extends Vue {
  @Prop({required: true, type: Course})
  course!: Course;

  students: User[] = [];

  d_loading = true;

  @handle_global_errors_async
  async created() {
    this.students = await this.course.get_students();
    this.d_loading = false;
  }

  @handle_api_errors_async(make_error_handler_func())
  async add_students_to_roster(new_students: string[]) {
    await this.course.add_students(new_students);
    this.students = await this.course.get_students();
    (<Roster> this.$refs.student_roster).reset_form();
  }

  @handle_api_errors_async(make_error_handler_func())
  async replace_roster(new_students: string[]) {
    await this.course.set_students(new_students);
    this.students = await this.course.get_students();
    (<Roster> this.$refs.student_roster).reset_form();
  }

  @handle_global_errors_async
  async remove_student_from_roster(students_to_delete: User[]) {
    await this.course.remove_students(students_to_delete);
    this.students = await this.course.get_students();
  }
}
</script>
<style scoped lang="scss">
@import '@/styles/loading.scss';
</style>
