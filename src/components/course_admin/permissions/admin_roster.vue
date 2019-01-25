<template>
  <div class="admin-permissions-container">
    <permissions v-if="admins !== null"
                        role="admins"
                        :roster="admins"
                        @add_permissions="add_admins_to_roster($event)"
                        @remove_permission="remove_admin_from_roster($event)">
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
  export default class AdminRoster extends Vue {

    @Prop({required: true, type: Course})
    course!: Course;

    d_course!: Course;
    admins: User[] | null = null;

    async created() {
      this.d_course = this.course;
      this.admins = await this.d_course.get_admins();
    }

    async add_admins_to_roster(new_admins: string[]) {
      await this.d_course.add_admins(new_admins);
      this.admins = await this.d_course.get_admins();
    }

    async remove_admin_from_roster(admins_to_delete: User[]) {
      await this.d_course.remove_admins(admins_to_delete);
    }
  }
</script>

<style scoped lang="scss"> </style>
