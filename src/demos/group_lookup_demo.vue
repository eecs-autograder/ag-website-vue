<template>
  <div id="group-lookup-demo">
    <group-lookup :groups="groups"
                  @update_group_selected="print_group_members_names">
    </group-lookup>
  </div>
</template>

<script lang="ts">
  import GroupLookup from '@/components/group_lookup.vue';
  import { Group } from 'ag-client-typescript';
  import { Component, Vue } from 'vue-property-decorator';

  @Component({
    components: { GroupLookup }
  })
  export default class GroupLookupDemo extends Vue {

    group1 = new Group({
      pk: 1,
      project: 2,
      extended_due_date: "no",
      member_names: [
        "chuckfin@umich.edu",
        "tpickles@umich.edu"
      ],
      bonus_submissions_remaining: 0,
      late_days_used: {},
      num_submissions: 3,
      num_submits_towards_limit: 1,
      created_at: "",
      last_modified: ""
    });

    group2 = new Group({
      pk: 2,
      project: 2,
      extended_due_date: "no",
      member_names: [
        "dpickles@umich.edu",
        "lmjdev@umich.edu"
      ],
      bonus_submissions_remaining: 0,
      late_days_used: {},
      num_submissions: 3,
      num_submits_towards_limit: 1,
      created_at: "",
      last_modified: ""
    });

    group3 = new Group({
      pk: 3,
      project: 2,
      extended_due_date: "no",
      member_names: [
        "kwatfin@umich.edu",
        "prbdev@umich.edu"
      ],
      bonus_submissions_remaining: 0,
      late_days_used: {},
      num_submissions: 3,
      num_submits_towards_limit: 1,
      created_at: "",
      last_modified: ""
    });

    group4 = new Group({
      pk: 4,
      project: 2,
      extended_due_date: "no",
      member_names: [
        "suscarm@umich.edu"
      ],
      bonus_submissions_remaining: 0,
      late_days_used: {},
      num_submissions: 3,
      num_submits_towards_limit: 1,
      created_at: "",
      last_modified: ""
    });

    groups = [this.group1, this.group2, this.group3, this.group4];

    print_group_members_names(group: Group) {
      for (let member of group.member_names) {
        console.log(member);
      }
    }

  }
</script>

<style scoped lang="scss">

  #group-lookup-demo {
    padding: 25px 20px 0 20px;
  }

</style>
