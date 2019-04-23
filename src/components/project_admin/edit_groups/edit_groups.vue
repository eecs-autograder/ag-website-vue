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
            <div v-for="member_name of group.member_names">{{member_name}}</div>
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
      <div class="modal-header"> Merging existing groups </div>
      <hr>
      <div class="modal-body"> </div>
    </modal>

    <div class="button-footer">
      <button class="create-group-button"
              @click="$refs.create_group_modal.open()"> Create New Group
      </button>

      <button class="merge-groups-button"
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

  @Prop({required: true, type: Project})
  project!: Project;

  d_loading = true;
  extended_due_date_format = {year: 'numeric', month: 'short', day: 'numeric',
                              hour: 'numeric', minute: 'numeric', second: 'numeric'};
  groups: Group[] = [];
  groups_with_extensions: Group[] = [];
  selected_group: Group | null = null;
  toggle_color = "hsl(210, 20%, 50%)";

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
    });
  }

  update_group_created(group: Group): void {
    let deep_copy_of_group = new Group(group);
    let index_to_insert = this.groups.findIndex(
      (group_a) => group_a.member_names[0].localeCompare(group.member_names[0]) > 0
    );
    index_to_insert = index_to_insert < 0 ? this.groups.length : index_to_insert;
    this.groups.splice(index_to_insert, 0, deep_copy_of_group);
    this.selected_group = deep_copy_of_group;
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

  update_group_merged(group: Group): void { }
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
  vertical-align: top;
  padding: 10px 10px 50px 10px;
}

.extensions-container {
  box-sizing: border-box;
  padding: 10px 10px 64px 10px;
}

.extensions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
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

.extension-date {
  padding: 10px;
  vertical-align: top;
  border-bottom: 1px solid hsl(210, 20%, 94%);
  text-align: right;
  width: 200px;
}

.extensions-container {
  width: 100%;
}

.button-footer {
  width: 100%;
  min-width: 370px;
  background-color: hsl(210, 20%, 96%);
  border-top: 1px solid hsl(210, 20%, 94%);
  padding: 10px 10px 10px 10px;
  position: fixed;
  text-align: center;
  bottom: 0;
  box-sizing: border-box;
}

.merge-groups-button {
  @extend .teal-button;
  margin-left: 15px;
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
  padding: 10px 0 0 0;
  min-width: 200px;
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
    width: 50%;
    display: inline-block;
    padding: 10px 5% 0 1.5%;
  }

  .extensions-container {
    width: 50%;
    display: inline-block;
    padding: 10px 1.5% 30px 1.5%;
  }
}

</style>
