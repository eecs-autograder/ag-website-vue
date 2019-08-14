<template>
  <div v-if="!d_loading" id="group-registration">
    <div id="group-registration-bar">
      <div id="group-registration-bar-title"> Group Registration </div>
      <div id="group-registration-bar-buttons"
           v-if="!project.disallow_group_registration
                 && invitation_sent === null
                 && invitations_received.length === 0">
        <button id="work-alone-button"
                class="teal-button"
                @click="$refs.confirm_working_alone_modal.open()"> I am working alone </button>
        <button id="send-group-invitation-button"
                class="purple-button"
                @click="$refs.send_group_invitation_modal.open()"> Create new invitation </button>
      </div>
    </div>

    <div v-if="project.disallow_group_registration"
         id="registration-closed">
      Group registration has been closed for this project.
      Please email the course staff to proceed.
    </div>
    <div v-else id="registration-open">

      <div id="resolve-invitation-message"
           v-if="invitations_received.length > 0 || invitation_sent !== null">
        <i class="fas fa-square"
           id="resolve-invitation-square">
        </i>
        You must resolve pending invitations before sending a new one.
      </div>

      <div id="registration-open-shared-space">
        <div v-if="invitation_sent !== null"
             id="invitation-sent-container">
          <div id="invitation-sent">
            <div id="invitation-sent-header">
              <div id="invitation-sent-title"> Invitation: Pending </div>
            </div>
            <div id="invitation-sent-body">
              <table class="invitation-table">
                <tr class="invitation-sent-table-row">
                  <th> Member Name </th>
                  <th> Status </th>
                </tr>
                <tr v-for="(username, index) of invitation_sent.invited_usernames"
                    :class="['invitation-sent-table-row',
                            {'last-username': index
                                              === invitation_sent.invited_usernames.length - 1}]">
                  <td>
                    <div class="member-name-td">{{username}}</div>
                  </td>
                  <td class="acceptance-status-td">
                    {{invitee_acceptance_status(username)}}
                  </td>
                </tr>
              </table>
            </div>
            <div id="invitation-sent-footer">
              <button id="delete-invitation-button"
                      class="white-button"
                      @click="$refs.delete_invitation_modal.open()">
                Delete Invitation
              </button>
            </div>
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
    </div>

    <modal ref="confirm_working_alone_modal"
           size="medium"
           click_outside_to_close>
      <div class="modal-header"> Are you sure you want to <b>work alone</b>? </div>
      <div class="modal-body">
        <div class="modal-footer">
          <div>
            <APIErrors ref="work_alone_api_errors"> </APIErrors>
          </div>
          <div class="modal-button-container">
            <button id="cancel-confirm-working-alone-button"
                    class="white-button"
                    @click="$refs.confirm_working_alone_modal.close()"> Cancel </button>
            <button id="confirm-working-alone-button"
                    class="teal-button"
                    @click="work_alone"
                    :disabled="d_awaiting_action"> Work Alone </button>
          </div>
        </div>
      </div>
    </modal>

    <modal ref="send_group_invitation_modal"
           size="medium"
           click_outside_to_close>
      <div class="modal-header"> Send Invitation </div>
      <div class="modal-divider"></div>
      <div class="modal-body">
        <group-members-form ref="send_invitation_form"
                            :project="project"
                            :course="course"
                            :max_num_members="project.max_group_size - 1"
                            @submit="send_invitation">
          <template v-slot:header>
            <p class="send-group-invitation-modal-title"> Users to Invite: </p>
          </template>
          <template v-slot:footer>
            <div class="modal-footer">
              <div class="modal-divider"></div>
              <div>
                <APIErrors ref="send_invitation_api_errors"> </APIErrors>
              </div>

              <div class="modal-button-container">
                <button id="cancel-send-invitation-button"
                        class="white-button"
                        type="button"
                        @click="$refs.send_group_invitation_modal.close()">
                  Cancel
                </button>
                <button id="confirm-send-invitation-button"
                        class="purple-button"
                        type="submit"
                        :disabled="d_sending_invitation">
                  Send Invitation
                </button>
              </div>
            </div>
          </template>
        </group-members-form>
      </div>
    </modal>

    <modal ref="delete_invitation_modal" size="large">
      <div class="modal-header"> Delete Invitation </div>
      <div class="modal-divider"></div>
      <div class="modal-body">
        <div class="modal-message">
          Are you sure you want to <b>delete</b> your invitation to:
          <ul v-if="invitation_sent !== null" class="list-of-usernames">
            <li v-for="(username, index) of invitation_sent.invited_usernames"
                :class="['username',
                  {'last-username': index === invitation_sent.invited_usernames.length - 1}]">
              {{username}}
            </li>
          </ul>
        </div>
        <div class="modal-footer">
          <div class="modal-divider"></div>
          <div>
            <APIErrors ref="delete_invitation_api_errors"> </APIErrors>
          </div>
          <div class="modal-button-container">
            <button id="confirm-keep-sent-invitation-button"
                    class="white-button"
                    @click="$refs.delete_invitation_modal.close()"> Keep Invitation </button>
            <button id="confirm-delete-invitation-button"
                    class="orange-button"
                    @click="delete_invitation"
                    :disabled="d_deleting_invitation"> Delete Invitation </button>
          </div>
        </div>
      </div>
    </modal>

  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Course, Group, GroupInvitation, Project, User } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import GroupMembersForm from '@/components/group_members_form.vue';
import Modal from '@/components/modal.vue';
import { GroupMember } from "@/components/project_admin/edit_groups/create_single_group.vue";
import InvitationReceived from '@/components/project_view/group_registration/invitation_received.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { handle_api_errors_async } from '@/utils';

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
  user: User | null = null;
  users_to_invite: GroupMember[] = [];

  async created() {
    this.user = await User.get_current();

    if (!this.project.disallow_group_registration) {
      if (this.project.max_group_size === 1) {
        await this.work_alone();
      }

      this.invitations_received = await this.user.group_invitations_received();
      this.invitations_received = this.invitations_received.filter(
        (group_invitation: GroupInvitation) => group_invitation.project === this.project.pk
      );

      let invitations_sent = await this.user.group_invitations_sent();
      invitations_sent = invitations_sent.filter(
        (group_invitation: GroupInvitation) => group_invitation.project === this.project.pk
      );

      if (invitations_sent.length > 0) {
        this.invitation_sent = invitations_sent[0];
      }
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
      (<Modal> this.$refs.delete_invitation_modal).close();
    }
    finally {
      this.d_deleting_invitation = false;
    }
  }

  invitee_acceptance_status(username: string) {
    return this.invitation_sent!.invitees_who_accepted.findIndex(
        (name: string) => username === name) !== -1 ? 'Accepted' : 'Pending';
  }

  @handle_api_errors_async(handle_send_invitation_error)
  async send_invitation(usernames: string[]) {
    try {
      this.d_sending_invitation = true;
      (<APIErrors> this.$refs.send_invitation_api_errors).clear();

      this.invitation_sent = await GroupInvitation.send_invitation(this.project.pk, usernames);
      (<Modal> this.$refs.send_group_invitation_modal).close();
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
@import '@/styles/components/edit_groups.scss';
@import '@/styles/components/group_registration.scss';

$purple: hsl(275, 48%, 56%);
$teal: hsl(180, 100%, 24%);

* {
  box-sizing: border-box;
}

#group-registration-bar {
  color: white;
  background-color: lighten(black, 15);
  border-radius: 5px;
  font-size: 24px;
  padding: 15px;
}

#group-registration-bar-title {
  padding: 15px 0;
  text-align: center;
}

#group-registration-bar-buttons {
  padding: 10px 0 0 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: stretch;
}

#work-alone-button {
  margin-bottom: 10px;
}

#registration-closed {
  padding: 15px 20px;
}

#resolve-invitation-message {
  padding: 15px 20px 2px 20px;
  width: 100%;
}

#resolve-invitation-square {
  color: $purple;
  margin: 0 5px;
}

#registration-open-shared-space {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: space-between;
  flex-wrap: wrap;
}

#invitation-sent-container, #invitations-received-container {
  width: 100%;
}

.single-invitation-received {
  margin-top: 15px;
}

#invitation-sent {
  @extend .invitation-container;
  margin-bottom: 0;
}

#invitation-sent-header {
  @include invitation_container_header($teal, $teal);
  color: white;
  font-weight: bold;
}

#invitation-sent-title {
  font-size: 20px;
}

#invitation-sent-body {
  @include invitation_container_body($teal);
}

.invitation-sent-table-row {
  @extend .invitation-table-row;
}

#invitation-sent-footer {
  @include invitation_container_footer($teal, $teal);
}

#delete-invitation-button {
  box-shadow: none;
}

#work-alone-button {
  box-shadow: none;
}

#send-group-invitation-button {
  box-shadow: none;
}

#cancel-confirm-working-alone-button,
#confirm-keep-sent-invitation-button,
#cancel-send-invitation-button {
  margin-right: 10px;
}

.send-group-invitation-modal-title {
  padding: 10px 0;
  margin: 0;
}

@media only screen and (min-width: 500px) {
  #group-registration-bar {
    color: white;
    background-color: lighten(black, 15);
    border-radius: 5px;
    font-size: 24px;
    padding: 0;
  }

  #group-registration-bar-title {
    padding: 15px 20px 5px 20px;
    text-align: left;
  }

  #group-registration-bar-buttons {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    padding: 10px 20px 20px 20px;
  }

  #work-alone-button {
    margin-right: 15px;
    margin-bottom: 0;
  }
}

@media only screen and (min-width: 900px) {
  #group-registration-bar {
    color: white;
    background-color: lighten(black, 15);
    border-radius: 5px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    font-size: 24px;
    justify-content: space-between;
  }

  #group-registration-bar-title {
    padding: 15px 10px 15px 20px;
  }

  #group-registration-bar-buttons {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 10px 15px;
  }

  #invitation-sent-container, #invitations-received-container {
    width: 50%;
  }

  #resolve-invitation-message {
    padding-left: 20px;
    margin: 10px 0 2px 0;
    width: 100%;
  }
}

</style>
