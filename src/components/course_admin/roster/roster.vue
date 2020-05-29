<template>
  <div class="roster-container">
    <div class="adding-container">
      <validated-form id="add-users-form"
                      autocomplete="off"
                      @submit="add_users"
                      @form_validity_changed="d_form_is_valid = $event">
        <label class="enrollment-add-label"> Add {{role}}
          <tooltip width="medium" placement="bottom">
            Enter a comma-separated list of email addresses.
          </tooltip>
        </label>
        <ValidatedInput ref="add_users_textarea"
                        id="add-users-input"
                        v-model="d_form_text"
                        :validators="[email_list_validator]"
                        :num_rows="7">
        </ValidatedInput>
        <slot name="before_save_button"></slot>
        <div class="button-footer">
          <button type="submit"
                  data-testid="add_users_button"
                  class="save-button"
                  :disabled="!d_form_is_valid">
            Add to Roster
          </button>

          <button v-if="include_replace_button"
                  type="button"
                  data-testid="replace_users_button"
                  @click="replace_users"
                  class="orange-button"
                  :disabled="!d_form_is_valid">
            Replace Roster
          </button>
        </div>
      </validated-form>
    </div>

    <div class="enrolled-container">
      <div v-if="d_roster.length !== 0"
            class="user-table-wrapper">
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
                  :title="'Delete ' + person.username"
                  @click="remove_person_from_roster([person], index)">
              </i>
            </td>
          </tr>
        </table>
      </div>
      <div v-else class="empty-roster-message">
        The {{role}} roster is currently empty
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { User } from 'ag-client-typescript';

import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { is_email } from '@/utils';

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

  @Prop({default: false, type: Boolean})
  include_replace_button!: boolean;

  d_form_is_valid = false;

  d_form_text = '';
  d_roster: User[] = [];

  @Watch('roster')
  on_roster_change(new_users_array: User[], old_users_array: User[]) {
    this.d_roster = new_users_array.slice(0);
    this.sort_users(this.d_roster);
  }

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

  email_list_validator(value: string): ValidatorResponse {
    let {valid_emails, invalid_emails} = parse_emails(value);

    let is_valid = invalid_emails.length === 0;
    let error_msg = is_valid ? '' : invalid_emails[0] + " is not a valid email.";
    return {
      is_valid: is_valid,
      error_msg: error_msg,
    };
  }

  add_users() {
    let {valid_emails} = parse_emails(this.d_form_text);
    this.$emit('add_users', valid_emails);
  }

  replace_users() {
    let {valid_emails} = parse_emails(this.d_form_text);
    this.$emit('replace_users', valid_emails);
  }

  remove_person_from_roster(person_to_delete: User[], index: number) {
    this.$emit('remove_user', person_to_delete);
  }

  reset_form() {
    this.d_form_text = "";
    let validated_input = <ValidatedInput> this.$refs.add_users_textarea;
    validated_input.reset_warning_state();
    this.d_form_is_valid = false;
  }
}

function parse_emails(to_parse: string): {valid_emails: string[], invalid_emails: string[]} {
  let valid_emails = [];
  let invalid_emails = [];

  // Replace commas with spaces
  to_parse = to_parse.replace(/,+/g, " ");
  let trimmed_input = to_parse.trim();
  // Split at whitespace
  let usernames = trimmed_input.split(/\s+/g);
  for (let username of usernames) {
    if (is_email(username)) {
      valid_emails.push(username);
    }
    else {
      invalid_emails.push(username);
    }
  }

  return {valid_emails: valid_emails, invalid_emails: invalid_emails};
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.empty-roster-message {
  color: darken($stormy-gray-dark, 10%);
}

.enrollment-add-label {
  color: black;
  font-size: 1.25rem;
  font-weight: bold;
}

.user-table-wrapper {
  overflow: auto;
}

.user-table {
  border-collapse: collapse;
}

.user-table {
  th {
    border-bottom: 2px solid hsl(210, 20%, 92%);
    color: black;
  }

  th, td {
    padding: .625rem .872rem;
    font-size: 1rem;
  }

  tr td {
    border-bottom: 1px solid hsl(210, 20%, 94%);
  }
}

.odd-row {
  background-color: white;
}

.even-row {
  background-color: $white-gray;
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
}

.name {
  color: lighten(black, 20);
}

.remove-user-column {
  text-align: center;
  width: 5%;
}

.remove-user {
  color: hsl(212, 10%, 47%);
  cursor: pointer;

  &:hover {
    color: $navy-blue;
  }
}

</style>
