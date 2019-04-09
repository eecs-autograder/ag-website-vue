<template>
  <div id="edit-groups-component">
    <div class="left">
      <create-single-group :project="project"> </create-single-group>
    </div>
    <div class="right">
      <div class="edit-side-title"> Edit Group: </div>
      <group-lookup :groups="groups"
                    :project="project"
                    @update_group_selected="update_group_selected"> </group-lookup>
      <edit-single-group :project="project">
      </edit-single-group>
    </div>
  </div>
</template>

<script lang="ts">
  import { Project } from 'ag-client-typescript';
  import CreateSingleGroup from '@/components/edit_groups/create_single_group.vue';
  import EditSingleGroup from '@/components/edit_groups/edit_single_group.vue';
  import GroupLookup from '@/components/group_lookup.vue';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  interface Member {
    username: string;
    full_name: string;
  }

  interface Group {
    pk: number;
    project: number;
    extended_due_date: string;
    member_names: Member[];
    bonus_submissions_remaining: number;
    late_days_used: {[username: string]: number};
    num_submissions: number;
    num_submits_towards_limit: number;
    created_at: string;
    last_modified: string;
  }

  @Component({
    components: {
      CreateSingleGroup,
      EditSingleGroup,
      GroupLookup
    }
  })
  export default class CreateGroup extends Vue { // implements GroupObserver

    @Prop({required: true, type: Project})
    project!: Project;

    groups: Group[] = [];

    group1 = {
      pk: 1,
      project: 2,
      extended_due_date: "no",
      member_names: [
        {username: "chuckfin@umich.edu", full_name: "Charles Finster"},
        {username: "tpickles@umich.edu", full_name: "Thomas Pickles"}
      ],
      bonus_submissions_remaining: 0,
      late_days_used: {"chuckfin@umich.edu": 2},
      num_submissions: 3,
      num_submits_towards_limit: 2,
      created_at: "9am",
      last_modified: "10am"
    };

    group2 = {
      pk: 2,
      project: 2,
      extended_due_date: "no",
      member_names: [
        {username: "dpickles@umich.edu", full_name: "Dylan Pickles"},
        {username: "lmjdev@umich.edu", full_name: "Lillian DeVille"}
      ],
      bonus_submissions_remaining: 0,
      late_days_used: {},
      num_submissions: 3,
      num_submits_towards_limit: 0,
      created_at: "4pm",
      last_modified: "6pm"
    };

    group3 = {
      pk: 3,
      project: 2,
      extended_due_date: "yes",
      member_names: [
        {username: "kwatfin@umich.edu", full_name: "Kimiko Watanabe-Finster"},
        {username: "prbdev@umich.edu", full_name: "Phillip DeVille"}
      ],
      bonus_submissions_remaining: 0,
      late_days_used: {},
      num_submissions: 3,
      num_submits_towards_limit: 0,
      created_at: "11am",
      last_modified: "5pm"
    };

    group4 = {
      pk: 4,
      project: 2,
      extended_due_date: "no",
      member_names: [
        {username: "suscarm@umich.edu", full_name: "Susanna Carmichael"},
      ],
      bonus_submissions_remaining: 0,
      late_days_used: {},
      num_submissions: 3,
      num_submits_towards_limit: 0,
      created_at: "2pm",
      last_modified: "2:45pm"
    };

    selected_group: Group | null = null;

    async created() {
      // this.groups = Group.get_all_from_project(this.project.pk);
      this.groups = [this.group1, this.group2, this.group3];
      console.log("Created EG");
    }

    mounted() {
      // Group.subscribe(this);
    }

    beforeDestroy() {
      // Group.unsubscribe(this);
    }

    update_group_selected(group: Group) {
      console.log(group.member_names);
    }

    update_group_created(group: Group): void {
      this.groups.push(group);
    }

    update_group_changed(group: Group): void {
      // find group
      // update group ? people could have been removed or added
      // or an extension could have been granted redacted
    }

    update_group_merged(group: Group): void {
      // ?
    }
  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';
  @import url('https://fonts.googleapis.com/css?family=Quicksand');
  $current-lang-choice: 'Quicksand';

  #edit-groups-component {
    margin-top: 10px;
    font-family: Quicksand;
  }

  .edit-side-title {
    color: lighten(black, 25);
    font-size: 16px;
    font-weight: bold;
    margin: 0;
    padding: 3px 10px 24px 0;
    display: inline-block;
    vertical-align: top;
  }

  .left {
    width: 50%;
    display: inline-block;
    box-sizing: border-box;
    vertical-align: top;
    padding: 0 2.5%;
  }

  .right {
    width: 50%;
    box-sizing: border-box;
    display: inline-block;
    padding: 0 2.5%;
  }

</style>
