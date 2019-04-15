<template>
  <div id="edit-groups-component" v-if="!d_loading">
    <div class="left">

      <div id="component-toggle">
        <Toggle v-model="editing_existing_group"
                :active_background_color="toggle_color">
          <div slot="on">
            <p class="toggle-on">{{editing_existing_group
                                   ? 'Editing existing group' : 'Edit existing group'}}</p>
          </div>
          <div slot="off">
            <p class="toggle-off">{{editing_existing_group
                                    ? 'Create new group' : 'Creating new group'}} </p>
          </div>
        </Toggle>
      </div>

      <div v-if="editing_existing_group">
        <group-lookup :groups="groups"
                      :project="project"
                      @update_group_selected="update_group_selected"> </group-lookup>
        <edit-single-group v-if="selected_group !== null"
                           :project="project"
                           :group="selected_group">
        </edit-single-group>
      </div>
      <div v-else>
        <create-single-group :project="project"> </create-single-group>
      </div>
    </div>
    <div class="right">
      <table class="extensions-container">
        <tr>
          <th> Extensions</th>
          <th> </th>
        </tr>
        <tr v-for="(group, index) of groups"
            :class="index % 2 === 0 ? 'even' : 'odd'">
<!--            v-if="group.extended_due_date !== null">-->
          <td class="group-members">
            <div v-for="member_name of group.member_names">
              {{member_name}}
            </div>
          </td>
        <td class="due-date"> {{group.bonus_submissions_remaining}}  __Feb 20, 2019, 4:00:00 PM </td>
<!--          {{group.extended_due_date}}-->
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
  import { Group, Project } from 'ag-client-typescript';
  import CreateSingleGroup from '@/components/edit_groups/create_single_group.vue';
  import EditSingleGroup from '@/components/edit_groups/edit_single_group.vue';
  import GroupLookup from '@/components/group_lookup.vue';
  import Toggle from '@/components/toggle.vue';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
    components: {
      CreateSingleGroup,
      EditSingleGroup,
      GroupLookup,
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

    editing_existing_group = true;

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
      console.log("Update group selected: " + this.selected_group.member_names);
      console.log("Update selected: " + this.selected_group.bonus_submissions_remaining);
    }

    update_group_created(group: Group): void {
      this.groups.push(group);
    }

    update_group_changed(group: Group): void {
      console.log("update_group_changed bonus to: " + group.bonus_submissions_remaining);
      let index = this.groups.findIndex((item: Group) => item.pk === group.pk);
      Vue.set(this.groups, index, group);
      // this.groups = await Group.get_all_from_project(this.project.pk);
      // member names could have been added/removed
      // extended due date could have changed
      // bonus_submissions_remaining could have changed.
      // find group
      // update group ? people could have been removed or added
      // or an extension could have been granted redacted
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
