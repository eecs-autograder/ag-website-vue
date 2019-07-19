<template>
  <div>

    <modal ref="confirm_accept_modal" size="medium">
      <div class="modal-header"> Confirm Accept </div>
      <hr>
      <div class="modal-body">
        <div class="modal-message">
          Are you sure you want to <b>accept</b> the invitation for a group with:
          <ul>
            <li> Person 1 </li>
            <li> Person N </li>
          </ul>
        </div>
        <div class="modal-button-container">
          <button class="light-gray-button cancel-button"
                  @click=""> Cancel </button>
          <button class="blue-button"
                  @click="accept_invitation"> Accept </button>
        </div>
      </div>
    </modal>

    <modal ref="confirm_reject_modal" size="medium">
      <div class="modal-header"> Confirm Reject </div>
      <hr>
      <div class="modal-body">
        <div class="modal-message">
          Are you sure you want to <b>reject</b> the invitation for a group with:
          <ul>
            <li> Person 1 </li>
            <li> Person N </li>
          </ul>
        </div>
        <div class="modal-button-container">
          <button class="light-gray-button cancel-button"
                  @click=""> Cancel </button>
          <button class="red-button"
                  @click="reject_invitation"> Reject </button>
        </div>
      </div>
    </modal>

  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { GroupInvitation } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import { handle_api_errors_async } from '@/utils';

@Component({
  components: {
    APIErrors,
    Modal
  }
})
export default class InvitationReceived extends Vue {
  @Prop({required: true, type: GroupInvitation})
  invitation!: GroupInvitation;

  async reject_invitation() {
    console.log("Reject invitation");
    await this.invitation.reject();
  }

  @handle_api_errors_async(handle_accept_invitation_error)
  async accept_invitation() {
    console.log("Accept invitation");
    await this.invitation.accept();
  }
}

function handle_accept_invitation_error(component: InvitationReceived, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}

</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';

.modal-header {
  font-size: 20px;
  font-weight: bold;
}
</style>
