<template>
  <div v-if="!d_loading">
    <div id="invitation-received">
      <div class="invitation-received-top">
        <div>You've been invited to be in a group with:</div>
        <ul class="list-of-usernames">
          <li v-for="(username, index) of other_group_members"
              :class="[{'last-username': index === other_group_members.length - 1},
              'username']">
            {{username}}
          </li>
        </ul>

        <div v-if="d_invitation.invitees_who_accepted.length > 0"
             id="invitees-that-accepted">
          Members who have already accepted this invitation are:
          <ul class="list-of-usernames">
            <li v-for="(username, index) of d_invitation.invitees_who_accepted"
                :class="['username', 'already-accepted',
                  {'last-username': index === d_invitation.invitees_who_accepted.length - 1}]">
              {{username}}
            </li>
          </ul>
        </div>
      </div>

      <div class="invitation-received-bottom">
        <div class="accept-reject-invitation-buttons">
          <button class="orange-button"
                  id="reject-invitation-button"
                  @click="$refs.confirm_reject_modal.open()"> Reject </button>
          <button class="blue-button"
                  id="accept-invitation-button"
                  :disabled="already_accepted || d_accepting"
                  @click="$refs.confirm_accept_modal.open()"> Accept </button>
        </div>
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
          <button class="light-gray-button"
                  id="cancel-accept-button"
                  @click="$refs.confirm_accept_modal.close()"> Cancel </button>
          <button class="blue-button"
                  id="confirm-accept-button"
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
          <button class="light-gray-button"
                  id="cancel-reject-button"
                  @click="$refs.confirm_reject_modal.close()"> Cancel </button>
          <button class="orange-button"
                  id="confirm-reject-button"
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
  display: inline-block;
}

#reject-invitation-button,
#cancel-accept-button,
#cancel-reject-button {
  margin-right: 10px;
}

.accept-reject-invitation-buttons {
  padding: 8px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

.invitation-received-top {
  padding: 15px;
  background-color: white;
  border-radius: 5px 5px 0 0;
  border: 2px solid darken($white-gray, 6);
  border-bottom: none;
}

#invitees-that-accepted {
  margin-top: 15px;

  .list-of-usernames {
    margin-bottom: 2px;
  }
}

.invitation-received-bottom {
  border: 2px solid darken($white-gray, 6);
  border-radius: 0 0 5px 5px;
  background-color: whitesmoke;
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
