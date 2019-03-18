<template>
  <div class="staff-roster-container">
    <roster v-if="staff !== null"
            ref="staff_roster"
            role="staff"
            :roster="staff"
            @add_users="add_staff_to_roster($event)"
            @remove_permission="remove_staff_from_roster($event)">
    </roster>
  </div>
</template>

<script lang="ts">
  import Roster from '@/components/course_admin/roster/roster.vue';
  import { Course, User } from 'ag-client-typescript';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
    components: {
      Roster
    }
  })
  export default class StaffRoster extends Vue {
    @Prop({required: true, type: Course})
    course!: Course;

    d_course!: Course;
    staff: User[] = [];

    async created() {
      this.d_course = this.course;
      this.staff = await this.course.get_staff();
    }

    async add_staff_to_roster(new_staff: string[]) {
      await this.d_course.add_staff(new_staff);
      this.staff = await this.d_course.get_staff();
    }

    async remove_staff_from_roster(staff_members_to_delete: User[]) {
      await this.d_course.remove_staff(staff_members_to_delete);
    }
  }
</script>

<style scoped lang="scss"> </style>
