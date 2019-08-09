<template>
  <div v-if="!d_loading">

    <div id="invitation-received">
      <div id="invitation-received-header"> <b>{{d_invitation.invitation_creator}}</b>
        has invited you to join a group! </div>
      <div id="invitation-received-body">
        <table id="invitation-received-table">
          <tr class="invitation-received-tr">
            <td> Member Name </td>
            <td> Status </td>
          </tr>
          <tr v-for="(username, index) of other_group_members"
              :class="['invited-member',
                     {'last-username': index === other_group_members.length - 1},
                     {'odd-row': index % 2 == 1}]">
            <td>
              <div class="invitation-received-member-name"> {{username}} </div>
            </td>
            <td class="invitation-received-member-acceptance-status">
              {{member_acceptance_status(username)}}
            </td>
          </tr>
        </table>
      </div>

      <div id="invitation-received-footer">
          <button id="reject-invitation-button"
                  @click="$refs.confirm_reject_modal.open()"> Reject </button>
          <button id="accept-invitation-button"
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
                  @click="$refs.confirm_accept_modal.close()"> Cancel </button>
          <button id="confirm-accept-button"
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
          Are you sure you want to <b class="reject">reject</b> the invitation for a group with:
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
                  @click="$refs.confirm_reject_modal.close()"> Cancel </button>
          <button id="confirm-reject-button"
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

.list-of-usernames {
  margin-top: 9px;
  margin-bottom: 9px;
}

.username {
  margin: 6px;
  font-weight: bold;
}

.last-username {
  margin-bottom: 0;
}

#invitation-received {
  border-radius: 5px;
  width: 95%;
  margin: 0 2.5%;
  border: 2px solid darken($white-gray, 2);
}

#invitation-received-header {
  padding: 11px 40px 11px 18px;
  font-size: 18px;
  border-radius: 3px 3px 0 0;
  background-color: $white-gray;
  border-bottom: 2px solid darken($white-gray, 2);
}

#invitation-received-body {
  padding: 10px 18px 6px 18px;
}

#invitation-received-table {
  border-collapse: collapse;
}

.invitation-received-tr {
  font-weight: bold;

  td {
    padding: 2px 0 10px 0;
  }
}

.invited-member {
  td {
    padding: 0 40px 10px 0;
  }
}

#invited-members-title {
  padding: 2px 0 8px 0;
}

.invitation-received-member-name {
  padding-right: 100px;
}

#invitation-received-footer {
  padding: 9px;
  background-color: $white-gray;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-content: center;
  border-top: 2px solid darken($white-gray, 2);
  border-radius: 0 0 3px 3px;
}

#accept-invitation-button {
  @extend .teal-button;
  box-shadow: none;
}

#reject-invitation-button {
  @extend .orange-button;
  box-shadow: none;
}

#reject-invitation-button,
#cancel-accept-button,
#cancel-reject-button {
  margin-right: 10px;
}

#cancel-reject-button {
  @extend .white-button;
}

#confirm-reject-button {
  @extend .orange-button;
}

#confirm-accept-button {
  @extend .teal-button;
}

#cancel-accept-button {
  @extend .white-button;
}

.accept-reject-invitation-buttons {
  padding: 8px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

#invitees-that-accepted {
  margin-top: 15px;

  .list-of-usernames {
    margin-bottom: 2px;
  }
}

.modal-header {
  font-size: 20px;
  padding: 10px 0 5px 0;
}

.modal-divider {
  height: 2px;
  background-color: darken($white-gray, 3);
  margin: 9px 0;
}

.modal-message {
  padding: 5px 0;
}

.modal-button-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 10px 0 0 0;
}

</style>
