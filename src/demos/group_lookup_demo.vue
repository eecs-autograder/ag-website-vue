<template>
  <div id="group-lookup-demo" v-if="first_project !== null">
    <group-lookup :groups="groups"
                  :project="first_project"
                  @update_group_selected="print_group_members_names"></group-lookup>
  </div>
</template>

<script lang="ts">
  import GroupLookup from '@/components/group_lookup.vue';
  import { Course, Project, User } from 'ag-client-typescript';
  import { Component, Vue } from 'vue-property-decorator';

  interface Member {
    username: string;
    full_name: string;
  }

  interface Group {
    pk: number;
    project: number;
    member_names: Member[];
    extended_due_date: string;
    num_submits_towards_limit: number;
    num_submissions: number;
    bonus_submissions_remaining: number;
  }

  @Component({
    components: { GroupLookup }
  })
  export default class GroupLookupDemo extends Vue {
    first_project: Project | null = null;
    my_course: Course | null = null;
    user: User | null = null;

    group1: Group = {
      pk: 1,
      project: 2,
      member_names: [
        {username: "chuckfin@umich.edu", full_name: "Charles Finster"},
        {username: "tpickles@umich.edu", full_name: "Thomas Pickles"}
      ],
      extended_due_date: "no",
      num_submits_towards_limit: 1,
      num_submissions: 3,
      bonus_submissions_remaining: 0
    };

    group2: Group = {
      pk: 2,
      project: 2,
      member_names: [
        {username: "dpickles@umich.edu", full_name: "Dylan Pickles"},
        {username: "lmjdev@umich.edu", full_name: "Lillian DeVille"}
      ],
      extended_due_date: "no",
      num_submits_towards_limit: 0,
      num_submissions: 3,
      bonus_submissions_remaining: 0
    };

    group3: Group = {
      pk: 3,
      project: 2,
      member_names: [
        {username: "kwatfin@umich.edu", full_name: "Kimiko Watanabe-Finster"},
        {username: "prbdev@umich.edu", full_name: "Phillip DeVille"}
      ],
      extended_due_date: "no",
      num_submits_towards_limit: 0,
      num_submissions: 3,
      bonus_submissions_remaining: 0
    };

    group4: Group = {
      pk: 4,
      project: 2,
      member_names: [
        {username: "suscarm@umich.edu", full_name: "Susanna Carmichael"},
      ],
      extended_due_date: "no",
      num_submits_towards_limit: 0,
      num_submissions: 3,
      bonus_submissions_remaining: 0
    };

    groups = [this.group1, this.group2, this.group3, this.group4];

    async created() {
      this.user = await User.get_current();
      let courses = await Course.get_courses_for_user(this.user);
      let admin_courses = courses.courses_is_admin_for;
      this.my_course = admin_courses[0];
      let projects = await Project.get_all_from_course(this.my_course.pk);
      this.first_project = projects[1] ? projects[1] : null;
      // this.groups = Group.get_all_from_project(this.project.pk);
    }

    print_group_members_names(group: Group) {
      for (let member of group.member_names) {
        console.log(member.full_name);
      }
    }

  }
</script>

<style scoped lang="scss">

  #group-lookup-demo {
    padding-top: 25px;
  }
</style>
