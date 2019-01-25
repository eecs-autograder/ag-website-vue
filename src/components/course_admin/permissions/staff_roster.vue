<template>
  <div class="staff-permissions-container">
    <permissions v-if="staff !== null"
                        role="staff"
                        :roster="staff"
                        @add_permissions="add_staff_to_roster($event)"
                        @remove_permission="remove_staff_from_roster($event)">
    </permissions>
  </div>
</template>

<script lang="ts">
  import Permissions from '@/components/course_admin/permissions/permissions.vue';
  import { Course, User } from 'ag-client-typescript';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
    components: {
      Permissions
    }
  })
  export default class StaffRoster extends Vue {

    @Prop({required: true, type: Course})
    course!: Course;

    d_course!: Course;
    staff: User[] | null = null;

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
