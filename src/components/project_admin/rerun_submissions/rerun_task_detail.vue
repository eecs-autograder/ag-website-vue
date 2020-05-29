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
        {{task.progress}}%
        <i v-if="task.progress !== 100"
            @click="refresh_task(task)"
            class="refresh-icon fas fa-sync-alt"></i>
      </template>
    </td>
    <td v-if="task.progress !== 100 && !task.has_error && !task.is_cancelled">
      <button type="button"
              ref="show_stop_task_modal"
              class="orange-button cancel-button"
              @click="d_show_cancel_modal = true">
        Cancel
      </button>
    </td>

    <modal v-if="d_show_cancel_modal"
           size="large"
           ref="cancel_task_modal"
           @close="d_show_cancel_modal = false"
           :click_outside_to_close="!d_cancelling"
           :include_closing_x="!d_cancelling">
      <div class="modal-header">
        Stop Rerun
      </div>
      <div class="modal-button-footer">
        <button type="button"
                data-testid="stop_task_button"
                class="orange-button"
                :disabled="d_cancelling"
                @click="cancel_task">
          Stop Task
        </button>
        <button type="button"
                class="white-button"
                :disabled="d_cancelling"
                @click="d_show_cancel_modal = false">
          Go Back
        </button>
      </div>
      <APIErrors ref="api_errors"></APIErrors>
    </modal>
  </tr>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import * as ag_cli from 'ag-client-typescript';

import APIErrors from "@/components/api_errors.vue";
import Modal from '@/components/modal.vue';
import Tooltip from '@/components/tooltip.vue';
import { SYSADMIN_CONTACT } from '@/constants';
import { handle_api_errors_async, handle_global_errors_async, make_error_handler_func } from '@/error_handling';
import { format_datetime, safe_assign, toggle } from '@/utils';

@Component({
  components: {
    APIErrors,
    Modal,
    Tooltip,
  }
})
export default class RerunTaskDetail extends Vue {
  @Prop({required: true, type: ag_cli.RerunSubmissionTask})
  task!: ag_cli.RerunSubmissionTask;

  d_show_cancel_modal = false;
  d_cancelling = false;

  readonly format_datetime = format_datetime;
  readonly SYSADMIN_CONTACT = SYSADMIN_CONTACT;

  @handle_global_errors_async
  async refresh_task(task: ag_cli.RerunSubmissionTask) {
    let refreshed = await ag_cli.RerunSubmissionTask.get_by_pk(task.pk);
    safe_assign(task, refreshed);
  }

  @handle_api_errors_async(make_error_handler_func())
  cancel_task() {
    return toggle(this, 'd_cancelling', async () => {
        await this.task.cancel();
        this.d_show_cancel_modal = false;
    });
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';
@import '@/styles/modal.scss';

.refresh-icon {
  cursor: pointer;
}

.progress-cell {
  margin-left: 1rem;
}

.orange-button.cancel-button {
  padding: .125rem .375rem;
  font-size: .875rem;
}
</style>
