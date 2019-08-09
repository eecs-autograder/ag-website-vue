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
                @click="open_send_group_invitation_modal()"> Create new invitation </button>
      </div>


    </div>

    <div v-if="project.disallow_group_registration"
         id="registration-closed">
      Group registration has been closed for this project.
      Please email the course staff if you need to create a group.
    </div>

    <div v-else id="registration-open">

      <div class="resolve-invitation-message"
           v-if="invitations_received.length > 0 || invitation_sent !== null">
        <i class="fas fa-square resolve-symbol"></i>
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
              <button id="cancel-sent-invitation-button"
                      class="white-button"
                      @click="$refs.cancel_group_invitation_modal.open()"> Cancel Invitation
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
          <button id="cancel-confirm-working-alone-button"
                  class="white-button"
                  @click="$refs.confirm_working_alone_modal.close()"> Cancel </button>
          <button id="confirm-working-alone-button"
                  class="purple-button"
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
            <p class="send-group-invitation-modal-title"> Users to Invite: </p>
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
                        class="white-button"
                        type="button"
                        @click="$refs.send_group_invitation_modal.close()">
                  Cancel
                </button>
                <button id="confirm-send-invitation-button"
                        class="purple-button"
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
                    class="white-button"
                    @click="$refs.cancel_group_invitation_modal.close()"> Keep Invitation </button>
            <button id="confirm-cancel-sent-invitation-button"
                    class="orange-button"
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

  invitee_acceptance_status(username: string) {
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
@import '@/styles/components/group_registration.scss';

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

.resolve-invitation-message {
  padding: 15px 20px 2px 20px;
  width: 100%;
}

.resolve-symbol {
  margin: 0 5px;
  color: $base-purple;
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
  @include invitation_container_header($base-teal, $base-teal);
  color: white;
  font-weight: bold;
}

#invitation-sent-title {
  font-size: 20px;
}

#invitation-sent-body {
  @include invitation_container_body($base-teal);
}

.invitation-sent-table-row {
  @extend .invitation-table-row;
}

#invitation-sent-footer {
  @include invitation_container_footer($base-teal, $base-teal);
}

#cancel-sent-invitation-button {
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

.add-member-button {
  margin-bottom: 15px;
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
    padding: 15px 20px 10px 20px;
    text-align: left;
  }

  #group-registration-bar-buttons {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    padding: 10px 20px 20px 20px;
  }

  #work-alone-button {
    margin-right: 10px;
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

  .resolve-invitation-message {
    padding-left: 20px;
    margin: 10px 0 2px 0;
    width: 100%;
  }
}

</style>
