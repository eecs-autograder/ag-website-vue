<template>
  <div>
  <div id="group-registration-title"> Group Registration </div>
    <div id="button-decision-container">
      <button class="blue-button work-alone-button"
              @click="$refs.confirm_working_alone_modal.open()"> I am working alone </button>
      <button class="green-button"
              @click="$refs.send_group_invitation_modal.open()"> Create new invitation </button>
    </div>









    <modal ref="confirm_working_alone_modal" size="medium">
      <div class="modal-header"> Confirm Working Alone </div>
      <hr>
      <div class="modal-body">
        <div class="modal-message">
          Are you sure you want to work alone?
          Once you accept you cannot have a partner for this project.
        </div>
        <div class="modal-button-container">
          <button class="light-gray-button cancel-button"
                  @click="$refs.confirm_working_alone_modal.close()"> Cancel </button>
          <button class="blue-button"
                  @click="work_alone"> Work Alone </button>
        </div>
      </div>
    </modal>

    <modal ref="send_group_invitation_modal" size="large">
      <div class="modal-header"> Send Group Invitation </div>
      <hr>
      <div class="modal-body">
        <div class="modal-message">
          <div> Inputs for up to max group size group members </div>
        </div>
        <div class="modal-button-container">
          <button class="light-gray-button cancel-button"
                  @click="$refs.send_group_invitation_modal.close()"> Cancel </button>
          <button class="blue-button"
                  @click="send_invitation"> Send Invitation </button>
        </div>
      </div>
    </modal>
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Course, Group, GroupInvitation, Project } from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import { handle_api_errors_async } from '@/utils';

@Component({
  components: {
    APIErrors,
    Modal
  }
})
export default class GroupRegistration extends Vue {
  @Prop({required: true, type: Project})
  project!: Project;

  @Prop({required: true, type: Course})
  course!: Course;

  invited_usernames: string[] = [];

  async work_alone() {
    console.log("Work alone");
    // let group = await Group.create_solo_group(this.project.pk);
    (<Modal> this.$refs.confirm_working_alone_modal).close();
  }

  @handle_api_errors_async(handle_send_invitation_error)
  async send_invitation() {
    console.log("Send invitation");
    // await GroupInvitation.send_invitation(this.project.pk, this.invited_usernames);
    (<Modal> this.$refs.send_group_invitation_modal).close();
  }

  @handle_api_errors_async(handle_cancel_invitation_error)
  async cancel_invitation() {
    // reject????
    console.log("Send invitation");
  }
}

function handle_cancel_invitation_error(component: GroupRegistration, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}

function handle_send_invitation_error(component: GroupRegistration, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';

#group-registration-title {
  font-size: 18px;
  font-weight: 500;
}

#button-decision-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 10px 0;
}

.modal-button-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 0;
}

.work-alone-button {
  margin-right: 10px;
}

.modal-message {
  padding: 10px 0;
}

.cancel-button {
  margin-right: 10px;
}

.modal-header {
  font-size: 20px;
  font-weight: bold;
}
</style>
