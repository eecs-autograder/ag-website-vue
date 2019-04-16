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
        <tr v-for="(group, index) of groups"
            :class="index % 2 === 0 ? 'even' : 'odd'"
            v-if="group.extended_due_date !== null">
          <td class="group-members">
            <div v-for="member_name of group.member_names">{{member_name}}</div>
          </td>
        <td class="due-date">{{group.extended_due_date}}</td>
        </tr>
      </table>
      <div>No extensions have been issued yet.</div>
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
  import { Group, Project } from 'ag-client-typescript';
  import CreateSingleGroup from '@/components/project_admin/edit_groups/create_single_group.vue';
  import EditSingleGroup from '@/components/project_admin/edit_groups/edit_single_group.vue';
  import GroupLookup from '@/components/group_lookup.vue';
  import Modal from '@/components/modal.vue';
  import Toggle from '@/components/toggle.vue';
  import { Component, Prop, Vue } from 'vue-property-decorator';

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

    async created() {
      this.groups = await Group.get_all_from_project(this.project.pk);
      this.d_loading = false;
    }

    mounted() {
      Group.subscribe(this);
    }

    beforeDestroy() {
      Group.unsubscribe(this);
    }

    update_group_selected(group: Group) {
      this.selected_group = group;
    }

    update_group_created(group: Group): void {
      let index_to_insert = this.find_first_group_greater_than(group);
      this.groups.splice(index_to_insert, 0, group);
      this.selected_group = group;
      (<Modal>this.$refs.create_group_modal).close();
    }

    update_group_changed(group: Group): void {
      for (let member of group.member_names) {
        console.log(member);
      }

      let current_index = this.groups.findIndex((item: Group) => item.pk === group.pk);
      let new_index = this.groups.length;
      if (this.groups[current_index].member_names.length === group.member_names.length
          && this.groups[current_index].member_names[0].localeCompare(group.member_names[0]) === 0) {
        new_index = current_index;
      }

      if (new_index !== current_index) {
        new_index = this.find_first_group_greater_than(group);
      }

      if (new_index !== current_index) {
        this.groups.splice(current_index, 1);
        new_index = current_index < new_index ? new_index - 1 : new_index;
        this.groups.splice(new_index, 0, group);
      }
      this.groups[new_index].member_names = group.member_names.slice(0);
      this.groups[new_index].extended_due_date = group.extended_due_date;
      this.groups[new_index].bonus_submissions_remaining = group.bonus_submissions_remaining;
    }

    update_group_merged(group: Group): void {
      console.log("Merging not implemented in UI yet");
    }

    find_first_group_greater_than(group: Group): number {
      let index = this.groups.length;
      for (let i = 0; i < this.groups.length; ++i) {
        if (group.member_names[0].localeCompare(this.groups[i].member_names[0]) <= 0) {
          index = i;
          console.log("The first index greater than " + group.member_names[0] + " is " + index);
          break;
        }
      }
      return index;
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

table {
  border-collapse: collapse;
  font-size: 16px;
}

th {
  padding:  12px 0;
  font-weight: bold;
  color: lighten(black, 25);
  font-size: 19px;
}

.group-members {
  padding: 10px 100px 10px 10px;
  font-weight: 500;
  border-bottom: 1px solid hsl(210, 20%, 94%);
}

.due-date {
  padding: 10px;
  vertical-align: top;
  border-bottom: 1px solid hsl(210, 20%, 94%);
  text-align: right;
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
