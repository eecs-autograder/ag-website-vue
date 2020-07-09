<template>
  <div class="handgrader-roster-container">
    <roster ref="handgrader_roster"
            role="handgraders"
            :roster="d_handgraders"
            @add_users="add_handgraders_to_roster($event)"
            @remove_user="remove_handgrader_from_roster($event)">
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
export default class HandgraderRoster extends Vue {
  @Prop({required: true, type: Course})
  course!: Course;

  d_handgraders: User[] | null = null;

  @handle_global_errors_async
  async created() {
    this.d_handgraders = await this.course.get_handgraders();
}

  @handle_api_errors_async(make_error_handler_func())
  async add_handgraders_to_roster(new_handgraders: string[]) {
    await this.course.add_handgraders(new_handgraders);
    this.d_handgraders = await this.course.get_handgraders();
    (<Roster> this.$refs.handgrader_roster).reset_form();
  }

  @handle_global_errors_async
  async remove_handgrader_from_roster(handgraders_to_delete: User[]) {
    await this.course.remove_handgraders(handgraders_to_delete);
    this.d_handgraders = await this.course.get_handgraders();
  }
}
</script>
<style scoped lang="scss">
@import '@/styles/loading.scss';
</style>
