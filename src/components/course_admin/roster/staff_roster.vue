<template>
  <div v-if="d_loading" class="loading-wrapper loading-large">
    <i class="loading-centered fa fa-spinner fa-pulse"></i>
  </div>
  <div v-else class="staff-roster-container">
    <roster ref="staff_roster"
            role="staff"
            :roster="staff"
            @add_users="add_staff_to_roster($event)"
            @remove_user="remove_staff_from_roster($event)">
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
export default class StaffRoster extends Vue {
  @Prop({required: true, type: Course})
  course!: Course;

  staff: User[] = [];

  d_loading = true;

  @handle_global_errors_async
  async created() {
    this.staff = await this.course.get_staff();
    this.d_loading = false;
  }

  @handle_api_errors_async(make_error_handler_func())
  async add_staff_to_roster(new_staff: string[]) {
    await this.course.add_staff(new_staff);
    this.staff = await this.course.get_staff();
  }

  @handle_global_errors_async
  async remove_staff_from_roster(staff_members_to_delete: User[]) {
    await this.course.remove_staff(staff_members_to_delete);
    this.staff = await this.course.get_staff();
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/loading.scss';
</style>
