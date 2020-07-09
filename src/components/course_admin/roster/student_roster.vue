<template>
  <div class="student-roster-container">
    <roster ref="student_roster"
            role="students"
            :roster="d_students"
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

  d_students: User[] | null = null;

  @handle_global_errors_async
  async created() {
    this.d_students = await this.course.get_students();
  }

  @handle_api_errors_async(make_error_handler_func())
  async add_students_to_roster(new_students: string[]) {
    await this.course.add_students(new_students);
    this.d_students = await this.course.get_students();
    (<Roster> this.$refs.student_roster).reset_form();
  }

  @handle_api_errors_async(make_error_handler_func())
  async replace_roster(new_students: string[]) {
    await this.course.set_students(new_students);
    this.d_students = await this.course.get_students();
    (<Roster> this.$refs.student_roster).reset_form();
  }

  @handle_global_errors_async
  async remove_student_from_roster(students_to_delete: User[]) {
    await this.course.remove_students(students_to_delete);
    this.d_students = await this.course.get_students();
  }
}
</script>
<style scoped lang="scss">
@import '@/styles/loading.scss';
</style>
