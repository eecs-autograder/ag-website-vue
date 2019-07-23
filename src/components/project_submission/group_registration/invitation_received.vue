<template>
  <div v-if="!d_loading">
    <div> Invited Users:</div>
    <ul>
      <li v-for="username of invitation.invited_usernames">{{username}}</li>
    </ul>

    <div id="invitation-received">
      <div>
        You've been invited to be in a group with:
      </div>

      <ul>
        <li v-for="username of other_group_members">{{username}}</li>
      </ul>

      <div v-if="invitation.invitees_who_accepted.length > 0">
        Members who have already accepted this invitation are:
        <ul>
          <li v-for="username of invitation.invitees_who_accepted">{{username}}</li>
        </ul>
      </div>

      <div>
        <button class="red-button reject-invite-button"
                @click="$refs.confirm_reject_modal.open()"> Reject </button>
        <button class="green-button accept-invite-button"
                :disabled="already_accepted"
                @click="$refs.confirm_accept_modal.open()"> Accept </button>
      </div>
    </div>

    <modal ref="confirm_accept_modal" size="medium">
      <div class="modal-header"> Confirm Accept </div>
      <hr>
      <div class="modal-body">
        <div class="modal-message">
          Are you sure you want to <b>accept</b> the invitation for a group with:
          <ul>
            <li v-for="username of other_group_members">{{username}}</li>
          </ul>
        </div>
        <div class="modal-button-container">
          <APIErrors ref="api_errors"></APIErrors>

          <button class="light-gray-button cancel-accept-button"
                  @click="$refs.confirm_accept_modal.close()"> Cancel </button>
          <button class="blue-button confirm-accept-button"
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
            <li v-for="username of other_group_members">{{username}}</li>
          </ul>
        </div>
        <div class="modal-button-container">
          <button class="light-gray-button cancel-reject-button"
                  @click="$refs.confirm_reject_modal.close()"> Cancel </button>
          <button class="red-button confirm-reject-button"
                  @click="reject_invitation"> Reject </button>
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

  @Prop({required: true, type: Project})
  project!: Project;

  user: User | null = null;
  d_loading = true;
  d_invitation: GroupInvitation | null = null;

  @Watch('invitation')
  on_invitation_changed(new_value: GroupInvitation, old_value: GroupInvitation) {
    this.d_invitation = new_value;
    console.log("invitation changed");
  }

  async created() {
    this.user = await User.get_current();
    this.d_invitation = this.invitation;
    this.d_loading = false;
  }

  async reject_invitation() {
    await this.invitation.reject();
    (<Modal> this.$refs.confirm_reject_modal).close();
  }

  @handle_api_errors_async(handle_accept_invitation_error)
  async accept_invitation() {
    try {
      await this.invitation.accept();
      console.log("Invitees who accepted length: " + this.invitation.invitees_who_accepted.length);
      console.log("Invited usernames length: " + this.invitation.invited_usernames.length);
      if (this.invitation.invitees_who_accepted.length
          === this.invitation.invited_usernames.length) {
        console.log("Enough people accepted");
        let member_names = [this.invitation.invitation_creator];
        for (let member of this.invitation.invited_usernames) {
          console.log(member);
          member_names.push(member);
        }
        await Group.create(this.project.pk, {member_names: member_names});
      }
      else {
        (<Modal> this.$refs.confirm_accept_modal).close();
      }
    }
    finally {}
  }

  get other_group_members() {
    if (this.user === null) {
      return [];
    }
    let other_invitees = [this.invitation.invitation_creator];
    this.invitation.invited_usernames.forEach((invitee: string) => {
      if (invitee !== this.user!.username) {
        other_invitees.push(invitee);
      }
    });
    return other_invitees;
  }

  get already_accepted() {
    let index = this.invitation.invitees_who_accepted.findIndex(
      (invitee: string) => invitee === this.user!.username);
    return index !== -1;
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

#invitation-received {
  padding: 10px 20px 10px 10px;
  border: 1px solid $pebble-medium;
  border-radius: 5px;
  display: inline-block;
}

.reject-invite-button {
  margin-right: 10px;
}

.cancel-button {
  margin-right: 10px;
}
</style>
