<template>
  <div id="student-lookup-component">
    <div class="search-bar-label"> Search groups: </div>
    <div class="group-lookup-search-bar">
      <dropdown-typeahead placeholder_text="Enter a username or name of an individual"
                          :choices="groups"
                          @update_item_chosen="group_selected = $event; $emit('update_group_selected', group_selected)"
                          :filter_fn="group_filter_fn">
        <template slot-scope="{item}">
          <span v-for="(member, index) of item.member_names">
            <span class="typeahead-row">
              {{member.full_name}}
              ({{member.username}}){{index === item.member_names.length - 1 ? "" : ", "}}
            </span>
          </span>
        </template>
      </dropdown-typeahead>
    </div>

    <div v-if="group_selected !== null" class="selected-group">
      <p class="group-members-label"> Group members: </p>
      <div class="group-members">
        <p v-for="member of group_selected.member_names" class="group-member">
          <span class="full-name">{{member.full_name}}</span>
          <span class="username">({{member.username}})</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
  import { Project } from 'ag-client-typescript';
  import { Component, Prop, Vue } from 'vue-property-decorator';

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
    components: {
      DropdownTypeahead
    }
  })
  export default class StudentLookup extends Vue {

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

    group5: Group = {
      pk: 5,
      project: 2,
      member_names: [
        {username: "acpickles@umich.edu", full_name: "Angelica Pickles"},
      ],
      extended_due_date: "no",
      num_submits_towards_limit: 0,
      num_submissions: 3,
      bonus_submissions_remaining: 0
    };

    group6: Group = {
      pk: 6,
      project: 2,
      member_names: [
        {username: "otto@umich.edu", full_name: "Otto Rocket"},
        {username: "reggie@umich.edu", full_name: "Regina Rocket"},
        {username: "samdull@umich.edu", full_name: "Sam Dullard"},
        {username: "twister@umich.edu", full_name: "Maurice Rodriguez"}
      ],
      extended_due_date: "no",
      num_submits_towards_limit: 0,
      num_submissions: 3,
      bonus_submissions_remaining: 0
    };

    group_selected: Group | null = null;

    @Prop({required: true, type: Project})
    project!: Project;

    groups: Group[] = [];

    async created() {
      // await project.get_groups();
      this.groups = [this.group1, this.group2, this.group3, this.group4, this.group5, this.group6];
      // are the groups going to be sorted by the first member name? Or do I need to do that here?
      // also, are only groups that have submitted showing up here?
    }

    group_filter_fn(item: Group, filter_text: string) {
      for (let i = 0; i < item.member_names.length; ++i) {
        if ((item.member_names[i].full_name.toLowerCase()).indexOf(filter_text.toLowerCase()) >= 0
         || item.member_names[i].username.indexOf(filter_text) >= 0) {
          return true;
        }
      }
      return false;
    }

  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import url('https://fonts.googleapis.com/css?family=Quicksand');

$current-lang-choice: 'Quicksand';

#student-lookup-component {
  width: 95%;
  margin: 0 2.5%;
  font-family: $current-lang-choice;
}

.search-bar-label {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  padding: 0 0 8px 0;
  color: lighten(black, 25);
}

.typeahead-row {
  font-family: $current-lang-choice;
  font-size: 15px;
  padding-right: 5px;
}

.selected-group {
  display: inline-block;
  margin-top: 10px;
  padding: 5px 10px 0 0;
  border-radius: 5px;
}

.group-members-label {
  color: lighten(black, 25);
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  padding: 3px 10px 13px 0;
  display: inline-block;
  vertical-align: top;
}

.group-members {
  display: inline-block;
}

.group-member {
  font-size: 16px;
  margin: 0 0 10px 0;
  padding: 3px 8px;
  background-color: hsl(212, 70%, 95%);
  font-weight: bold;
  border-radius: 5px;
  color: hsl(212, 50%, 20%);
}

.full-name {
  padding-right: 5px;
}

.username {}

</style>
