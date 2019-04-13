<template>
  <div id="group-lookup-component">
    <div class="search-bar-label"> Search groups: </div>
    <div class="group-lookup-search-bar">
      <dropdown-typeahead ref="group_typeahead"
                          placeholder_text="Enter a username"
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
  import { Group, Project } from 'ag-client-typescript';
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

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
      this.d_groups = this.groups.slice(0);
    }

    group_filter_fn(item: Group, filter_text: string) {
      for (let member_name of item.member_names) {
        if ((member_name.toLowerCase()).indexOf(filter_text.toLowerCase()) >= 0) {
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
