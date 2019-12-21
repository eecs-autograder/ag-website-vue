<template>
  <div v-if="d_loading" class="loading-wrapper loading-large">
    <i class="loading-centered fa fa-spinner fa-pulse"></i>
  </div>
  <div v-else class="admin-roster-container">
    <roster ref="admin_roster"
            role="admins"
            :roster="admins"
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
import { on_off_toggle } from '@/utils';

@Component({
  components: {
    APIErrors,
    Roster
  }
})
export default class AdminRoster extends Vue {
  @Prop({required: true, type: Course})
  course!: Course;

  admins: User[] = [];

  d_loading = true;

  @handle_global_errors_async
  created() {
    return on_off_toggle(this, 'd_loading', async () => {
      this.admins = await this.course.get_admins();
    });
  }

  @handle_api_errors_async(make_error_handler_func())
  async add_admins_to_roster(new_admins: string[]) {
    await this.course.add_admins(new_admins);
    this.admins = await this.course.get_admins();
  }

  @handle_global_errors_async
  async remove_admin_from_roster(admins_to_delete: User[]) {
    await this.course.remove_admins(admins_to_delete);
    this.admins = await this.course.get_admins();
  }
}
</script>
<style scoped lang="scss">
@import '@/styles/loading.scss';
</style>
