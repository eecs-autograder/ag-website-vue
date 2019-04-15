<template>
  <div id="group-lookup-component">
    <div class="group-lookup-search-bar">
      <dropdown-typeahead ref="group_typeahead"
                          placeholder_text="Enter a username"
                          :choices="d_groups"
                          @update_item_chosen="$emit('update_group_selected', $event)"
                          :filter_fn="group_filter_fn">
        <template slot-scope="{item}">
          <span v-for="(member, index) of item.member_names">
            <span class="typeahead-row">
              {{member}} {{item.bonus_submissions_remaining}} {{index === item.member_names.length - 1 ? "" : ", "}}
            </span>
          </span>
        </template>
      </dropdown-typeahead>
    </div>
  </div>
</template>

<script lang="ts">
import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import { Group } from 'ag-client-typescript';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  components: {
    DropdownTypeahead
  }
})
export default class GroupLookup extends Vue {

  @Prop({required: true, type: Array})
  groups!: Group[];

  d_groups: Group[] = [];

  @Watch('groups')
  on_groups_changed(new_groups: Group[], old_groups: Group[]) {
    this.d_groups = new_groups.slice(0);
  }

  created() {
    this.d_groups = this.groups.slice(0);
  }

  group_filter_fn(group: Group, filter_text: string) {
    for (let member_name of group.member_names) {
      if (member_name.toLowerCase().indexOf(filter_text.toLowerCase()) >= 0) {
        return true;
      }
    }
    return false;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.typeahead-row {
  font-size: 15px;
  padding-right: 5px;
}

</style>
