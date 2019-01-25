<template>
  <div class="permissions-container">
    <div v-if="d_roster !== null">
      <div class="class-permissions-body">
        <div class="adding-container">
          <form id="add-permissions-form" @submit.prevent="add_permissions">
            <label class="enrollment-add-label"> Add {{role}}
              <i class="far fa-question-circle enrollment-tooltip">
                <tooltip width="large" placement="top">
                  Enter a comma-separated list of email addresses.
                </tooltip>
              </i>
            </label>
            <ValidatedInput
              id="add_permissions_input"
              v-model="new_permissions_list"
              :validators="[]"
              :num_rows="7">
            </ValidatedInput>
            <input type="submit" class="add-permissions-button" value="Add to Roster">
          </form>
        </div>

        <div class="enrolled-container">
          <div>
            <div class="permissions-column">
              <table class="permissions-table">
                <tr>
                  <th> Username </th>
                  <th> First Name </th>
                  <th> Last Name </th>
                  <th></th>
                </tr>
                <tr v-for="(person, index) in d_roster"
                    :class="index % 2 ? 'odd-row' : 'even-row'">
                  <td class="username">{{person.username}}</td>
                  <td>{{person.first_name}}</td>
                  <td>{{person.last_name}}</td>
                  <td> <i class="fas fa-times delete-enrollee"
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

    @Watch('roster')
    on_roster_change(new_permissions_array: User[], old_permissions_array: User[]) {
      // console.log("role changed");
      // for (let person of this.d_roster) {
      //   console.log(person.username);
      // }
      this.d_roster = this.roster.slice(0);
      this.sort_users(this.d_roster);
      // console.log("*****************");
      // for (let person of this.d_roster) {
      //   console.log(person.username);
      // }
    }

    saving = false;
    new_permissions_list = "";
    d_roster: User[] = [];

    async created() {
      // console.log("created");
      this.d_roster = this.roster.slice(0);
      this.sort_users(this.d_roster);
      // for (let person of this.d_roster) {
      //   console.log(person.username);
      // }
    }

    sort_users(users: User[]) {
      users.sort((user_a: User, user_b: User) => {
        if (user_a.username <= user_b.username) {
          return -1;
        }
        return 1;
      });
    }

    // make this accept only emails of a certain type
    add_permissions() {
      if (this.new_permissions_list.trim() !== "") {
        this.new_permissions_list = this.new_permissions_list.replace(/,/g, ' ');
        let people_to_add = this.new_permissions_list.trim().split(/\ +/);
        this.$emit('add_permissions', people_to_add);
        this.new_permissions_list = "";
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

  $current-lang-choice: "Montserrat";

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

  .class-permissions-body {
    margin: 0;
  }

  .adding-container, .enrolled-container {
    margin: 0 10%;
  }

  .enrollment-tooltip {
    color: $ocean-blue;
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
  }

  .number-enrolled-message {
    margin: 30px 0 12px 0;
    font-size: 20px;
  }

  .permissions-table {
    margin-top: 15px;
    border-collapse: collapse;
    margin-bottom: 100px;
    box-shadow: 0 2px 4px 0 rgba(0,0,0,0.1);
    font-size: 18px;
  }

  .permissions-table th {
    background-color: $stormy-gray-dark;
    color: white;
    padding: 10px 25px;
  }

  .permissions-table td {
    padding: 10px 25px;
    margin-bottom: 10px;
    position: relative;
  }

  .permissions-table tr td {
    border-top: 3px solid white;
  }

  .odd-row {
    background-color: $pebble-medium;
  }

  .even-row {
    background-color: lighten($pebble-dark, 10);
  }

  .permissions-column {
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

  .delete-enrollee {
    position: absolute;
    color: $stormy-gray-dark;
    right: 30px;
    top: 13px;
    font-size: 18px;
    cursor: pointer;
  }

  .delete-enrollee:hover {
    color: black;
  }

  /* ---------------- Projects Styling ---------------- */

  #new-project-space {
    width: 80%;
    margin: 0 10%;
  }

  #new-project-label {
    font-size: 20px;
    margin: 0 0 12px 0;
    padding: 6px 0 0 0;
    font-weight: 800;
  }

  #new-project-input {
    width: 70.5%;
  }

  #existing-projects-side {
    width: 80%;
    margin: 0 10% 0 10%;
  }

  .existing-projects-label {
    font-size: 20px;
    margin: 40px 0 20px 0;
    padding: 6px 0 0 0;
    font-weight: 800;
  }

  .project-div {
    background-color: white;
    border-radius: 2px;
    width: 100%;
    max-width: 590px;
    display: block;
    margin: 10px 0;
  }

  .project-submission-div {
    width: 100%;
    position: relative;
    border-radius: 2px;
    display: inline-block;
  }

  .project-name {
    padding: 15px;
    margin: 0;
    display: inline-block;
  }

  .project-edit-div {
    display: block;
    vertical-align: top;
    width: 100%;
    background-color: white;
  }

  .edit-project-settings-button {
    background-color: hotpink;
    padding: 15px;
    text-align: center;
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
    color: black;
    display: none;
    box-sizing: border-box;
  }

  .edit-project-settings-button:hover {
    background-color: darken(hotpink, 4);
  }

  .project-div:hover {
    .edit-project-settings-button {
      display: block;
      margin-bottom: 20px;
    }
    .project-submission-div {
    }
  }

  a {
    text-decoration: none;
    color: black;
  }

  @media only screen and (min-width: 481px) {

    .tab-body {
      margin-left: 2px;
      margin-right: 2px;
      border-top: 2px solid $pebble-dark;
    }

    .tab-header {
      padding: 10px 15px 10px 15px;
    }

    .submit-button, .submit-button:disabled, .add-permissions-button {
      padding: 10px 15px;
      font-family: $current-lang-choice;
      font-size: 18px;
      margin: 0px 15px 12px 0;
      display: inline-block;
    }

    /* ---------------- Permissions Styling ---------------- */

    .adding-container, .enrolled-container {
      margin: 0 10%;
    }

    .permissions-table {
      width: 100%;
    }

    .enrollment-add-label {
      padding: 10px 0;
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

  @media only screen and (min-width: 960px) {

    #existing-projects-side {
      width: 60%;
      margin: 0;
      display: inline-block;
      vertical-align: top;
    }

    #new-project-space {
      text-align: left;
    }

    .existing-projects-label {
      font-size: 20px;
      margin: 0 0 12px 0;
      padding: 6px 0 0 0;
      text-align: left;
    }

    #new-project-side {
      width: 40%;
      display: inline-block;
    }

    .project-div {
      background-color: white;
      border-radius: 2px;
      width: 100%;
      max-width: 590px;
      display: block;
      margin: 5px 0;
    }

    .project-submission-div {
      width: 100%;
      max-width: 350px;
      position: relative;
      border-radius: 2px;
      display: inline-block;
      border: 2px solid lighten($pebble-dark, 10);
    }

    .project-name {
      padding: 15px;
      margin: 0;
      display: inline-block;
    }

    .project-edit-div {
      display: inline-block;
      vertical-align: top;
      width: 220px;
    }

    .edit-project-settings-button {
      padding: 15px;
      margin-left: 15px;
      border-radius: 3px;
      color: black;
      display: none;
      background-color: white;
    }

    .edit-project-settings-button:hover {
      background-color: $pebble-light;
    }

    .project-div:hover {
      .edit-project-settings-button {
        display: block;
        border: 2px solid hotpink;
        margin-bottom: 0;
      }
      .project-submission-div {
        background-image: linear-gradient(
            to right, darken(hotpink, 2), hotpink, darken(hotpink, 2), hotpink
        );
        border: 2px solid hotpink;
        color: white;
      }
    }
  }

</style>
