<template>
  <div id="group-lookup-component">
    <div class="group-lookup-search-bar">
      <dropdown-typeahead ref="group_typeahead"
                          placeholder_text="Enter a username"
                          :choices="groups"
                          @update_item_chosen="on_group_selected"
                          :filter_fn="group_filter_fn">
        <template slot-scope="{item}">
          <span v-for="(member, index) of item.member_names">
            <span class="typeahead-row">
              {{member}}{{index === item.member_names.length - 1 ? "" : ", "}}
            </span>
          </span>
        </template>
      </dropdown-typeahead>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Group } from 'ag-client-typescript';

import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import { Created } from '@/lifecycle';
import { get_query_param } from '@/utils';

@Component({
  components: {
    DropdownTypeahead
  }
})
export default class GroupLookup extends Vue implements Created {
  @Prop({required: true, type: Array})
  groups!: Group[];

  // When true, emits an update_group_selected event containing
  // the group specified by the "current_student_lookup" query param.
  @Prop({default: false, type: Boolean})
  initialize_from_url!: boolean;

  created() {
    if (this.initialize_from_url) {
      let requested_group_pk = get_query_param(this.$route.query, "current_student_lookup");
      if (requested_group_pk !== null) {
        this.on_group_selected(this.groups.find(group => group.pk === Number(requested_group_pk))!);
      }
    }
  }

  group_filter_fn(group: Group, filter_text: string) {
    for (let member_name of group.member_names) {
      if (member_name.toLowerCase().indexOf(filter_text.toLowerCase()) >= 0) {
        return true;
      }
    }
    return false;
  }

  on_group_selected(group: Group) {
    this.$emit('update_group_selected', group);
    this.$router.replace(
      {query: {...this.$route.query, current_student_lookup: group.pk.toString()}});
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.typeahead-row {
  font-size: .875rem;
  padding-right: .25rem;
}
</style>
