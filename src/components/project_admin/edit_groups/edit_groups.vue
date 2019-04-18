<template>
  <div id="edit-groups-component" v-if="!d_loading">

    <div class="create-group-bar">
      <button class="create-group-button"
              @click="$refs.create_group_modal.open()"> Create New Group
      </button>
    </div>

    <div class="edit-group-container">
        <div class="edit-title"> Edit Group </div>
        <group-lookup :groups="groups"
                      :project="project"
                      @update_group_selected="update_group_selected"> </group-lookup>
        <edit-single-group v-if="selected_group !== null"
                           :project="project"
                           :group="selected_group">
        </edit-single-group>
    </div>
    <div class="extensions-container">
      <table class="extensions-table">
        <tr>
          <th> Extensions </th>
          <th> </th>
        </tr>
        <tr v-for="(group, index) of groups_with_extensions"
            :class="index % 2 === 0 ? 'even' : 'odd'"
            v-if="group.extended_due_date !== null">
          <td class="group-members">
            <div v-for="member_name of group.member_names">{{member_name}}</div>
          </td>
        <td class="due-date">
          {{new Date(group.extended_due_date).toLocaleString('en-US', extended_due_date_format)}}
        </td>
        </tr>
      </table>
      <div v-if="groups_with_extensions.length === 0">
        No extensions have been issued for this project.
      </div>
    </div>

    <modal ref="create_group_modal"
           click_outside_to_close
           size="medium">
      <div class="modal-header"> Creating a New Group </div>
      <hr>
      <div class="modal-body">
        <create-single-group :project="project"> </create-single-group>
      </div>
    </modal>

  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import GroupLookup from '@/components/group_lookup.vue';
  import Modal from '@/components/modal.vue';
  import CreateSingleGroup from '@/components/project_admin/edit_groups/create_single_group.vue';
  import EditSingleGroup from '@/components/project_admin/edit_groups/edit_single_group.vue';
  import Toggle from '@/components/toggle.vue';

  import { array_remove_unique, deep_copy } from "@/utils";
  import { Group, Project } from 'ag-client-typescript';

  @Component({
    components: {
      CreateSingleGroup,
      EditSingleGroup,
      GroupLookup,
      Modal,
      Toggle
    }
  })
  export default class EditGroups extends Vue { // implements GroupObserver

    // get the course to get the domain?

    @Prop({required: true, type: Project})
    project!: Project;

    d_loading = true;

    groups: Group[] = [];

    toggle_color = "hsl(210, 20%, 50%)";

    selected_group: Group | null = null;

    groups_with_extensions: Group[] = [];

    extended_due_date_format = {year: 'numeric', month: 'short', day: 'numeric',
                                hour: 'numeric', minute: 'numeric', second: 'numeric'};

    async created() {
      this.groups = await Group.get_all_from_project(this.project.pk);
      this.groups_with_extensions = this.groups.filter(group => group.extended_due_date !== null);
      this.groups_with_extensions.sort((group_a: Group, group_b: Group) => {
        if (group_a.extended_due_date! <= group_b.extended_due_date!) {
          return -1;
        }
        return 1;
      });
      this.d_loading = false;
      this.groups_with_extensions.sort(this.extension_sort);
    }

    mounted() {
      Group.subscribe(this);
    }

    beforeDestroy() {
      Group.unsubscribe(this);
    }

    update_group_selected(group: Group) {
      let deep_copy_of_group: Group = new Group(group);
      this.selected_group = deep_copy_of_group;
      console.log("update group selected argument type: " + group.constructor.name);
      console.log("Selected Group type: " + deep_copy_of_group.constructor.name);
    }

    update_group_created(group: Group): void {
      let deep_copy_of_group = new Group(group);
      let index_to_insert = this.groups.findIndex(
        (group_a) => deep_copy_of_group.member_names[0].localeCompare(group_a.member_names[0]) <= 0
      );
      this.groups.splice(index_to_insert, 0, deep_copy_of_group);
      this.selected_group = deep_copy_of_group;
      (<Modal> this.$refs.create_group_modal).close();
    }

    update_group_changed(group: Group): void {
      let deep_copy_of_group = new Group({
        pk: group.pk,
        project: group.project,
        extended_due_date: group.extended_due_date,
        member_names: [],
        bonus_submissions_remaining: group.bonus_submissions_remaining,
        late_days_used: group.late_days_used,
        num_submissions: group.num_submissions,
        num_submits_towards_limit: group.num_submits_towards_limit,
        created_at: group.created_at,
        last_modified: group.last_modified
      });
      for (let i = 0; i < group.member_names.length; ++i) {
        deep_copy_of_group.member_names.push(deep_copy(group.member_names[i]));
      }

      let current_index = this.groups.findIndex((item: Group) => item.pk === group.pk);
      let old_extension = this.groups[current_index].extended_due_date;
      this.groups.splice(current_index, 1);
      let new_index = this.groups.findIndex(
        (group_a) => group.member_names[0].localeCompare(group_a.member_names[0]) <= 0
      );
      this.groups.splice(new_index, 0, deep_copy_of_group);

      // EXTENSIONS
      if (old_extension !== null) {
        array_remove_unique(this.groups_with_extensions, group.pk,
                            (group_a: Group, pk) => group_a.pk === pk
        );
      }
      if (group.extended_due_date !== null) {
        this.groups_with_extensions.push(deep_copy_of_group);
        this.groups_with_extensions.sort(this.extension_sort);
        // let index_to_insert_at = this.groups_with_extensions.findIndex(
        //   (group_a) =>
        //     group_a.extended_due_date!.localeCompare(group.extended_due_date!) > 0
        //     || (group_a.extended_due_date!.localeCompare(group.extended_due_date!) === 0
        //         && group_a.member_names[0].localeCompare(group.member_names[0]) > 0)
        // );
        // console.log("Index to insert at " + index_to_insert_at);
        // this.groups_with_extensions.splice(index_to_insert_at, 0, deep_copy_of_group);
      }
    }

    extension_sort(group_a: Group, group_b: Group) {
      if (group_a.extended_due_date! < group_b!.extended_due_date!) {
        return -1;
      }
      else if (group_a.extended_due_date! > group_b.extended_due_date!) {
        return 1;
      }
      else {
        if (group_a.member_names[0] < group_b.member_names[0]) {
          return -1;
        }
        return 1;
      }
    }

    update_group_merged(group: Group): void {
      console.log("Merging not implemented in UI yet");
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

.edit-title {
  color: lighten(black, 25);
  font-size: 19px;
  font-weight: bold;
  margin: 0;
  padding: 12px 0;
}

#edit-groups-component {
  box-sizing: border-box;
  font-family: Quicksand;
}

.edit-group-container {
  box-sizing: border-box;
  vertical-align: top;
  padding: 10px 10px 50px 10px;
}

.extensions-container {
  box-sizing: border-box;
  padding: 10px 10px 50px 10px;
}

.extensions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
}

.even {
  background-color: hsl(210, 20%, 96%);
}

.odd {
  background-color: white;
}

th {
  padding:  12px 0;
  font-weight: bold;
  color: lighten(black, 25);
  font-size: 19px;
}

.group-members {
  padding: 10px 20px 10px 10px;
  font-weight: 500;
  border-bottom: 1px solid hsl(210, 20%, 94%);
}

.due-date {
  padding: 10px;
  vertical-align: top;
  border-bottom: 1px solid hsl(210, 20%, 94%);
  text-align: right;
  width: 177px;
}

.create-group-bar {
  width: 100%;
  background-color: hsl(220, 30%, 30%);
  padding: 10px;
  position: relative;
  text-align: right;
  box-sizing: border-box;
}

.extensions-container {
  width: 100%;
}

/**** Modal *******************************************************************/

.modal-header {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  padding: 5px 0;
}

.modal-body {
  padding: 10px 0 0 0;
}

.create-group-button {
  @extend .green-button;
  font-size: 16px;
  font-family: $current-lang-choice;
}

.create-group-button:disabled {
  @extend .gray-button;
}

@media only screen and (min-width: 881px) {

  .extensions-table {
    border-collapse: collapse;
    font-size: 16px;
  }

  .edit-group-container {
    width: 50%;
    display: inline-block;
    vertical-align: top;
    padding: 10px 5% 0 1.5%;
  }

  .extensions-container {
    width: 50%;
    display: inline-block;
    padding: 10px 1.5% 0 1.5%;
  }

  .create-group-bar {
    width: 100%;
    background-color: hsl(220, 30%, 30%);
    padding: 10px;
    position: relative;
    text-align: right;
    box-sizing: border-box;
  }
}

</style>
