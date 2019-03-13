<template>
  <div id="group-lookup-demo" v-if="first_project !== null">
    <group-lookup :project="first_project"
                  @update_group_selected="print_group_members_names($event)"></group-lookup>
  </div>
</template>

<script lang="ts">
  import GroupLookup from '@/components/group_lookup.vue';
  import { Course, Project, User } from 'ag-client-typescript';
  import { Component, Vue } from 'vue-property-decorator';
  import { Model } from '@/model';

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
  export default class StudentLookupDemo extends Vue {
    first_project: Project | null = null;
    my_course: Course | null = null;
    user: User | null = null;

    async created() {
      this.user = await User.get_current();
      let courses = await Model.get_instance().get_courses_for_user(this.user);
      let admin_courses = courses.courses_is_admin_for;
      this.my_course = admin_courses[0];
      let projects = await Project.get_all_from_course(this.my_course.pk);
      console.log(projects);
      this.first_project = projects[1] ? projects[1] : null;
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
