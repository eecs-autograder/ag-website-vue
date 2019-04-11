<template>
  <div id="edit-groups-component">
    <div class="left">

      <div id="component-toggle">
        <Toggle v-model="editing_existing_group"
                :active_background_color="toggle_color">
          <div slot="on">
            <p class="toggle-on">{{editing_existing_group ? 'Editing existing group' : 'Edit existing group'}}</p>
          </div>
          <div slot="off">
            <p class="toggle-off">{{editing_existing_group ? 'Create new group' : 'Creating new group'}} </p>
          </div>
        </Toggle>
      </div>

      <div v-if="editing_existing_group">
        <group-lookup :groups="groups"
                      :project="project"
                      @update_group_selected="update_group_selected"> </group-lookup>
        <edit-single-group :project="project">
        </edit-single-group>
      </div>
      <div v-else>
        <create-single-group :project="project"> </create-single-group>
      </div>
    </div>
    <div class="right">
<!--      <div class="extensions-title"> Extensions </div>-->
      <table class="extensions-container">
        <tr>
          <th> Extensions</th>
          <th> </th>
<!--          <th> Group Members: </th>-->
<!--          <th> Due Date: </th>-->
        </tr>
        <tr class="odd">
          <td class="group-members">
            <div> aredondo@umich.edu </div>
            <div> tdaly@umich.edu </div>
          </td>
        <td class="due-date"> Feb 18, 2019, 8:07:00 PM</td>
        </tr>
        <tr class="even">
          <td class="group-members">
            <div> ashberg@umich.edu </div>
            <div> hmzeder@umich.edu </div>
          </td>
          <td class="due-date"> Feb 18, 2019, 8:07:00 PM </td>
        </tr>
        <tr class="odd">
          <td class="group-members">
            <div> taylor@umich.edu </div>
          </td>
          <td class="due-date"> Feb 19, 2019, 8:07:00 PM </td>
        </tr>
        <tr class="even">
          <td class="group-members">
            <div> edahuron@umich.edu </div>
            <div> jschwab@umich.edu </div>
          </td>
          <td class="due-date"> Feb 20, 2019, 12:00:00 PM </td>
        </tr>
        <tr class="odd">
          <td class="group-members">
            <div> emiller@umich.edu </div>
            <div> beihla@umich.edu </div>
          </td>
          <td class="due-date"> Feb 20, 2019, 4:00:00 PM </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
  import { Project } from 'ag-client-typescript';
  import CreateSingleGroup from '@/components/edit_groups/create_single_group.vue';
  import EditSingleGroup from '@/components/edit_groups/edit_single_group.vue';
  import GroupLookup from '@/components/group_lookup.vue';
  import Toggle from '@/components/toggle.vue';
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
      GroupLookup,
      Toggle
    }
  })
  export default class CreateGroup extends Vue { // implements GroupObserver

    @Prop({required: true, type: Project})
    project!: Project;

    groups: Group[] = [];

    toggle_color = "hsl(210, 20%, 50%)";

    editing_existing_group = true;

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
@import '@/styles/button_styles.scss';
@import url('https://fonts.googleapis.com/css?family=Quicksand');
$current-lang-choice: 'Quicksand';

#component-toggle {
  padding: 10px 0 20px 0;
}

#edit-groups-component {
  margin-top: 10px;
  font-family: Quicksand;
}

.left {
  box-sizing: border-box;
  vertical-align: top;
  padding: 0 2.5% 50px 2.5%;
  min-width: 400px;
}

.right {
  box-sizing: border-box;
  padding: 0 2.5%;
}

.extensions-container {
  width: 100%;
}

/*.extensions-title {*/
/*  color: lighten(black, 25);*/
/*  font-size: 17px;*/
/*  font-weight: bold;*/
/*  margin: 0;*/
/*  padding: 3px 10px 8px 5px;*/
/*}*/

.extension-row {
  padding: 5px;
}

.extension-row span {
  padding-left: 100px;
}

.even {
  background-color: hsl(210, 20%, 96%);
}

.odd {
  background-color: white;
}

table {
  border-collapse: collapse;
  font-size: 16px;
  width: 100%;
}

th {
  padding:  8px 5px;
  font-weight: bold;
  color: lighten(black, 25);
  /*border-bottom: 2px solid hsl(210, 20%, 80%);*/
  border-bottom: 2px solid $grape;
  font-size: 17px;
}

.group-members {
  padding: 8px 100px 8px 5px;
  font-weight: 500;
  border-bottom: 1px solid hsl(210, 20%, 94%);
}

.due-date {
  padding: 8px 5px;
  vertical-align: top;
  border-bottom: 1px solid hsl(210, 20%, 94%);
}


@media only screen and (min-width: 681px) {

  #component-toggle {
    padding: 10px 0 20px 0;
  }

  #edit-groups-component {
    margin-top: 10px;
    font-family: Quicksand;
  }

  /*.edit-side-title {*/
  /*  color: lighten(black, 25);*/
  /*  font-size: 16px;*/
  /*  font-weight: bold;*/
  /*  margin: 0;*/
  /*  padding: 3px 10px 24px 0;*/
  /*  display: inline-block;*/
  /*  vertical-align: top;*/
  /*}*/

  .left {
    width: 50%;
    display: inline-block;
    box-sizing: border-box;
    vertical-align: top;
  }

  .right {
    width: 50%;
    box-sizing: border-box;
    display: inline-block;
    padding: 0 2.5%;
  }

  .extensions-container {
    width: 100%;
  }

  .extensions-title {
    color: lighten(black, 25);
    font-size: 17px;
    font-weight: bold;
    margin: 0;
    padding: 3px 10px 8px 5px;
  }

  .extension-row {
    padding: 5px;
  }

  .extension-row span {
    padding-left: 100px;
  }

  .even {
    background-color: hsl(210, 20%, 96%);
  }

  .odd {
    background-color: white;
  }
}

</style>
