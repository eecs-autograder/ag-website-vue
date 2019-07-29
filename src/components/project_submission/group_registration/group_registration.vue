<template>
  <div v-if="!d_loading" id="group-registration">
    <div id="group-registration-title"> Group Registration </div>

    <div v-if="project.disallow_group_registration"
         id="registration-closed">
      Group registration has been closed for this project.
      Please email the course staff if you need to create a group.
    </div>
    <div v-else id="registration-open">
      <div id="group-registration-options"
           v-if="invitation_sent === null && invitations_received.length === 0">
        <button class="blue-button work-alone-button"
                @click="$refs.confirm_working_alone_modal.open()"> I am working alone </button>
        <button class="green-button send-group-invitation-button"
                @click="open_send_group_invitation_modal()"> Create new invitation </button>
      </div>

      <div v-if="invitations_received.length > 0">
        <div id="invitations-received-title"> Invitations received: </div>
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

      <div v-if="invitation_sent !== null">
        <div id="pending-invitations-title"> Pending Invitation Sent </div>

        <div id="invitation-sent">
          <div>
            <div> Invited Members: </div>
            <ul class="list-of-usernames">
              <li v-for="(username, index) of invitation_sent.invited_usernames"
                  :class="['username',
                   {'last-username': index === invitation_sent.invited_usernames.length - 1}]">
                <b>{{username}}</b>
              </li>
            </ul>
          </div>

          <div v-if="invitation_sent.invitees_who_accepted.length > 0">
            <div> Members who have accepted: </div>
            <ul class="list-of-usernames">
              <li v-for="(username, index) of invitation_sent.invitees_who_accepted"
                  :class="['username',
                  {'last-username': index === invitation_sent.invitees_who_accepted.length - 1}]">
                {{username}}
              </li>
            </ul>
          </div>

          <button class="orange-button cancel-sent-invitation-button"
                  @click="$refs.cancel_group_invitation_modal.open()">
            Cancel Invitation
          </button>
        </div>
      </div>

      <div class="resolve-invitation-message"
           v-if="invitations_received > 0 || invitation_sent !== null">
        You must resolve pending invitations before sending a new one.
      </div>

    </div>

    <modal ref="confirm_working_alone_modal"
           size="medium"
           click_outside_to_close>
      <div class="modal-header"> Confirm Working Alone </div>
      <div class="modal-divider"> </div>
      <div class="modal-body">
        <div class="modal-message">
          Are you sure you want to <b>work alone</b>?
          Once you accept you cannot have a partner for this project.
        </div>

        <div class="modal-footer">
          <div class="modal-divider"> </div>
          <div>
            <APIErrors ref="work_alone_api_errors"> </APIErrors>
          </div>
          <div class="modal-button-container">
          <button class="light-gray-button cancel-confirm-working-alone-button"
                  @click="$refs.confirm_working_alone_modal.close()"> Cancel </button>
          <button class="blue-button confirm-working-alone-button"
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
      <div class="modal-divider"> </div>
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
              <div class="modal-divider"> </div>
              <div>
                <APIErrors ref="send_invitation_api_errors"> </APIErrors>
              </div>

              <div class="modal-button-container">
                <button class="light-gray-button cancel-send-invitation-button"
                        type="button"
                        @click="$refs.send_group_invitation_modal.close()">
                  Cancel
                </button>
                <button class="blue-button confirm-send-invitation-button"
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
      <div class="modal-divider"> </div>
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
          <div class="modal-divider"> </div>
          <div>
            <APIErrors ref="cancel_invitation_api_errors"> </APIErrors>
          </div>
          <div class="modal-button-container">
            <button class="orange-button confirm-cancel-sent-invitation-button"
                    @click="cancel_invitation"
                    :disabled="d_cancelling_invitation"> Cancel Invitation </button>
            <button class="blue-button confirm-keep-sent-invitation-button"
                    @click="$refs.cancel_group_invitation_modal.close()"> Keep Invitation </button>
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
  d_cancelling_invitation = false;
  d_loading = true;
  d_sending_invitation = false;
  incomplete_input_present = false;
  invitation_sent: GroupInvitation | null = null;
  invitations_received: GroupInvitation[] = [];
  user: User | null = null;
  users_to_invite: GroupMember[] = [];

  open_send_group_invitation_modal() {
    (<Modal> this.$refs.send_group_invitation_modal).open();
    this.reset_group_member_inputs();
  }

  add_group_member() {
    this.users_to_invite.push({
      id: this.users_to_invite.length,
      username: this.course.allowed_guest_domain
    });
  }

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

  @handle_api_errors_async(handle_send_invitation_error)
  async send_invitation() {
    try {
      this.d_sending_invitation = true;
      this.incomplete_input_present = false;
      (<APIErrors> this.$refs.send_invitation_api_errors).clear();

      let usernames: string[] = [];
      this.users_to_invite = this.users_to_invite.filter(
        member => member.username.trim() !== ""
      );

      if (this.users_to_invite.length === 0) {
        this.add_group_member();
      }

      for (let i = 0; i < this.users_to_invite.length; ++i) {
        if (this.users_to_invite[i].username.trim() === this.course.allowed_guest_domain) {
          this.incomplete_input_present = true;
          return;
        }
        usernames.push(this.users_to_invite[i].username.trim());
        Vue.set(this.users_to_invite, i, {
          id: i + 1,
          username: this.users_to_invite[i].username.trim()
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

  @handle_api_errors_async(handle_cancel_invitation_error)
  async cancel_invitation() {
    try {
      this.d_cancelling_invitation = true;
      (<APIErrors> this.$refs.cancel_invitation_api_errors).clear();
      await this.invitation_sent!.reject();
      this.invitation_sent = null;
      (<Modal> this.$refs.cancel_group_invitation_modal).close();
    }
    finally {
      this.d_cancelling_invitation = false;
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

#group-registration-title {
  font-size: 24px;
  font-weight: 500;
}

#group-registration-options {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 10px 0;
}

#registration-closed {
  padding: 10px 0;
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

.group-members-title {
  padding: 10px 0;
  margin: 0;
}

.add-member-button {
  margin-bottom: 15px;
}

#invitations-received-title {
  padding: 5px 0;
  font-size: 18px;
}

.invitation {
  margin-bottom: 10px;
}

#pending-invitations-title {
  margin-top: 20px;
  padding: 5px 0;
  font-size: 18px;
}

#invitation-sent {
  padding: 10px 20px 10px 10px;
  border: 2px solid $pebble-medium;
  border-radius: 5px;
  display: inline-block;
}

#invitation-sent .list-of-usernames {
  margin-bottom: 15px;
}

.resolve-invitation-message {
  padding: 10px 0;
}

.confirm-cancel-sent-invitation-button,
.cancel-send-invitation-button,
.cancel-confirm-working-alone-button,
.work-alone-button {
  margin-right: 10px;
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
