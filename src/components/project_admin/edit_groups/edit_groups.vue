<template>
  <div id="edit-groups-component" v-if="!d_loading">
    <div class="edit-group-container">
      <div class="edit-limits">
        <div class="edit-title"> Edit Existing Group </div>
        <group-lookup ref="group_lookup"
                      :groups="groups"
                      :project="project"
                      @update_group_selected="update_group_selected"> </group-lookup>
        <edit-single-group v-if="selected_group !== null"
                           :project="project"
                           :group="selected_group">
        </edit-single-group>
      </div>
    </div>
    <div class="extensions-container">
      <table class="extensions-table">
        <tr>
          <th> Extensions </th>
          <th> </th>
        </tr>
        <tr v-for="(group, index) of groups_with_extensions"
            :class="index % 2 === 0 ? 'even-row' : 'odd-row'"
            v-if="group.extended_due_date !== null">
          <td class="group-members">
            <div v-for="(member_name, index) of group.member_names"
                 :class="{'space-out-members' : index !== group.member_names.length - 1}">
              {{member_name}}
            </div>
          </td>
          <td class="extension-date">
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

    <modal ref="merge_groups_modal"
           click_outside_to_close
           size="large">
      <div class="modal-header"> Choose groups to merge: </div>
      <hr>
      <div class="modal-body">
        <merge-groups :project="project"
                      :groups="groups">
        </merge-groups>
      </div>
    </modal>

    <div class="button-footer">
      <button class="create-group-button"
              type="button"
              @click="$refs.create_group_modal.open()"> Create New Group
      </button>

      <button class="merge-groups-button"
              type="button"
              :disabled="groups.length < 2"
              @click="$refs.merge_groups_modal.open()"> Merge Existing Groups
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import GroupLookup from '@/components/group_lookup.vue';
import Modal from '@/components/modal.vue';
import CreateSingleGroup from '@/components/project_admin/edit_groups/create_single_group.vue';
import EditSingleGroup from '@/components/project_admin/edit_groups/edit_single_group.vue';
import MergeGroups from '@/components/project_admin/edit_groups/merge_groups.vue';

import { array_remove_unique, deep_copy } from "@/utils";
import { Group, GroupObserver, Project } from 'ag-client-typescript';

@Component({
  components: {
    CreateSingleGroup,
    EditSingleGroup,
    GroupLookup,
    MergeGroups,
    Modal
  }
})
export default class EditGroups extends Vue implements GroupObserver {
  @Prop({required: true, type: Project})
  project!: Project;

  d_loading = true;
  extended_due_date_format = {year: 'numeric', month: 'short', day: 'numeric',
                              hour: 'numeric', minute: 'numeric'};
  groups: Group[] = [];
  groups_with_extensions: Group[] = [];
  selected_group: Group | null = null;

  async created() {
    this.groups = await Group.get_all_from_project(this.project.pk);
    this.groups_with_extensions = this.groups.filter(group => group.extended_due_date !== null);
    this.sort_groups_with_extensions();
    this.d_loading = false;
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
  }

  sort_groups_with_extensions() {
    this.groups_with_extensions.sort((group_a: Group, group_b: Group) => {
      let group_a_date = new Date(group_a.extended_due_date!);
      let group_b_date = new Date(group_b.extended_due_date!);
      if (group_a_date < group_b_date) {
        return -1;
      }
      else if (group_a_date > group_b_date) {
        return 1;
      }
      return group_a.member_names[0].localeCompare(group_b.member_names[0]);
    });
  }

  add_group(group: Group) {
    let deep_copy_of_group = new Group(group);
    let index_to_insert = this.groups.findIndex(
      (group_a) => group_a.member_names[0].localeCompare(group.member_names[0]) > 0
    );
    index_to_insert = index_to_insert < 0 ? this.groups.length : index_to_insert;
    this.groups.splice(index_to_insert, 0, deep_copy_of_group);
    this.selected_group = deep_copy_of_group;
  }

  delete_group(group_pk: number) {
    array_remove_unique(this.groups, group_pk,
                        (group_a: Group) => group_a.pk === group_pk);
    array_remove_unique(this.groups_with_extensions, group_pk,
                        (group_a: Group) => group_a.pk === group_pk);
  }

  update_group_created(group: Group): void {
    this.add_group(group);
    (<Modal> this.$refs.create_group_modal).close();
  }

  update_group_changed(group: Group): void {
    let deep_copy_of_group = deep_copy(group, Group);
    let current_index = this.groups.findIndex((item: Group) => item.pk === group.pk);
    let old_extension = this.groups[current_index].extended_due_date;
    this.groups.splice(current_index, 1);
    let new_index = this.groups.findIndex(
      (group_a) => group_a.member_names[0].localeCompare(group.member_names[0]) > 0
    );
    new_index = new_index === -1 ? this.groups.length : new_index;
    this.groups.splice(new_index, 0, deep_copy_of_group);
    if (old_extension !== null) {
      array_remove_unique(this.groups_with_extensions, group.pk,
                          (group_a: Group, pk) => group_a.pk === pk
      );
    }
    if (group.extended_due_date !== null) {
      this.groups_with_extensions.push(deep_copy_of_group);
      this.sort_groups_with_extensions();
    }
  }

  update_group_merged(group: Group, group1_pk: number, group2_pk: number): void {
    this.add_group(group);
    this.delete_group(group1_pk);
    this.delete_group(group2_pk);
    if (group.extended_due_date !== null) {
      this.groups_with_extensions.push(group);
      this.sort_groups_with_extensions();
    }
    (<Modal> this.$refs.merge_groups_modal).close();
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/edit_groups.scss';
#edit-groups-component {
  padding-bottom: 100px;
}

.edit-title {
  @extend .section-title;
  padding: 12px 0 12px 0;
}

#edit-groups-component {
  box-sizing: border-box;
}

.edit-group-container {
  box-sizing: border-box;
  min-width: 200px;
  padding: 10px 10px 50px 10px;
  vertical-align: top;
}

.extensions-container {
  box-sizing: border-box;
  padding: 10px 10px 64px 10px;
}

.extensions-table {
  border-collapse: collapse;
  font-size: 16px;
  width: 100%;
}

.even-row {
  background-color: hsl(210, 20%, 96%);
}

.odd-row {
  background-color: white;
}

th {
  @extend .section-title;
  padding: 12px 0;
}

.group-members {
  padding: 10px 20px 10px 10px;
  font-weight: 500;
  border-bottom: 1px solid hsl(210, 20%, 94%);
}

.space-out-members {
  padding-bottom: 5px;
}

.extension-date {
  border-bottom: 1px solid hsl(210, 20%, 94%);
  padding: 10px;
  text-align: right;
  vertical-align: top;
  width: 200px;
}

.extensions-container {
  width: 100%;
}

.button-footer {
  background-color: hsl(210, 20%, 96%);
  border-top: 1px solid hsl(210, 20%, 94%);
  bottom: 0;
  box-sizing: border-box;
  min-width: 370px;
  padding: 10px 10px 10px 10px;
  position: fixed;
  text-align: center;
  width: 100%;
}

.merge-groups-button {
  @extend .teal-button;
  margin-left: 15px;
}

.merge-groups-button:disabled {
  @extend .gray-button;
}

.create-group-button {
  @extend .teal-button;
}

/**** Modal *******************************************************************/
.modal-header {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  padding: 5px 0;
}

.modal-body {
  min-width: 200px;
  padding: 10px 0 0 0;
}

@media only screen and (min-width: 481px) {
  .button-footer {
    text-align: right;
  }
}

@media only screen and (min-width: 881px) {
  .extensions-table {
    border-collapse: collapse;
    font-size: 16px;
  }

  .edit-group-container {
    display: inline-block;
    padding: 10px 5% 0 1.5%;
    width: 50%;
  }

  .extensions-container {
    display: inline-block;
    padding: 10px 1.5% 30px 1.5%;
    width: 50%;
  }
}
</style>
