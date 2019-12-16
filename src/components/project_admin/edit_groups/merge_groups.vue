<template>
  <div id="merge-groups-component">
    <div class="merge-groups-container">
      <div class="form-field-wrapper">
        <div class="label"> Group 1 </div>
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
      <div class="spacer"></div>
      <div class="form-field-wrapper">
        <div class="label"> Group 2 </div>
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
    <div class="modal-button-footer">
      <button id="merge-groups-button"
              @click="merge_groups"
              type="button"
              :disabled="group_1 === null || group_2 === null || d_merging">
        Merge Groups
      </button>
    </div>
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
@import "@/styles/forms.scss";

.merge-groups-container {
  display: flex;
  flex-wrap: wrap;

  .form-field-wrapper {
    flex-grow: 1;
  }
}

.spacer {
  width: 2rem;
  height: 0;
}

.group-members {
  border: 1px solid darken(lavender, 3);
  background-color: lavender;
  margin: .625rem 0;
  padding-top: .5rem;
  border-radius: 2px;
}

.group-member {
  padding: 0 .625rem .5rem .625rem;
  font-size: 1rem;
}

#merge-groups-button {
  @extend .green-button;
}
</style>
