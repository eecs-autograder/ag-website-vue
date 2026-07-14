<template>
  <tr ref="task_row">
    <td class="started-at-cell">{{format_datetime(task.created_at)}}</td>
    <td class="progress-cell">
      <template v-if="task.has_error">
        ERROR
        <tooltip placement="top" width="large">
          An unexpected error occurred. Please contact <b>{{SYSADMIN_CONTACT}}</b>
          and include the information <b>"Rerun task ID: {{task.pk}}"</b> in your email.
        </tooltip>
      </template>
      <template v-else-if="task.is_cancelled">
        Cancelled
      </template>
      <template v-else>
        <span class="progress-value" role="status">{{task.progress}}%</span>
        <button v-if="task.progress !== 100"
                type="button"
                class="refresh-button"
                aria-label="Refresh task progress"
                @click="refresh_task(task)">
          <i class="fas fa-sync-alt" aria-hidden="true"></i>
        </button>
        <button v-if="task.progress !== 100"
                type="button"
                class="orange-button cancel-button"
                @click="$emit('request-cancel', task)">
          Cancel
        </button>
      </template>
    </td>
  </tr>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import * as ag_cli from 'ag-client-typescript';

import Tooltip from '@/components/tooltip.vue';
import { SYSADMIN_CONTACT } from '@/constants';
import { handle_global_errors_async } from '@/error_handling';
import { format_datetime, safe_assign } from '@/utils';

@Component({
  components: {
    Tooltip,
  }
})
export default class RerunTaskDetail extends Vue {
  @Prop({required: true, type: ag_cli.RerunSubmissionTask})
  task!: ag_cli.RerunSubmissionTask;

  readonly format_datetime = format_datetime;
  readonly SYSADMIN_CONTACT = SYSADMIN_CONTACT;

  @handle_global_errors_async
  async refresh_task(task: ag_cli.RerunSubmissionTask) {
    let refreshed = await ag_cli.RerunSubmissionTask.get_by_pk(task.pk);
    safe_assign(task, refreshed);
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';

.refresh-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: inherit;
  font-size: inherit;
  margin-left: 1rem
}

.started-at-cell,
.progress-cell {
  line-height: 1.75;
}

.progress-cell {
  margin-left: 1rem;
}

.progress-value {
  display: inline-block;
  text-align: right;

  &::before {
    content: '100%';
    display: block;
    max-height: 0;
    overflow: hidden;
    visibility: hidden;
  }
}

.orange-button.cancel-button {
  padding: .125rem .375rem;
  font-size: .875rem;
  margin-left: 4rem;
}
</style>
