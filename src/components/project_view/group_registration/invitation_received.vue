<template>
  <div v-if="!d_loading">

    <div id="invitation-received">
      <div id="invitation-received-header">
        <b>{{d_invitation.invitation_creator}}</b> has invited you work together!
      </div>
      <div id="invitation-received-body">
        <table class="invitation-table">
          <tr class="invitation-table-row">
            <th> Member Name </th>
            <th> Status </th>
          </tr>
          <tr v-for="(username, index) of other_group_members"
              :class="['invitation-received-table-row',
                      {'last-username': index === other_group_members.length - 1}]">
            <td>
              <div class="member-name-td">{{username}}</div>
            </td>
            <td class="acceptance-status-td">
              {{member_acceptance_status(username)}}
            </td>
          </tr>
        </table>
      </div>

      <div id="invitation-received-footer">
          <button id="reject-invitation-button"
                  class="orange-button"
                  @click="$refs.confirm_reject_modal.open()"> Reject </button>
          <button id="accept-invitation-button"
                  class="teal-button"
                  :disabled="already_accepted || d_accepting"
                  @click="$refs.confirm_accept_modal.open()"> Accept </button>
      </div>

    </div>

    <modal ref="confirm_accept_modal"
           size="medium"
           click_outside_to_close>
      <div class="modal-header"> Confirm Accept </div>
      <div class="modal-divider"></div>
      <div class="modal-body">
        <div class="modal-message">
          Are you sure you want to <b>accept</b> the invitation for a group with:
          <ul class="list-of-usernames">
            <li v-for="(username, index) of other_group_members"
                :class="['username', {'last-username': index === other_group_members.length - 1}]">
              {{username}}
            </li>
          </ul>
        </div>
        <div class="modal-footer">
          <div class="modal-divider"></div>
          <div>
            <APIErrors ref="accept_invitation_api_errors"></APIErrors>
          </div>
          <div class="modal-button-container">
            <button id="cancel-accept-button"
                    class="white-button"
                    @click="$refs.confirm_accept_modal.close()"> Cancel </button>
            <button id="confirm-accept-button"
                    class="teal-button"
                    :disabled="d_accepting"
                    @click="accept_invitation"> Accept </button>
          </div>
        </div>
      </div>
    </modal>

    <modal ref="confirm_reject_modal"
           size="medium"
           click_outside_to_close>
      <div class="modal-header"> Confirm Reject </div>
      <div class="modal-divider"></div>
      <div class="modal-body">
        <div class="modal-message">
          Are you sure you want to <b>reject</b> the invitation for a group with:
          <ul class="list-of-usernames">
            <li v-for="(username, index) of other_group_members"
                :class="['username', {'last-username': index === other_group_members.length - 1}]">
              {{username}}
            </li>
          </ul>
        </div>
        <div class="modal-footer">
          <div class="modal-divider"></div>
          <div>
            <APIErrors ref="reject_invitation_api_errors"></APIErrors>
          </div>
          <div class="modal-button-container">
            <button id="cancel-reject-button"
                    class="white-button"
                    @click="$refs.confirm_reject_modal.close()"> Cancel </button>
            <button id="confirm-reject-button"
                    class="orange-button"
                    :disabled="d_rejecting"
                    @click="reject_invitation"> Reject </button>
          </div>
        </div>
      </div>
    </modal>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { Group, GroupInvitation, Project, User } from 'ag-client-typescript';

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
  user: User | null = null;

  async created() {
    this.user = await User.get_current();
    this.d_invitation = deep_copy(this.value, GroupInvitation);
    this.d_loading = false;
  }

  member_acceptance_status(username: string) {
    if (username === this.d_invitation!.invitation_creator) {
        return "Creator";
    }
    return this.d_invitation!.invitees_who_accepted.findIndex(
       (name: string) => username === name) !== -1 ? 'Accepted' : 'Pending';
  }

  @handle_api_errors_async(handle_accept_invitation_error)
  async accept_invitation() {
    try {
      this.d_accepting = true;
      (<APIErrors> this.$refs.accept_invitation_api_errors).clear();
      let result = await this.d_invitation!.accept();
      let copy_of_invitation = deep_copy(this.d_invitation!, GroupInvitation);
      this.$emit('input', copy_of_invitation);
      if (result !== null) {
        Group.notify_group_created(result);
        return;
      }
      (<Modal> this.$refs.confirm_accept_modal).close();
    }
    finally {
      this.d_accepting = false;
    }
  }

  get already_accepted() {
    let index = this.d_invitation!.invitees_who_accepted.findIndex(
      (invitee: string) => invitee === this.user!.username
    );
    return index !== -1;
  }

  get other_group_members() {
    let other_invitees = [this.d_invitation!.invitation_creator];
    this.d_invitation!.invited_usernames.forEach((invitee: string) => {
      if (invitee !== this.user!.username) {
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
    (<Modal> this.$refs.confirm_reject_modal).close();
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
@import '@/styles/components/group_registration.scss';

#invitation-received {
  @extend .invitation-container;
}

#invitation-received-header {
  @include invitation_container_header($white-gray, darken($white-gray, 2));
}

#invitation-received-body {
  @include invitation_container_body(darken($white-gray, 2));
}

#invitation-received-footer {
  @include invitation_container_footer($white-gray, darken($white-gray, 2));
}

.invitation-received-table-row {
  @extend .invitation-table-row;
}

#accept-invitation-button {
  box-shadow: none;
}

#reject-invitation-button {
  box-shadow: none;
  margin-right: 10px;
}

#cancel-reject-button, #cancel-accept-button {
  margin-right: 10px;
}

</style>
