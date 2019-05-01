<template>
  <div class="roster-container">
    <div class="adding-container">
      <validated-form id="add-users-form"
                      autocomplete="off"
                      @submit.native.prevent="add_users"
                      @form_validity_changed="add_users_form_is_valid = $event">
        <label class="enrollment-add-label"> Add {{role}}
          <i class="far fa-question-circle add-users-tooltip">
            <tooltip width="large" placement="right">
              Enter a comma-separated list of email addresses.
            </tooltip>
          </i>
        </label>
        <ValidatedInput ref="add_users_textarea"
                        id="add-users-input"
                        input_style="border-width: 2px"
                        v-model="users_to_add"
                        :validators="[contains_valid_emails]"
                        :num_rows="7">
        </ValidatedInput>
        <button type="submit"
               id="add-users-button"
               :disabled="!add_users_form_is_valid">
          Add to Roster
        </button>
      </validated-form>
    </div>

    <div class="enrolled-container">
      <div>
        <div  v-if="d_roster.length !== 0" class="user-table-wrapper">
          <table class="user-table">
            <tr>
              <th class="email-column"> Username </th>
              <th class="name-column"> Name </th>
              <th class="remove-user-column"> Remove </th>
            </tr>
            <tr v-for="(person, index) in d_roster"
                :class="index % 2 ? 'odd-row' : 'even-row'">
              <td class="email-column email">{{person.username}}</td>
              <td class="name-column name">{{person.first_name}} {{person.last_name}}</td>
              <td class="remove-user-column">
                <i class="fas fa-user-times remove-user"
                   @click="remove_person_from_roster([person], index)">
                </i>
              </td>
            </tr>
          </table>
        </div>
        <div v-else class="empty-roster-message">
          The {{role}} roster for this course is currently empty! You can add {{role}}
          by entering a comma-separated list of their emails in the textarea above!
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
  export default class Roster extends Vue {
    @Prop({required: true, type: String})
    role!: string;

    @Prop({required: true, type: Array})
    roster!: User[];

    first_invalid_email: string | null = null;
    add_users_form_is_valid = false;

    @Watch('roster')
    on_roster_change(new_users_array: User[], old_users_array: User[]) {
      this.d_roster = new_users_array.slice(0);
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

    add_users() {
      let valid_usernames: string[] = [];
      this.check_for_invalid_emails(this.users_to_add, valid_usernames);
      if (this.first_invalid_email === null) {
        this.$emit('add_users', valid_usernames);
        this.users_to_add = "";
        let validated_input = <ValidatedInput> this.$refs.add_users_textarea;
        validated_input.reset_warning_state();
        this.add_users_form_is_valid = false;
      }
    }

    remove_person_from_roster(person_to_delete: User[], index: number) {
      this.$emit('remove_user', person_to_delete);
      this.d_roster.splice(index, 1);
    }
  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/course_admin.scss';

.roster-container {
  margin: 0;
}

.adding-container {
  margin: 0 5%;
}

.enrolled-container {
  margin: 15px 5% 0 5%;
  padding: 0 0 50px 0;
}

.add-users-tooltip {
  color: #8785a2;
  font-size: 18px;
  margin-left: 3px;
  top: 1px;
}

#add-users-button {
  @extend .green-button;
}

#add-users-button:disabled {
  @extend .gray-button;
}

#add-users-button, #add-users-button:disabled {
  display: block;
  font-size: 16px;
  margin: 15px 0 15px 0;
  padding: 10px 15px;
}

.enrollment-add-label {
  color: black;
  display: block;
  font-size: $title-size;
  font-weight: 600;
  margin: 0;
  padding: 10px 0 8px 1px;
  position: relative;
}

.user-table {
  border-collapse: collapse;
  margin-top: 15px;
}

.user-table th {
  border-bottom: 2px solid hsl(200, 1%, 85%);
  color: black;
  font-size: 16px;
  padding: 10px 15px 10px 15px;
}

.email-column {
  text-align: left;
  width: 45%;
}

.email {
  color: black;
}

.name-column {
  text-align: left;
  width: 50%;
  word-spacing: 4px;
}

.name {
  color: lighten(black, 20);
}

.remove-user-column {
  text-align: center;
  width: 5%;
}

.user-table td {
  margin-bottom: 10px;
  padding: 10px 15px 10px 15px;
  position: relative;
}

.user-table tr td {
  border-bottom: 1px solid hsl(200, 1%, 85%);
}

.odd-row {
  background-color: hsl(200, 57%, 100%);
}

.even-row {
  background-color: hsl(240, 10%, 96%);
}

.user-table-wrapper {
  overflow: scroll;
}

.remove-user {
  color: hsl(200, 1%, 40%);
  cursor: pointer;
}

.remove-user:hover {
  color: black;
}

::-webkit-scrollbar {
  background: transparent;
  width: 0;
}

@media only screen and (min-width: 481px) {
  .adding-container, .enrolled-container {
    margin: 0 2.5%;
  }

  .user-table {
    width: 100%;
  }
}

@media only screen and (min-width: 768px) {
  .user-table-wrapper {
    overflow: visible;
  }
}
</style>
