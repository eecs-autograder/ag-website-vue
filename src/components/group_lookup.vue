<template>
  <div id="group-lookup-component">
    <div class="search-bar-label"> Search groups: </div>
    <div class="group-lookup-search-bar">
      <dropdown-typeahead ref="group_typeahead"
                          placeholder_text="Enter a username or name of an individual"
                          :choices="d_groups"
                          @update_item_chosen="$emit('update_group_selected', $event)"
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
  </div>
</template>

<script lang="ts">
  import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
  import ValidatedInput from '@/components/validated_input.vue';
  import { Project } from 'ag-client-typescript';
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

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
      DropdownTypeahead,
      ValidatedInput
    }
  })
  export default class GroupLookup extends Vue {

    @Prop({required: true, type: Array})
    groups!: Group[];

    @Prop({required: true, type: Project})
    project!: Project;

    d_groups: Group[] = [];

    @Watch('groups')
    on_groups_changed(new_groups: Group[], old_groups: Group[]) {
      this.d_groups = new_groups.slice(0);
    }

    async created() {
      // are the groups going to be sorted by the first member name? Or do I need to do that here?
      this.d_groups = this.groups.slice(0);
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

#group-lookup-component {
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

</style>
