<template>
  <div id="group-lookup-demo" v-if="first_project !== null">
    <group-lookup :groups="groups"
                  :project="first_project"
                  @update_group_selected="print_group_members_names"></group-lookup>
  </div>
</template>

<script lang="ts">
  import GroupLookup from '@/components/group_lookup.vue';
  import { Course, Group, Project, User } from 'ag-client-typescript';
  import { Component, Vue } from 'vue-property-decorator';

  @Component({
    components: { GroupLookup }
  })
  export default class GroupLookupDemo extends Vue {
    first_project: Project | null = null;
    my_course: Course | null = null;
    user: User | null = null;

    // This can be deleted, just wanted to have these available to see
    // what the group lookup component looks like with groups in it.
    // group1 = new Group({
    //   pk: 1,
    //   project: 2,
    //   extended_due_date: "no",
    //   member_names: [
    //     "chuckfin@umich.edu",
    //     "tpickles@umich.edu"
    //   ],
    //   bonus_submissions_remaining: 0,
    //   late_days_used: {},
    //   num_submissions: 3,
    //   num_submits_towards_limit: 1,
    //   created_at: "",
    //   last_modified: ""
    // });
    //
    // group2 = new Group({
    //   pk: 2,
    //   project: 2,
    //   extended_due_date: "no",
    //   member_names: [
    //     "dpickles@umich.edu",
    //     "lmjdev@umich.edu"
    //   ],
    //   bonus_submissions_remaining: 0,
    //   late_days_used: {},
    //   num_submissions: 3,
    //   num_submits_towards_limit: 1,
    //   created_at: "",
    //   last_modified: ""
    // });
    //
    // group3 = new Group({
    //   pk: 3,
    //   project: 2,
    //   extended_due_date: "no",
    //   member_names: [
    //     "kwatfin@umich.edu",
    //     "prbdev@umich.edu"
    //   ],
    //   bonus_submissions_remaining: 0,
    //   late_days_used: {},
    //   num_submissions: 3,
    //   num_submits_towards_limit: 1,
    //   created_at: "",
    //   last_modified: ""
    // });
    //
    // group4 = new Group({
    //   pk: 4,
    //   project: 2,
    //   extended_due_date: "no",
    //   member_names: [
    //     "suscarm@umich.edu"
    //   ],
    //   bonus_submissions_remaining: 0,
    //   late_days_used: {},
    //   num_submissions: 3,
    //   num_submits_towards_limit: 1,
    //   created_at: "",
    //   last_modified: ""
    // });

    // groups = [this.group1, this.group2, this.group3, this.group4];
    groups: Group[] = [];

    async created() {
      this.user = await User.get_current();
      let courses = await Course.get_courses_for_user(this.user);
      let admin_courses = courses.courses_is_admin_for;
      this.my_course = admin_courses[0];
      let projects = await Project.get_all_from_course(this.my_course.pk);
      this.first_project = projects[1] !== null ? projects[1] : null;
      this.groups = await Group.get_all_from_project(this.first_project!.pk);
    }

    print_group_members_names(group: Group) {
      for (let member of group.member_names) {
        console.log(member);
      }
    }

  }
</script>

<style scoped lang="scss">

  #group-lookup-demo {
    padding-top: 25px;
  }
</style>
