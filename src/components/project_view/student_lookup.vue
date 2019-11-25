<template>
  <div v-if="d_loading" class="loading-large">
    <i class="fa fa-spinner fa-pulse"></i>
  </div>
  <div v-else id="student-lookup-component">
    <group-lookup class="lookup-container"
                  :groups="d_groups.data"
                  @update_group_selected="d_selected_group = $event"></group-lookup>
    <template v-if="d_selected_group !== null">
      <group-members class="group-members" :group="d_selected_group"></group-members>
      <submission-list class="student-lookup-submission-list"
                       :course="course"
                       :project="project"
                       :group="d_selected_group"></submission-list>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Course, Group, GroupObserver, Project } from 'ag-client-typescript';

import { ArraySet, member_names_less } from '@/array_set';
import GroupLookup from '@/components/group_lookup.vue';
import GroupMembers from '@/components/project_view/group_members.vue';
import SubmissionList from '@/components/submission_list/submission_list.vue';
import { Created, Destroyed } from '@/lifecycle';
import { safe_assign } from '@/utils';


@Component({
  components: {
      GroupLookup,
      GroupMembers,
      SubmissionList,
  }
})
export default class StudentLookup extends Vue implements GroupObserver, Created, Destroyed {
  @Prop({required: true, type: Course})
  course!: Course;

  @Prop({required: true, type: Project})
  project!: Project;

  d_groups = new ArraySet<Group>([], {less_func: member_names_less});

  d_selected_group: Group | null = null;

  d_loading = true;

  async created() {
    this.d_groups = new ArraySet<Group>(
      await Group.get_all_from_project(this.project.pk), {less_func: member_names_less});

    Group.subscribe(this);
    this.d_loading = false;
  }

  destroyed() {
    Group.unsubscribe(this);
  }

  // Currently the only Group event we care about is when a group
  // is created. This can happen in the ProjectView when the current user
  // completes the group registration process.
  update_group_created(group: Group): void {
    this.d_groups.insert(group);
  }

  update_group_changed(group: Group): void {
  }

  update_group_merged(new_group: Group, group1_pk: number, group2_pk: number): void {
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/global.scss';

.lookup-container {
  margin: 8px;
}

.group-members {
  margin: 8px;
}

.student-lookup-submission-list {
  border-top: 1px solid $pebble-medium;
}
</style>
