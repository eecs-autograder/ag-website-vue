<template>
  <div v-if="!d_loading" id="group-registration">
    <div id="registration-header"> Group Registration </div>
    <div id="registration-buttons"
          v-if="!project.disallow_group_registration
                && invitation_sent === null
                && invitations_received.length === 0">
      <template v-if="project.min_group_size === 1">
        <button id="work-alone-button"
                class="teal-button"
                @click="d_show_confirm_working_alone_modal = true"> I am working alone </button>
        <div>- or -</div>
      </template>
      <button id="send-group-invitation-button"
              class="purple-button"
              @click="d_show_send_group_invitation_modal = true"> Send group invitation </button>
    </div>

    <div v-if="project.disallow_group_registration"
         id="registration-closed">
      Group registration has been closed for this project. <br>
      Please email the course staff to proceed.
    </div>
    <div v-else id="registration-open">

      <div id="resolve-invitation-message"
           v-if="invitations_received.length > 0 || invitation_sent !== null">
        <i class="fas fa-info-circle"
           id="resolve-invitation-square">
        </i>
        You must resolve pending invitations before sending a new one.
      </div>

      <div v-if="invitation_sent !== null"
           id="invitation-sent-container" class="invitation-sent">
          <div class="invitation-header">Invitation Sent</div>
          <div class="invitation-body">
            <table class="member-table">
              <tr class="table-header">
                <th class="table-cell"> Member Name </th>
                <th class="table-cell"> Status </th>
              </tr>
              <tr v-for="(username, index) of invitation_sent.recipient_usernames">
                <td class="table-cell">{{username}}</td>
                <td class="table-cell">{{invitee_acceptance_status(username)}}</td>
              </tr>
            </table>
          </div>
          <div class="invitation-footer">
            <button id="delete-invitation-button"
                    class="orange-button"
                    @click="d_show_delete_invitation_modal = true">
              Delete Invitation
            </button>
          </div>
      </div>

      <div v-if="invitations_received.length > 0"
            id="invitations-received-container">
        <div v-for="(invitation, index) of invitations_received"
              :key="invitation.pk"
              class="single-invitation-received">
          <invitation-received ref="invitation_received"
                                v-model="invitations_received[index]"
                                :project="project"
                                @invitation_rejected="invitations_received.splice(index, 1)">
          </invitation-received>
        </div>
      </div>
    </div>

    <modal v-if="d_show_confirm_working_alone_modal"
           @close="d_show_confirm_working_alone_modal = false"
           ref="confirm_working_alone_modal"
           size="medium"
           click_outside_to_close>
      <div class="modal-header"> Confirm Working Alone </div>
      <APIErrors ref="work_alone_api_errors"> </APIErrors>
      <div class="modal-button-footer">
        <button id="confirm-working-alone-button"
                class="teal-button"
                @click="work_alone"
                :disabled="d_awaiting_action"> Work Alone </button>
        <button id="cancel-confirm-working-alone-button"
                class="white-button"
                @click="d_show_confirm_working_alone_modal = false"> Cancel </button>
      </div>
    </modal>

    <modal v-if="d_show_send_group_invitation_modal"
           @close="d_show_send_group_invitation_modal = false"
           ref="send_group_invitation_modal"
           size="large"
           click_outside_to_close>
      <div class="modal-header"> Send Invitation </div>
      <group-members-form ref="send_invitation_form"
                          :project="project"
                          :course="course"
                          :max_num_members="project.max_group_size - 1"
                          @submit="send_invitation">
        <template v-slot:header>
          <div class="users-to-invite-label"> Users to Invite: </div>
        </template>
        <template v-slot:footer>
          <APIErrors ref="send_invitation_api_errors"> </APIErrors>
          <div class="modal-button-footer">
            <button id="confirm-send-invitation-button"
                    class="green-button"
                    type="submit"
                    :disabled="d_sending_invitation">
              Send Invitation
            </button>
            <button id="cancel-send-invitation-button"
                    class="white-button"
                    type="button"
                    @click="d_show_send_group_invitation_modal = false">
              Cancel
            </button>
          </div>
        </template>
      </group-members-form>
    </modal>

    <modal v-if="d_show_delete_invitation_modal"
           @close="d_show_delete_invitation_modal = false"
           ref="delete_invitation_modal"
           size="large"
           click_outside_to_close>
      <div class="modal-header"> Delete Invitation </div>
      Are you sure you want to <b>delete</b> your invitation to:
      <ul v-if="invitation_sent !== null" class="list-of-usernames">
        <li v-for="(username, index) of invitation_sent.recipient_usernames"
            class="username">
          {{username}}
        </li>
      </ul>
      <APIErrors ref="delete_invitation_api_errors"> </APIErrors>
      <div class="modal-button-footer">
        <button id="confirm-delete-invitation-button"
                class="orange-button"
                @click="delete_invitation"
                :disabled="d_deleting_invitation"> Delete Invitation </button>
        <button id="confirm-keep-sent-invitation-button"
                class="white-button"
                @click="d_show_delete_invitation_modal = false"> Keep Invitation </button>
      </div>
    </modal>

  </div>
</template>


<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';

import { Course, Group, GroupInvitation, Project, User } from 'ag-client-typescript';

import { GlobalData } from '@/app.vue';
import APIErrors from '@/components/api_errors.vue';
import GroupMembersForm from '@/components/group_members_form.vue';
import Modal from '@/components/modal.vue';
import { GroupMember } from "@/components/project_admin/edit_groups/create_single_group.vue";
import InvitationReceived from '@/components/project_view/group_registration/invitation_received.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { handle_api_errors_async, handle_global_errors_async } from '@/error_handling';

@Component({
  components: {
    APIErrors,
    GroupMembersForm,
    InvitationReceived,
    Modal,
    ValidatedForm,
    ValidatedInput
  }
})
export default class GroupRegistration extends Vue {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  @Prop({required: true, type: Project})
  project!: Project;

  @Prop({required: true, type: Course})
  course!: Course;

  d_awaiting_action = false;
  d_deleting_invitation = false;
  d_loading = true;
  d_sending_invitation = false;
  invitation_sent: GroupInvitation | null = null;
  invitations_received: GroupInvitation[] = [];
  users_to_invite: GroupMember[] = [];
  d_show_confirm_working_alone_modal = false;
  d_show_send_group_invitation_modal = false;
  d_show_delete_invitation_modal = false;

  @handle_global_errors_async
  async created() {
    if (this.project.disallow_group_registration) {
      this.d_loading = false;
      return;
    }
    if (this.project.max_group_size === 1) {
      await this.work_alone();
      this.d_loading = false;
      return;
    }

    this.invitations_received = await this.d_globals.current_user!.group_invitations_received();
    this.invitations_received = this.invitations_received.filter(
      (group_invitation: GroupInvitation) => group_invitation.project === this.project.pk
    );

    let invitations_sent = await this.d_globals.current_user!.group_invitations_sent();
    invitations_sent = invitations_sent.filter(
      (group_invitation: GroupInvitation) => group_invitation.project === this.project.pk
    );

    if (invitations_sent.length > 0) {
      this.invitation_sent = invitations_sent[0];
    }

    this.d_loading = false;
  }

  @handle_api_errors_async(handle_delete_invitation_error)
  async delete_invitation() {
    try {
      this.d_deleting_invitation = true;
      (<APIErrors> this.$refs.delete_invitation_api_errors).clear();
      await this.invitation_sent!.reject();
      this.invitation_sent = null;
      this.d_show_delete_invitation_modal = false;
    }
    finally {
      this.d_deleting_invitation = false;
    }
  }

  invitee_acceptance_status(username: string) {
    return this.invitation_sent!.recipients_who_accepted.findIndex(
        (name: string) => username === name) !== -1 ? 'Accepted' : 'Pending';
  }

  @handle_api_errors_async(handle_send_invitation_error)
  async send_invitation(usernames: string[]) {
    try {
      this.d_sending_invitation = true;
      (<APIErrors> this.$refs.send_invitation_api_errors).clear();
      this.invitation_sent = await GroupInvitation.send_invitation(this.project.pk, usernames);
      this.d_show_send_group_invitation_modal = false;
    }
    finally {
      this.d_sending_invitation = false;
    }
  }

  @handle_api_errors_async(handle_work_alone_error)
  async work_alone() {
    try {
      this.d_awaiting_action = true;
      await Group.create_solo_group(this.project.pk);
    }
    finally {
      this.d_awaiting_action = false;
    }
  }
}

function handle_work_alone_error(component: GroupRegistration, error: unknown) {
  (<APIErrors> component.$refs.work_alone_api_errors).show_errors_from_response(error);
}

function handle_delete_invitation_error(component: GroupRegistration, error: unknown) {
  (<APIErrors> component.$refs.delete_invitation_api_errors).show_errors_from_response(error);
}

function handle_send_invitation_error(component: GroupRegistration, error: unknown) {
  (<APIErrors> component.$refs.send_invitation_api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';
@import '@/styles/modal.scss';

@import './group_registration.scss';

$purple: hsl(275, 48%, 56%);
$teal: hsl(180, 100%, 24%);

* {
  box-sizing: border-box;
}

#group-registration {
  max-width: 600px;
}

#registration-header {
  text-align: left;
  font-size: 1.5rem;
  margin-top: .875rem;
  margin-left: .5rem;
}

#registration-buttons {
  margin: .625rem 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media only screen and (min-width: 500px) {
    max-width: 300px;
  }
  padding: 0 .5rem;

  .button {
    width: 100%;
    margin: .25rem 0;
  }
}

#registration-closed {
  padding: .875rem 1.25rem;
}

#resolve-invitation-message {
  padding: .875rem 1.25rem .125rem;
}

#resolve-invitation-square {
  color: $purple;
  margin: 0 .25rem;
}

.single-invitation-received {
  margin-top: .875rem;
}

.invitation-sent {
  @include invitation(lighten($gray-blue-1, 5%), lighten($gray-blue-1, 5%));

  .invitation-footer {
    justify-content: flex-end;
  }
}

#work-alone-button {
  box-shadow: none;
}

#send-group-invitation-button {
  box-shadow: none;
}

.users-to-invite-label {
  padding: .625 0;
  font-weight: bold;
}

.modal-button-footer {
  margin-top: 1.25rem;
}

</style>
