<template>
  <div class="permissions-container">
    <div v-if="d_roster !== null">
      <div class="class-permissions-body">
        <div class="adding-container">
          <validated-form id="add-permissions-form"
                          autocomplete="off"
                          @submit.native.prevent="add_permissions"
                          @form_validity_changed="permissions_form_is_valid = $event">
            <label class="enrollment-add-label"> Add {{role}}
              <i class="far fa-question-circle permission-tooltip">
                <tooltip width="large" placement="top">
                  Enter a comma-separated list of email addresses.
                </tooltip>
              </i>
            </label>
            <ValidatedInput ref="permissions_textarea"
                            id="add-permissions-input"
                            input_style="border-width: 2px"
                            v-model="users_to_add"
                            :validators="[contains_valid_emails]"
                            :num_rows="7">
            </ValidatedInput>
            <input type="submit"
                   class="add-permissions-button"
                   value="Add to Roster"
                   :disabled="!permissions_form_is_valid">
          </validated-form>
        </div>

        <div class="enrolled-container">
          <div>
            <div class="permissions-column">
              <table class="permissions-table">
                <tr>
                  <th class="email-column"> Username </th>
                  <th class="name-column"> Name </th>
                  <th class="delete-column"> Delete </th>
                </tr>
                <tr v-for="(person, index) in d_roster"
                    :class="index % 2 ? 'odd-row' : 'even-row'">
                  <td class="email-column email">{{person.username}}</td>
                  <td class="name-column name">{{person.first_name}} {{person.last_name}}</td>
                  <td class="delete-column">
                    <i class="fas fa-user-times delete-permission"
                       @click="remove_person_from_roster([person], index)">
                    </i>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Tooltip from '@/components/tooltip.vue';
  import ValidatedForm from '@/components/validated_form.vue';
  import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';

  import { User } from 'ag-client-typescript';
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  @Component({
   components: {
     Tooltip,
     ValidatedForm,
     ValidatedInput
   }
  })
  export default class Permissions extends Vue {
    @Prop({required: true, type: String})
    role!: string;

    @Prop({required: true, type: Array})
    roster!: User[];

    first_invalid_email: null | string = null;
    permissions_form_is_valid = false;

    @Watch('roster')
    on_roster_change(new_permissions_array: User[], old_permissions_array: User[]) {
      this.d_roster = this.roster.slice(0);
      this.sort_users(this.d_roster);
    }

    saving = false;
    users_to_add = '';
    d_roster: User[] = [];

    async created() {
      this.d_roster = this.roster.slice(0);
      this.sort_users(this.d_roster);
    }

    sort_users(users: User[]) {
      users.sort((user_a: User, user_b: User) => {
        if (user_a.username <= user_b.username) {
          return -1;
        }
        return 1;
      });
    }

    contains_valid_emails(value: string): ValidatorResponse {
      this.check_for_invalid_emails(value, []);
      return {
        is_valid: this.first_invalid_email === null,
        error_msg: this.first_invalid_email + " is not a valid email."
      };
    }

    check_for_invalid_emails(string_of_emails: string, valid_usernames: string[]) {
      this.first_invalid_email = null;
      string_of_emails = string_of_emails.replace(/,+/g, " ");
      let split_regex = /\s+/g;
      let valid_email_regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      let trimmed_input = string_of_emails.trim();
      let usernames = trimmed_input.split(split_regex);
      for (let username of usernames) {
        if (valid_email_regex.test(username)) {
          valid_usernames.push(username);
        }
        else {
          this.first_invalid_email = username;
          return;
        }
      }
    }

    add_permissions() {
      let valid_usernames: string[] = [];
      this.check_for_invalid_emails(this.users_to_add, valid_usernames);
      if (this.first_invalid_email === null) {
        this.$emit('add_permissions', valid_usernames);
        this.users_to_add = "";
        let validated_input = <ValidatedInput> this.$refs.permissions_textarea;
        validated_input.clear();
        this.permissions_form_is_valid = false;
      }
    }

    remove_person_from_roster(person_to_delete: User[], index: number) {
      this.$emit('remove_permission', person_to_delete);
      this.d_roster.splice(index, 1);
    }
  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';
  @import '@/styles/button_styles.scss';
  @import url('https://fonts.googleapis.com/css?family=Quicksand');

  $current-lang-choice: "Quicksand";
  $github-black-color: #24292e;

  .course-admin-component {
    font-family: $current-lang-choice;
  }

  /* ---------------- Permissions Styling ---------------- */

  .invalid-email{
    color: $github-black-color;
  }

  .class-permissions-body {
    margin: 0;
  }

  .adding-container {
    margin: 0 10%;
  }

  .enrolled-container {
    margin: 15px 10% 0 10%;
    padding: 0 0 50px 0;
  }

  .permission-tooltip {
    color: #8785a2;
    margin-left: 3px;
    font-size: 18px;
    top: 1px;
  }

  .add-permissions-button {
    @extend .green-button;
    display: block;
    font-family: $current-lang-choice;
    font-size: 16px;
    margin: 11px 0 0 0;
    padding: 20px 15px;
  }

  .add-permissions-button:disabled {
    @extend .gray-button;
  }

  .add-permissions-button:disabled:hover {
    background-color: hsl(210, 13%, 63%);
    cursor: default;
  }

  .enrollment-add-label {
    display: block;
    font-size: 17px;
    padding: 6px 0 10px 0;
    margin: 0;
    position: relative;
    font-weight: 600;
    color: $github-black-color;
  }

  .permissions-table {
    margin-top: 15px;
    border-collapse: collapse;
  }

  .permissions-table th {
    color: $github-black-color;
    padding: 10px 15px 10px 15px;
    border-bottom: 2px solid hsl(200, 1%, 85%);
    font-size: 16px;
  }

  .email-column {
    width: 45%;
  }

  .email {
    color: $github-black-color;
  }

  .name-column {
    width: 50%;
    word-spacing: 4px;
  }

  .name {
    color: lighten($github-black-color, 20);
  }

  .delete-column {
    width: 5%;
    text-align: center;
  }

  .permissions-table td {
    padding: 10px 15px 10px 15px;
    margin-bottom: 10px;
    position: relative;
  }

  .permissions-table tr td {
    border-bottom: 1px solid hsl(200, 1%, 85%);
  }

  .odd-row {
    background-color: hsl(200, 57%, 100%);
  }

  .even-row {
    background-color: hsl(240, 10%, 96%);
  }

  .permissions-column {
    overflow: scroll;
  }

  .delete-permission {
    cursor: pointer;
    color: hsl(200, 1%, 40%);
  }

  .delete-permission:hover {
    color: $github-black-color;
  }

  ::-webkit-scrollbar {
    width: 0;  /* remove scrollbar space */
    background: transparent;  /* optional: just make scrollbar invisible */
  }

  @media only screen and (min-width: 481px) {

    .add-permissions-button, .add-permissions-button:disabled {
      padding: 10px 15px;
      font-family: $current-lang-choice;
      font-size: 16px;
      margin: 10px 0 0 0;
    }

    .adding-container, .enrolled-container {
      margin: 0 10%;
    }

    .permissions-table {
      width: 100%;
    }

    .enrollment-add-label {
      padding: 0 0 10px 0;
    }
  }

  @media only screen and (min-width: 768px) {
    .permissions-column {
      overflow: visible;
    }
  }

</style>
