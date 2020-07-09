<template>
  <div class="admin-roster-container">
    <roster ref="admin_roster"
            role="admins"
            :roster="d_admins"
            @add_users="add_admins_to_roster($event)"
            @remove_user="remove_admin_from_roster($event)">
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
export default class AdminRoster extends Vue {
  @Prop({required: true, type: Course})
  course!: Course;

  d_admins: User[] | null = null;

  @handle_global_errors_async
  async created() {
    this.d_admins = await this.course.get_admins();
}

  @handle_api_errors_async(make_error_handler_func())
  async add_admins_to_roster(new_admins: string[]) {
    await this.course.add_admins(new_admins);
    this.d_admins = await this.course.get_admins();
    (<Roster> this.$refs.admin_roster).reset_form();
  }

  @handle_global_errors_async
  async remove_admin_from_roster(admins_to_delete: User[]) {
    await this.course.remove_admins(admins_to_delete);
    this.d_admins = await this.course.get_admins();
  }
}
</script>
<style scoped lang="scss">
@import '@/styles/loading.scss';
</style>
