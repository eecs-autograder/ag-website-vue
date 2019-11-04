<template>
  <div class="group-members-container">
    <div class="group-members-title">
      <template v-if="group.member_names.length > 1">
        Group members
      </template>
      <template v-else>
        Student
      </template>
    </div>
    <div v-for="(member, index) of group.member_names" :key="member">
      <div :class="['group-member',
                    {'odd-row': index % 2 !== 0}]">
        {{member}}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Group } from 'ag-client-typescript';

@Component({})
export default class GroupMembers extends Vue {
  @Prop({required: true, type: Group})
  group!: Group;
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.group-members-container {
  margin-bottom: 20px;
  border: 2px solid $pebble-medium;
  border-radius: 3px;
  max-width: 500px;


  .group-members-title {
    padding: 14px 15px 14px 15px;
    font-weight: bold;
    background-color: $white-gray;
  }

  .group-member {
    font-size: 1rem;
    padding: 12px 15px 12px 15px;
  }

  .odd-row {
    background-color: $white-gray;
  }
}

</style>
