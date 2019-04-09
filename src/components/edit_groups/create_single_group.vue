<template>
  <div id="create-group-component">
    <div id="create-group-title"> Create Group: </div>
    <div class="create-group-container">
      <p class="group-members-label"> Group members: </p>
      <div class="add-group-members-container">
        <div v-for="(member, index) of group_members">
          <div class="group-member-editing">
            <div class="username-validated-container">
              <validated-input v-model="member.username"
                              :validators="[]"
                              :num_rows="1"
                              input_style="width: 100%;
                                           border: 1px solid #ced4da;">
              </validated-input>
            </div>
            <div class="remove-group-member"
                 :title="`Remove ${member.username} from group`"
                 @click="remove_group_member(index)">
              <i class="fas fa-times"></i>
            </div>
          </div>
        </div>
        <div class="add-member-container">
          <button class="add-member-button"
                  :disabled="group_members.length >= max_group_size"
                  @click="add_group_member">
            Add Another Member
          </button>
        </div>
      </div>
      <APIErrors ref="api_errors"></APIErrors>
      <button class="create-group-button"
              :disabled="d_creating_group"
              @click="create_group()"> Create Group </button>
      <div v-if="successful_submission"
           :class="d_creating_group ? 'successful-group-creation' : 'done-adding-group'">
        <i class="fas fa-check"></i>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import APIErrors from '@/components/api_errors.vue';
  import ValidatedInput from '@/components/validated_input.vue';

  import { Project } from 'ag-client-typescript';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
    components: {
      APIErrors,
      ValidatedInput
    }
  })
  export default class CreateSingleGroup extends Vue {

    @Prop({required: true, type: Project})
    project!: Project;

    group_members: Object[] = [{username: '@umich.edu'}];

    max_group_size = 3;

    d_creating_group = false;

    successful_submission = false;

    async create_group() {
      try {
        this.d_creating_group = true;
        // Group.create(this.project.pk, data: NewGroupData); returns the group - just dont do anything with it?
        // Group.create_solo_group(this.project.pk); again, returns group
        // merge might come into play here too?
        this.successful_submission = true;
        setTimeout(() => {
          this.d_creating_group = false;
          setTimeout(() => {
            this.successful_submission = false;
            this.group_members = [{username: '@umich.edu'}];
          }, 1000);
        }, 1500);
      }
      catch(error) {
        this.d_creating_group = false;
      }
    }

    remove_group_member(index: number) {
      this.group_members.splice(index, 1);
    }

    add_group_member() {
      this.group_members.push({username: '@umich.edu'});
    }

  }
</script>

<style scoped lang="scss">
  @import "@/styles/button_styles.scss";
  @import '@/styles/colors.scss';
  @import url('https://fonts.googleapis.com/css?family=Quicksand');
  $current-lang-choice: 'Quicksand';

  #create-group-component {
    font-family: Quicksand;
    /*width: 95%;*/
    /*margin: 0 2.5%;*/
  }

  .create-group-container {
    background-color: white;
    border-radius: 3px;
    padding: 16px 0;
    display: inline-block;
  }

  #create-group-title {
    font-size: 16px;
    font-weight: bold;
    margin: 0;
    padding: 0 0 8px 0;
    color: lighten(black, 25);
    width: 160px;
    //border-bottom: 2px dashed $stormy-gray-dark;
  }

  .create-group-button {
    @extend .teal-button;
  }

  .create-group-button:disabled, .add-member-button:disabled {
    @extend .gray-button;
  }

  .create-group-button, .create-group-button:disabled {}

  .selected-group {
    display: inline-block;
    margin-top: 10px;
    padding: 5px 10px 0 0;
    border-radius: 5px;
  }

  .group-members-label {
    color: black;
    font-size: 16px;
    font-weight: bold;
    margin: 0;
    padding: 0 10px 10px 0;
    display: inline-block;
    vertical-align: top;
  }

  .group-member {
    font-size: 16px;
    margin: 0 0 10px 0;
    padding: 3px 8px;
    background-color: hsl(212, 70%, 95%);
    display: inline-block;
    border-radius: 5px;
    color: hsl(212, 50%, 20%);
  }

  .remove-group-member {
    cursor: pointer;
    display: inline-block;
    padding: 7px 11px;
    border-radius: 3px;
    margin-left: 8px;
    /*background-color: hsl(220, 30%, 30%);*/
    /*color: white;*/
  }

  .remove-group-member:hover {
    background-color: hsl(220, 30%, 30%);
    color: white;
  }

  .username-validated-container {
    display: inline-block;
  }

  .group-member-editing {
    padding-bottom: 10px;
  }

  .add-member {
    color: white;
  }

  .add-member-button {
    @extend .dark-purple-button;
  }

  .add-member-container {
    padding: 8px 0 15px 0;
    cursor: pointer;
    display: inline-block;
  }

  @keyframes fadeIn {
    from { opacity: 0;}
    to { opacity: 1;}
  }

  @keyframes fadeOut {
    from { opacity: 1;}
    to { opacity: 0;}
  }

  .successful-group-creation {
    animation-duration: 0.5s;
    animation-name: fadeIn;
    color: $save-green;
    display: inline-block;
    padding-left: 15px;
  }

  .done-adding-group {
    animation-duration: 1s;
    animation-name: fadeOut;
    color: $save-green;
    display: inline-block;
    padding-left: 15px;
  }

</style>
