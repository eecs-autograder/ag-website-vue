<template>
  <div class="permissions-container">
    <div v-if="d_roster !== null">
      <div class="class-permissions-body">
        <div class="adding-container">
          <validated-form id="add-permissions-form"
                autocomplete="off"
                @submit.native.prevent="add_permissions"
                @form_validity_changed="permissions_form_is_valid = $event">

            <!--<p> Form is valid: {{permissions_form_is_valid}} </p>-->
            <label class="enrollment-add-label"> Add {{role}}
              <i class="far fa-question-circle permission-tooltip">
                <tooltip width="large" placement="top">
                  Enter a comma-separated list of email addresses.
                </tooltip>
              </i>
            </label>
            <ValidatedInput
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
                  <th class="delete-column">  </th>
                </tr>
                <tr v-for="(person, index) in d_roster"
                    :class="index % 2 ? 'odd-row' : 'even-row'">
                  <td class="email-column email">{{person.username}}</td>
                  <td class="name-column name"> {{names[index % 10]}}</td>
                  <td class="delete-column"> <i class="fas fa-user-times delete-permission"
                          @click="remove_person_from_roster([person], index)"></i> </td>
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

    names = ["Pam Beesly", "Jim Halpert", "Phyllis Lapin Vance", "Stanley Hudson",
             "Dwight Shrute", "Angela Martin", "Oscar Martinez", "Kevin Malone", "Michael Scott",
             "Meredith Palmer"];

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
      // console.log("VALIDATOR FUNCTION");
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
      // console.log(trimmed_input);
      let usernames = trimmed_input.split(split_regex);
      // console.log(usernames);
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

    // ch%cken.n00dle.s0up+soda-on_the-side@2007-WebstarAndYoungB.edu

    add_permissions() {
      // console.log("ADD PERMISSIONS");
      let valid_usernames: string[] = [];
      this.check_for_invalid_emails(this.users_to_add, valid_usernames);
      if (this.first_invalid_email === null) {
        // console.log("Success");
        this.$emit('add_permissions', valid_usernames);
        this.users_to_add = "";
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
  @import url('https://fonts.googleapis.com/css?family=Montserrat');
  @import url('https://fonts.googleapis.com/css?family=Sawarabi+Gothic');
  @import url('https://fonts.googleapis.com/css?family=Muli');

  $current-lang-choice: "Muli";
  //$current-lang-choice: "Sawarabi Gothic";
  $github-black-color: #24292e;

  .course-admin-component {
    font-family: $current-lang-choice;
  }

  .tab-header {
    margin: 0;
    font-size: 18px;
    padding: 10px 25px 12px 25px;
    font-weight: 500;
  }

  .tab-body {
    padding-top: 30px;
    text-align: left;
    position: relative;
  }

  .tab-label {
    outline: none;
  }

  /* ---------------- Permissions Styling ---------------- */

  .error-ul {
    list-style-type: none; /* Remove bullets */
    padding-left: 0;
    max-width: 500px;
    width: 100%
  }

  .invalid-email{
    color: $github-black-color;
  }

  .error-li:first-child {
    margin-top: -10px;
    border-top-left-radius: .25rem;
    border-top-right-radius: .25rem;
  }

  .error-li:last-child {
    margin-bottom: 0;
    border-bottom-right-radius: .25rem;
    border-bottom-left-radius: .25rem;
  }

  .error-ul .error-li {
    box-sizing: border-box;
    word-wrap: break-word;
    position: relative;
    padding: 10px 15px;
    margin-bottom: -1px;
    color: #721c24;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
  }

  .class-permissions-body {
    margin: 0;
  }

  .adding-container {
    margin: 0 10%;
  }

  .enrolled-container {
    margin: 0 10%;
    padding: 0 0 50px 0;
  }

  .permission-tooltip {
    color: #8785a2;
    margin-left: 3px;
    font-size: 20px;
    top: 1px;
  }

  .add-permissions-button {
    @extend .green-button;
    display: block;
    font-family: $current-lang-choice;
    font-size: 18px;
    margin: 18px 0 0 0;
    padding: 20px 15px;
    text-align: center;
  }

  .add-permissions-button:disabled {
    @extend .gray-button;
    text-align: center;
    display: block;
    font-family: $current-lang-choice;
    font-size: 18px;
    padding: 20px 15px;
    margin: 10px 0 20px 0;
  }

  .add-permissions-button:disabled:hover {
    background-color: hsl(210, 13%, 63%);
    cursor: default;
  }

  .permissions-row-content {
    text-align: left;
    padding: 0 2px;
    font-family: $current-lang-choice;
    font-size: 16px;
  }

  .enrollment-add-label {
    display: block;
    font-size: 20px;
    padding: 6px 0 10px 0;
    margin: 0;
    position: relative;
    font-weight: 800;
    color: $github-black-color;
  }

  .number-enrolled-message {
    margin: 30px 0 12px 0;
    font-size: 20px;
  }

  .permissions-table {
    margin-top: 15px;
    border-collapse: collapse;
    font-size: 18px;
  }

  .permissions-table th {
    color: $github-black-color;
    padding: 10px 15px 10px 15px;
    border-bottom: 2px solid hsl(200, 1%, 85%);
  }

  .email-column {
    width: 45%;
  }

  .email {
    color: $github-black-color;
  }

  .name {
    color: lighten($github-black-color, 20);
  }

  .name-column {
    width: 50%;
    word-spacing: 4px;
  }

  .delete-column {
    width: 5%;
  }

  .permissions-table td {
    padding: 14px 15px 14px 15px;
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
    background-color: hsl(240, 40%, 95%);
  }

  .permissions-column {
    /*max-width: 300px;*/
    overflow: scroll;
  }

  textarea {
    width: 97%;
    height: 200px;
    font-size: 16px;
    padding: 1%;
    border-radius: 6px;
    border: 2px solid $stormy-gray-dark;
    box-shadow: 0 2px 4px 0 rgba(0,0,0,0.1);
    margin: 0;
    outline: none;
    font-family: $current-lang-choice;
  }

  .delete-permission {
    cursor: pointer;
    color: hsl(200, 1%, 40%);
  }

  .delete-permission:hover {
    color: $github-black-color;
  }

  @media only screen and (min-width: 481px) {

    .add-permissions-button, .add-permissions-button:disabled {
      padding: 10px 15px;
      font-family: $current-lang-choice;
      font-size: 18px;
      display: inline-block;
    }

    .tab-body {
      margin-left: 2px;
      margin-right: 2px;
      border-top: 2px solid $pebble-dark;
    }

    .tab-header {
      padding: 10px 15px 10px 15px;
    }

    /* ---------------- Permissions Styling ---------------- */

    .adding-container, .enrolled-container {
      margin: 0 10%;
    }

    .permissions-table {
      width: 100%;
    }

    .enrollment-add-label {
      padding: 0 0 10px 0;
    }

    .add-permissions-button {
      margin-top: 20px;
    }

    .permissions-row-content {
      font-size: 18px;
    }

    /* ---------------- Projects Styling ---------------- */

  }

  @media only screen and (min-width: 768px) {
    /* ---------------- Edit Permissions Styling ---------------- */
    .permissions-column {
      overflow: visible;
    }
  }

</style>
