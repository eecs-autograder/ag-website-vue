<template>
  <div>
    <div class="invitation-received">
      <div class="invitation-header">
        <b>{{d_invitation.invitation_creator}}</b> has invited you to work together!
      </div>
      <div class="invitation-body">
        <table class="member-table">
          <tr class="table-header">
            <th class="table-cell"> Member Name </th>
            <th class="table-cell"> Status </th>
          </tr>
          <tr v-for="(username, index) of other_group_members">
            <td class="table-cell">{{username}}</td>
            <td class="table-cell">{{member_acceptance_status(username)}}</td>
          </tr>
        </table>
      </div>

      <div class="invitation-footer">
        <button ref="accept_invitation_button"
                class="green-button"
                :disabled="already_accepted || d_accepting"
                @click="d_show_confirm_accept_invitation_modal = true"> Accept </button>
        <button ref="reject_invitation_button"
                class="orange-button"
                @click="d_show_confirm_reject_invitation_modal = true"> Reject </button>
      </div>
    </div>

    <modal v-if="d_show_confirm_accept_invitation_modal"
           @close="d_show_confirm_accept_invitation_modal = false"
           ref="confirm_accept_modal"
           size="large"
           click_outside_to_close>
      <div class="modal-header"> Confirm Accept </div>
      Are you sure you want to <b>accept</b> the invitation for a group with:
      <ul class="list-of-usernames">
        <li v-for="(username, index) of other_group_members"
            class="username">
          {{username}}
        </li>
      </ul>
      <APIErrors ref="accept_invitation_api_errors"></APIErrors>
      <div class="modal-button-footer">
        <button ref="confirm_accept_button"
                class="green-button"
                :disabled="d_accepting"
                @click="accept_invitation"> Accept </button>
        <button ref="cancel_accept_button"
                class="white-button"
                @click="d_show_confirm_accept_invitation_modal = false">
          Cancel (Do Nothing)
        </button>
      </div>
    </modal>

    <modal v-if="d_show_confirm_reject_invitation_modal"
           @close="d_show_confirm_reject_invitation_modal = false"
           ref="confirm_reject_modal"
           size="large"
           click_outside_to_close>
      <div class="modal-header"> Confirm Reject </div>
      <div class="modal-body">
        <div class="modal-message">
          Are you sure you want to <b>reject</b> the invitation for a group with:
          <ul class="list-of-usernames">
            <li v-for="(username, index) of other_group_members"
                class="username">
              {{username}}
            </li>
          </ul>
        </div>
        <APIErrors ref="reject_invitation_api_errors"></APIErrors>
        <div class="modal-button-footer">
          <button ref="confirm_reject_button"
                  class="orange-button"
                  :disabled="d_rejecting"
                  @click="reject_invitation"> Reject </button>
          <button ref="cancel_reject_button"
                  class="white-button"
                  @click="d_show_confirm_reject_invitation_modal = false">
            Cancel (Do Nothing)
          </button>
        </div>
      </div>
    </modal>

  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';

import { Group, GroupInvitation, Project, User } from 'ag-client-typescript';

import { GlobalData } from '@/app.vue';
import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import { deep_copy, handle_api_errors_async } from '@/utils';

@Component({
  components: {
    APIErrors,
    Modal
  }
})
export default class InvitationReceived extends Vue {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  @Prop({required: true, type: GroupInvitation})
  value!: GroupInvitation;

  @Prop({required: true, type: Project})
  project!: Project;

  @Watch('value')
  on_value_changed(new_value: GroupInvitation, old_value: GroupInvitation) {
      this.d_invitation = deep_copy(new_value, GroupInvitation);
  }

  d_accepting = false;
  d_invitation: GroupInvitation | null = null;
  d_loading = true;
  d_rejecting = false;
  d_show_confirm_accept_invitation_modal = false;
  d_show_confirm_reject_invitation_modal = false;

  created() {
    this.d_invitation = deep_copy(this.value, GroupInvitation);
  }

  member_acceptance_status(username: string) {
    if (username === this.d_invitation!.invitation_creator) {
        return 'Sender';
    }
    return this.d_invitation!.invitees_who_accepted.findIndex(
       (name: string) => username === name) !== -1 ? 'Accepted' : 'Pending';
  }

  @handle_api_errors_async(handle_accept_invitation_error)
  async accept_invitation() {
    try {
      this.d_accepting = true;
      (<APIErrors> this.$refs.accept_invitation_api_errors).clear();
      await this.d_invitation!.accept();
      let copy_of_invitation = deep_copy(this.d_invitation!, GroupInvitation);
      this.$emit('input', copy_of_invitation);
      this.d_show_confirm_accept_invitation_modal = false;
    }
    finally {
      this.d_accepting = false;
    }
  }

  get already_accepted() {
    let index = this.d_invitation!.invitees_who_accepted.findIndex(
      (invitee: string) => invitee === this.d_globals.current_user!.username
    );
    return index !== -1;
  }

  get other_group_members() {
    let other_invitees = [this.d_invitation!.invitation_creator];
    this.d_invitation!.invited_usernames.forEach((invitee: string) => {
      if (invitee !== this.d_globals.current_user!.username) {
        other_invitees.push(invitee);
      }
    });
    return other_invitees;
  }

  @handle_api_errors_async(handle_reject_invitation_error)
  async reject_invitation() {
    (<APIErrors> this.$refs.reject_invitation_api_errors).clear();
    this.d_rejecting = true;
    await this.d_invitation!.reject();
    this.d_show_confirm_reject_invitation_modal = false;
    this.$emit('invitation_rejected');
    this.d_rejecting = false;
  }
}

function handle_reject_invitation_error(component: InvitationReceived, error: unknown) {
  (<APIErrors> component.$refs.reject_invitation_api_errors).show_errors_from_response(error);
}

function handle_accept_invitation_error(component: InvitationReceived, error: unknown) {
  (<APIErrors> component.$refs.accept_invitation_api_errors).show_errors_from_response(error);
}

</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';
@import '@/styles/modal.scss';

@import './group_registration.scss';

.invitation-received {
  @include invitation($pebble-medium, $pebble-medium);
}
</style>
