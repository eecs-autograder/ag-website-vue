<template>
  <div v-if="d_loading" class="loading-large">
    <i class="fa fa-spinner fa-pulse"></i>
  </div>
  <div v-else id="student-lookup-component">
    <group-lookup class="lookup-container"
                  :groups="d_groups.data"
                  @update_group_selected="d_selected_group = $event"></group-lookup>
    <submission-list v-if="d_selected_group !== null"
                     :course="course"
                     :project="project"
                     :group="d_selected_group"></submission-list>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Course, Group, GroupObserver, Project } from 'ag-client-typescript';

import { ArraySet } from '@/array_set';
import GroupLookup from '@/components/group_lookup.vue';
import SubmissionList from '@/components/submission_list/submission_list.vue';
import { Created, Destroyed } from '@/lifecycle';
import { safe_assign } from '@/utils';

function member_names_less(first: Group, second: Group) {
  return first.member_names[0] < second.member_names[0];
}

@Component({
  components: {
      GroupLookup,
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
  padding: 8px;
  // z-index: inherit;
}

</style>
