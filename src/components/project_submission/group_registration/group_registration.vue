<template>
  <div v-if="!d_loading" id="group-registration">
    <div id="group-registration-title">
      <div id="blah"> Group Registration </div>
      <div id="group-registration-options"
           v-if="invitation_sent === null && invitations_received.length === 0">
        <button id="work-alone-button"
                @click="$refs.confirm_working_alone_modal.open()"> I am working alone </button>
        <button id="send-group-invitation-button"
                @click="open_send_group_invitation_modal()"> Create new invitation </button>
      </div>
    </div>

    <div v-if="project.disallow_group_registration"
         id="registration-closed">
      Group registration has been closed for this project.
      Please email the course staff if you need to create a group.
    </div>

    <div v-else id="registration-open">
      <div v-if="invitation_sent !== null"
           id="invitation-sent-container">

        <div id="invitation-sent">
          <div id="invitation-sent-header">

            <div id="invitation-sent-title"> Invitation: Pending </div>

          </div>
          <div id="invitation-sent-body">
            <table id="invitation-sent-table">
              <tr class="invitation-sent-tr">
                <td> Member Name </td>
                <td> Status </td>
              </tr>
              <tr v-for="(username, index) of invitation_sent.invited_usernames"
                  :class="['invited-member',
                     {'last-username': index === invitation_sent.invited_usernames.length - 1},
                     {'odd-row': index % 2 == 1}]">
                <td>
                  <div class="invited-member-name"> {{username}} </div>
                </td>
                <td class="invited-member-acceptance-status">
                  {{invitee_has_accepted(username)}}
                </td>
              </tr>
            </table>
          </div>

          <div id="invitation-sent-footer">
            <button id="cancel-sent-invitation-button"
                    @click="$refs.cancel_group_invitation_modal.open()">
              Cancel Invitation
            </button>
          </div>
        </div>
      </div>

      <div v-if="invitations_received.length > 0"
           id="invitations-received-container">
        <div v-for="(invitation, index) of invitations_received"
             :key="invitation.pk"
             class="invitation">
          <invitation-received ref="invitation_received"
                               v-model="invitations_received[index]"
                               :project="project"
                               @invitation_rejected="invitations_received.splice(index, 1)">
          </invitation-received>
        </div>
      </div>
    </div>

    <modal ref="confirm_working_alone_modal"
           size="medium"
           click_outside_to_close>
      <div class="modal-header"> Confirm Working Alone </div>
      <div class="modal-divider"></div>
      <div class="modal-body">
        <div class="modal-message">
          Are you sure you want to <b>work alone</b>?
          Once you accept, you cannot have a partner for this project.
        </div>

        <div class="modal-footer">
          <div class="modal-divider"></div>
          <div>
            <APIErrors ref="work_alone_api_errors"> </APIErrors>
          </div>
          <div class="modal-button-container">
          <button class="light-gray-button"
                  id="cancel-confirm-working-alone-button"
                  @click="$refs.confirm_working_alone_modal.close()"> Cancel </button>
          <button class="blue-button confirm-working-alone-button"
                  id="confirm-working-alone-button"
                  @click="work_alone"
                  :disabled="d_awaiting_action"> Work Alone </button>
          </div>
        </div>
      </div>
    </modal>

    <modal ref="send_group_invitation_modal"
           size="medium"
           click_outside_to_close>
      <div class="modal-header"> Send Group Invitation </div>
      <div class="modal-divider"></div>
      <div class="modal-body">
          <validated-form ref="send_group_invitation_form"
                          autocomplete="off"
                          spellcheck="false"
                          @submit="send_invitation">
            <p class="group-members-title"> Users to Invite: </p>
            <div class="add-group-members-container">
              <div v-for="(member, index) of users_to_invite">
                <div class="group-member-editing">
                  <div class="username-container">
                    <input :class="['member-name-input',
                                   {'error-input': incomplete_input_present
                                    && member.username === course.allowed_guest_domain}]"
                           :id="`group_member_name_${index}`"
                           v-model="member.username"/>
                    <button slot="suffix"
                            class="remove-member-button"
                            :disabled="users_to_invite.length === 1"
                            :title="`Remove ${member.username} from group`"
                            type="button"
                            @click="users_to_invite.splice(index, 1)">
                      <i class="fas fa-times"></i>
                    </button>
                    <div>
                      <div v-if="incomplete_input_present
                             && member.username === course.allowed_guest_domain"
                           class="incomplete-input-msg">
                        Incomplete member name
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="add-member-container">
                <button class="add-member-button"
                        type="button"
                        :disabled="users_to_invite.length >= project.max_group_size - 1"
                        @click="add_group_member">
                  <i class="fas fa-plus"></i>
                  Add Another Member
                </button>
              </div>
            </div>
            <div class="modal-footer">
              <div class="modal-divider"></div>
              <div>
                <APIErrors ref="send_invitation_api_errors"> </APIErrors>
              </div>

              <div class="modal-button-container">
                <button id="cancel-send-invitation-button"
                        type="button"
                        @click="$refs.send_group_invitation_modal.close()">
                  Cancel
                </button>
                <button id="confirm-send-invitation-button"
                        type="submit"
                        @click="send_invitation"
                        :disabled="d_sending_invitation">
                  Send Invitation
                </button>
              </div>
            </div>
          </validated-form>
      </div>
    </modal>

    <modal ref="cancel_group_invitation_modal" size="large">
      <div class="modal-header"> Cancel Group Invitation </div>
      <div class="modal-divider"></div>
      <div class="modal-body">
        <div class="modal-message">
          Are you sure you want to <b>cancel</b> the group invitation with:
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
            <APIErrors ref="cancel_invitation_api_errors"> </APIErrors>
          </div>
          <div class="modal-button-container">
            <button id="confirm-keep-sent-invitation-button"
                    @click="$refs.cancel_group_invitation_modal.close()"> Keep Invitation </button>
            <button id="confirm-cancel-sent-invitation-button"
                    @click="cancel_invitation"
                    :disabled="d_canceling_invitation"> Cancel Invitation </button>
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
import Modal from '@/components/modal.vue';
import { GroupMember } from "@/components/project_admin/edit_groups/create_single_group.vue";
import InvitationReceived from '@/components/project_submission/group_registration/invitation_received.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { handle_api_errors_async } from '@/utils';

@Component({
  components: {
    APIErrors,
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
  d_canceling_invitation = false;
  d_loading = true;
  d_sending_invitation = false;
  incomplete_input_present = false;
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

  add_group_member() {
    this.users_to_invite.push({
      id: this.users_to_invite.length,
      username: this.course.allowed_guest_domain
    });
  }

  @handle_api_errors_async(handle_cancel_invitation_error)
  async cancel_invitation() {
    try {
      this.d_canceling_invitation = true;
      (<APIErrors> this.$refs.cancel_invitation_api_errors).clear();
      await this.invitation_sent!.reject();
      this.invitation_sent = null;
      (<Modal> this.$refs.cancel_group_invitation_modal).close();
    }
    finally {
      this.d_canceling_invitation = false;
    }
  }

  open_send_group_invitation_modal() {
    (<Modal> this.$refs.send_group_invitation_modal).open();
    this.reset_group_member_inputs();
  }

  reset_group_member_inputs() {
    this.users_to_invite = [];
    this.incomplete_input_present = false;

    let min_num_inputs = this.project.min_group_size === this.project.max_group_size
      ? this.project.min_group_size - 1 :  this.project.min_group_size - 1;
    if (min_num_inputs === 0) {
        min_num_inputs = 1;
    }
    for (let i = 0; i < min_num_inputs; ++i) {
      this.users_to_invite.push(
        {
          id: i,
          username: this.course.allowed_guest_domain
        }
      );
    }
  }

  invitee_has_accepted(username: string) {
    return this.invitation_sent!.invitees_who_accepted.findIndex(
        (name: string) => username === name) !== -1 ? 'Accepted' : 'Pending';
  }

  @handle_api_errors_async(handle_send_invitation_error)
  async send_invitation() {
    try {
      let usernames: string[] = [];
      this.d_sending_invitation = true;
      this.incomplete_input_present = false;
      (<APIErrors> this.$refs.send_invitation_api_errors).clear();

      this.users_to_invite = this.users_to_invite.filter(
        member => member.username.trim() !== ""
      );

      if (this.users_to_invite.length === 0) {
        this.add_group_member();
      }

      for (let user_index = 0; user_index < this.users_to_invite.length; ++user_index) {
        if (this.users_to_invite[user_index].username.trim()
            === this.course.allowed_guest_domain) {
          this.incomplete_input_present = true;
          return;
        }
        usernames.push(this.users_to_invite[user_index].username.trim());
        Vue.set(this.users_to_invite, user_index, {
          id: user_index + 1,
          username: this.users_to_invite[user_index].username.trim()
        });
      }

      this.invitation_sent = await GroupInvitation.send_invitation(
          this.project.pk, usernames
      );
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
      // can't clear the api errors because the modal isnt open
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

function handle_cancel_invitation_error(component: GroupRegistration, error: unknown) {
  (<APIErrors> component.$refs.cancel_invitation_api_errors).show_errors_from_response(error);
}

function handle_send_invitation_error(component: GroupRegistration, error: unknown) {
  (<APIErrors> component.$refs.send_invitation_api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/edit_groups.scss';

#blah {
  padding: 15px 10px 15px 20px;
}

#group-registration-title {
  font-size: 24px;
  color: white;
  background-color: lighten(black, 15);
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
}

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

#group-registration-options {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 0 15px;
}

#registration-closed {
  padding: 10px 0;
}

.last-username {
  margin-bottom: 0;
}

.group-members-title {
  padding: 10px 0;
  margin: 0;
}

.add-member-button {
  margin-bottom: 15px;
}

#invitations-received-title {
  padding: 10px 27px 20px 27px;
  font-size: 18px;
  font-weight: bold;
}

#invitation-sent-container-title {
  padding: 10px 27px 20px 30px;
  font-size: 18px;
  font-weight: bold;
}

.invitation {
  margin-top: 15px;
}

#invitation-sent {
  border-radius: 5px;
  width: 95%;
  margin: 15px 2.5%;
  //border: 2px solid darken($white-gray, 2);
}

#invitation-sent-header {
  padding: 12px 18px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 3px 3px 0 0;
  background-color: $base-teal;
  color: white;
}

#invitation-sent-title {
  font-size: 20px;
}

#invitation-sent-body {
  padding: 10px 40px 6px 18px;
  border: 2px solid $base-teal;
  border-top: none;
  border-bottom: none;
}

#invitation-sent-table {
  border-collapse: collapse;
}

.invitation-sent-tr {
  font-weight: bold;
  //background-color: $base-teal;

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

.invited-member-name {
  padding-right: 100px;
}

#invitation-sent-footer {
  padding: 9px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-content: center;
  background-color: $base-teal;
  border-radius: 0 0 3px 3px;
}

#cancel-sent-invitation-button {
  @extend .white-button;
  box-shadow: none;
}

#invitees-that-accepted {
  margin-top: 15px;
}

.resolve-invitation-message {
  padding: 5px 0 15px 0;
  font-size: 15px;
}

#confirm-keep-sent-invitation-button,
#cancel-send-invitation-button,
#cancel-confirm-working-alone-button,
#work-alone-button {
  margin-right: 10px;
}

.modal-header {
  font-size: 20px;
  padding: 10px 0 5px 0;
}

.modal-divider {
  background-color: darken($white-gray, 3);
  height: 2px;
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

.status-square {
  color: $save-green;
}

.inner {
  text-align: left;
}

#registration-open {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: space-between;
}

#invitation-sent-container {
  /*padding-right: 100px;*/
  /*padding-bottom: 20px;*/
  width: 50%;
}

#invitations-received-container {
  width: 50%;
}

#work-alone-button {
  @extend .teal-button;
  box-shadow: none;
}

#send-group-invitation-button {
  @extend .purple-button;
  box-shadow: none;
}

#cancel-confirm-working-alone-button {
  @extend .white-button;
}

#confirm-working-alone-button {
  @extend .teal-button;
}

#confirm-cancel-sent-invitation-button {
  @extend .red-button;
}

#confirm-keep-sent-invitation-button {
  @extend .white-button;
}

#confirm-send-invitation-button {
  @extend .purple-button;
}

#cancel-send-invitation-button {
  @extend .white-button;
}

</style>
