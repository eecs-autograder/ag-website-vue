<template>
  <div class="handgrader-permissions-container">
    <permissions v-if="handgraders !== null"
                 ref="handgrader_permissions"
                 role="handgraders"
                 :roster="handgraders"
                 @add_permissions="add_handgraders_to_roster($event)"
                 @remove_permission="remove_handgrader_from_roster($event)">
    </permissions>
  </div>
</template>

<script lang="ts">
  import Permissions from '@/components/permissions/permissions.vue';
  import { Course, User } from 'ag-client-typescript';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
    components: {
      Permissions
    }
  })
  export default class HandgraderRoster extends Vue {
    @Prop({required: true, type: Course})
    course!: Course;

    d_course!: Course;
    handgraders: User[] | null = null;

    async created() {
      this.d_course = this.course;
      this.handgraders = await this.d_course.get_handgraders();
    }

    async add_handgraders_to_roster(new_handgraders: string[]) {
      await this.d_course.add_handgraders(new_handgraders);
      this.handgraders = await this.d_course.get_handgraders();
    }

    async remove_handgrader_from_roster(handgraders_to_delete: User[]) {
      await this.d_course.remove_handgraders(handgraders_to_delete);
    }
  }
</script>

<style scoped lang="scss"> </style>
