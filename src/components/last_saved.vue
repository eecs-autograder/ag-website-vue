<template>
  <div class="last-saved-timestamp">
    <i v-if="saving" class=" loading fa fa-spinner fa-pulse"></i>
    <template v-else>
      Last saved: {{short ? format_datetime_short(last_modified) : format_datetime(last_modified)}}
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { format_datetime, format_datetime_short } from '@/utils';

@Component
export default class LastSaved extends Vue {
  @Prop({required: true, type: String})
  last_modified!: string;

  @Prop({default: false, type: Boolean})
  saving!: boolean;

  @Prop({default: true, type: Boolean})
  short!: boolean;

  readonly format_datetime = format_datetime;
  readonly format_datetime_short = format_datetime_short;
}
</script>

<style scoped lang="scss">
@import '@/styles/forms.scss';
@import '@/styles/loading.scss';

.last-saved-timestamp {
  @extend %last-saved-timestamp;
}
</style>
