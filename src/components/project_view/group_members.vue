<template>
  <table class="group-members-container" cellpadding="0">
    <tr>
      <td class="header-cell">
        <template v-if="group.member_names.length > 1">
          Group members
        </template>
        <template v-else>
          Student
        </template>
      </td>
      <td v-if="show_late_days" class="header-cell">
        Late Day Tokens
      </td>
    </tr>
    <tr v-for="(member, index) of group.member_names"
        :key="member"
        :class="{'odd-row': index % 2 !== 0}">
      <td ref="member_name" data-testid="member_name" class="body-cell">
        {{member}}
      </td>
      <td ref="late_days" data-testid="late_days"
          class="body-cell" v-if="member in d_late_day_totals">
        {{d_late_day_totals[member]}}
      </td>
    </tr>
  </table>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';

import { Group, User } from 'ag-client-typescript';

import { GlobalData } from '@/app.vue';
import { handle_global_errors_async } from '@/error_handling';

@Component({})
export default class GroupMembers extends Vue {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  @Prop({required: true, type: Group})
  group!: Group;

  @Prop({default: false, type: Boolean})
  include_late_day_totals!: boolean;

  d_late_day_totals: {[username: string]: number} = {};

  created() {
    return this.load_late_days();
  }

  @Watch('group')
  on_group_changed(new_group: Group, old_group: Group) {
    return this.load_late_days();
  }

  @handle_global_errors_async
  private async load_late_days() {
    if (!this.show_late_days) {
      return;
    }
    let new_totals: {[username: string]: number} = {};
    for (let member_name of this.group.member_names) {
      let response = await User.get_num_late_days(this.d_globals.current_course!.pk, member_name);
      new_totals[member_name] = response.late_days_remaining;
    }
    this.d_late_day_totals = new_totals;
  }

  private get show_late_days() {
    return this.include_late_day_totals && this.d_globals.current_course!.num_late_days !== 0;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.group-members-container {
  border-collapse: collapse;

  border: 2px solid $pebble-medium;
  border-radius: 3px;
  width: 100%;
  max-width: 500px;

  .header-cell {
    padding: .625rem;
    font-weight: bold;
    background-color: $white-gray;
  }

  .body-cell {
    font-size: 1rem;
    padding: .5rem;
  }

  .odd-row {
    background-color: $white-gray;
  }
}

</style>
