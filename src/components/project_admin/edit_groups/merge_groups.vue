<template>
  <div id="merge-groups-component">
    <div class="merge-groups-container">
      <div class="group-lookup-1">
        <div class="group-lookup-label"> Group 1: </div>
        <group-lookup ref="group_lookup"
                      :groups="available_groups"
                      @update_group_selected="group_1 = $event;">
        </group-lookup>
        <div class="group-members" v-if="group_1 !== null">
          <div v-for="member of group_1.member_names"
               class="group-member">
            {{member}}
          </div>
        </div>
      </div>

      <div class="group-lookup-2">
        <div class="group-lookup-label"> Group 2: </div>
        <group-lookup ref="group_lookup"
                      :groups="available_groups"
                      @update_group_selected="group_2 = $event;">
        </group-lookup>
        <div class="group-members" v-if="group_2 !== null">
          <div v-for="member of group_2.member_names"
               class="group-member">
            {{member}}
          </div>
        </div>
      </div>
    </div>

    <APIErrors ref="api_errors"> </APIErrors>
    <button id="merge-groups-button"
            @click="merge_groups"
            type="button"
            :disabled="group_1 === null || group_2 === null || d_merging">
      Merge Groups
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Group, Project } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import GroupLookup from '@/components/group_lookup.vue';
import ValidatedForm from '@/components/validated_form.vue';
import { handle_api_errors_async } from '@/utils';

@Component({
  components: {
    APIErrors,
    GroupLookup,
    ValidatedForm
  }
})
export default class MergeGroups extends Vue {
  @Prop({required: true, type: Project})
  project!: Project;

  @Prop({required: true, type: Array})
  groups!: Group[];

  group_1: Group | null = null;
  group_2: Group | null = null;
  d_merging = false;

  get available_groups() {
    if (this.group_1 === null && this.group_2 === null) {
      return this.groups;
    }
    else if (this.group_1 === null) {
      return this.groups.filter(group => group.pk !== this.group_2!.pk);
    }
    else if (this.group_2 === null) {
      return this.groups.filter(group => group.pk !== this.group_1!.pk);
    }
    return this.groups.filter(group => group.pk !== this.group_1!.pk
                                       && group.pk !== this.group_2!.pk);
  }

  @handle_api_errors_async(handle_merge_groups_error)
  async merge_groups() {
    try {
      this.d_merging = true;
      await this.group_1!.merge_groups(this.group_2!.pk);
    }
    finally {
      this.d_merging = false;
    }
  }
}

function handle_merge_groups_error(component: MergeGroups, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import "@/styles/button_styles.scss";

#merge-groups-button {
  @extend .green-button;
}

.group-lookup-label {
  margin-bottom: 7px;
}

.group-members {
  border: 1px solid darken(lavender, 3);
  background-color: lavender;
  display: inline-block;
  margin: 10px 0;
  padding: 8px 0 0 0;
  border-radius: 4px;
}

.group-member {
  padding: 0 10px 8px 10px;
  font-size: 16px;
}

.group-lookup-1, .group-lookup-2 {
  width: 50%;
  display: inline-block;
  box-sizing: border-box;
  vertical-align: top;
}

.group-lookup-1 {
  padding-right: 10px;
}

.group-lookup-2 {
  padding-left: 10px;
}

.merge-groups-container {
  padding: 0 0 24px 0;
}
</style>
