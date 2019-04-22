<template>
  <div id="create-group-component">
    <div class="create-group-container">
      <validated-form ref="create_group_form"
                      autocomplete="off"
                      spellcheck="false"
                      @submit.native.prevent="create_group">
        <p class="group-members-label"> Group members: </p>
        <div class="add-group-members-container">
          <div v-for="(member, index) of group_members">
            <div class="group-member-editing">
              <div class="username-validated-container">
                <validated-input ref="member_name_input"
                                 v-model="member.username"
                                 :key="member.id"
                                 :validators="[is_not_empty]"
                                 :num_rows="1"
                                 input_style="width: 80%;
                                              border: 1px solid #ced4da;">
                  <button slot="suffix" class="remove-member-button"
                          :title="`Remove ${member} from group`"
                          type="button"
                          :disabled="group_members.length === 1"
                          @click="remove_group_member(index)">
                    <i class="fas fa-times"></i>
                  </button>
                </validated-input>
              </div>
            </div>
          </div>
          <div class="add-member-container">
            <button class="add-member-button"
                    :disabled="group_members.length === max_group_size"
                    @click="add_group_member">
              {{group_members.length === 0 ? "Add A member" : "Add Another Member"}}
            </button>
          </div>
        </div>

        <APIErrors ref="api_errors"> </APIErrors>
        <button class="create-group-button"
                type="submit"
                :disabled="d_creating_group">
          Create Group
        </button>
      </validated-form>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import APIErrors from '@/components/api_errors.vue';
  import ValidatedForm from '@/components/validated_form.vue';
  import ValidatedInput from '@/components/validated_input.vue';

  import { Course, Group, NewGroupData, Project } from 'ag-client-typescript';

  import { handle_api_errors_async } from '@/utils';
  import { is_not_empty } from '@/validators';

  interface GroupMember {
    id: number;
    username: string;
  }

  @Component({
    components: {
      APIErrors,
      ValidatedForm,
      ValidatedInput
    }
  })
  export default class CreateSingleGroup extends Vue {

    readonly is_not_empty = is_not_empty;

    @Prop({required: true, type: Project})
    project!: Project;

    allowed_guest_domain = "";
    d_creating_group = false;
    group_members: GroupMember[] = [];
    max_group_size = 1;
    min_group_size = 1;

    async created() {
      this.min_group_size = this.project.min_group_size;
      this.max_group_size = this.project.max_group_size;
      let course = await Course.get_by_pk(this.project.course);
      this.allowed_guest_domain = course.allowed_guest_domain;
      for (let i = 0; i < this.min_group_size; ++i) {
        this.group_members.push(
          {
            id: i + 1,
            username: this.allowed_guest_domain
          }
        );
      }
    }

    @handle_api_errors_async(handle_create_group_error)
    async create_group() {
      try {
        this.d_creating_group = true;
        let list_of_members: string[] = [];
        for (let group_member of this.group_members) {
          list_of_members.push(group_member.username);
        }
        await Group.create(this.project.pk, new NewGroupData({member_names: list_of_members}));
        for (let i = 0; i < this.min_group_size; ++i) {
          this.group_members.push(
            {
              id: i + 1,
              username: this.allowed_guest_domain
            }
          );
        }
      }
      finally {
        this.d_creating_group = false;
      }
    }

    remove_group_member(index: number) {
      if (this.group_members.length !== 1) {
        this.group_members.splice(index, 1);
      }
    }

    add_group_member() {
      this.group_members.push({
          id: this.group_members.length,
          username: this.allowed_guest_domain
      });
    }
  }

  function handle_create_group_error(component: CreateSingleGroup, error: unknown) {
    (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
  }
</script>

<style scoped lang="scss">
@import "@/styles/button_styles.scss";
@import '@/styles/colors.scss';
@import '@/styles/components/edit_groups.scss';
@import url('https://fonts.googleapis.com/css?family=Quicksand');
$current-lang-choice: 'Quicksand';

#create-group-component {
  font-family: Quicksand;
}

.create-group-container {
  background-color: white;
  border-radius: 3px;
  padding: 0 0 16px 0;
  display: inline-block;
}

#create-group-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  padding: 0 0 8px 0;
  color: lighten(black, 25);
  width: 160px;
}

.create-group-button {
  @extend .teal-button;
}

.create-group-button:disabled {
  @extend .light-gray-button;
  color: hsl(220, 30%, 25%);
}

.create-group-button, .create-group-button:disabled {
  margin-top: 15px;
}

</style>
