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
              <div class="username-container">
                <input :class="['member-name-input',
                               {'error-input': incomplete_input_present
                                 && member.username === allowed_guest_domain}]"
                       v-model="member.username"/>
                <button slot="suffix"
                        class="remove-member-button"
                        :disabled="group_members.length === 1"
                        :title="`Remove ${member} from group`"
                        type="button"
                        @click="remove_group_member(index)">
                  <i class="fas fa-times"></i>
                </button>
                <div>
                  <div v-if="incomplete_input_present && member.username === allowed_guest_domain"
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
                    :disabled="group_members.length >= max_group_size"
                    @click="add_group_member">
              <i class="fas fa-plus"></i>
              Add Another Member
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

import { Course, Group, NewGroupData, Project } from 'ag-client-typescript';

import { handle_api_errors_async } from '@/utils';

interface GroupMember {
  id: number;
  username: string;
}

@Component({
  components: {
    APIErrors,
    ValidatedForm
  }
})
export default class CreateSingleGroup extends Vue {

  @Prop({required: true, type: Project})
  project!: Project;

  allowed_guest_domain = "";
  d_creating_group = false;
  group_members: GroupMember[] = [];
  max_group_size = 1;
  min_group_size = 1;
  incomplete_input_present = false;

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
      this.incomplete_input_present = false;
      (<APIErrors> this.$refs.api_errors).clear();

      let list_of_members: string[] = [];
      this.group_members = this.group_members.filter(
        member => member.username.trim() !== ""
      );

      if (this.group_members.length === 0) {
        this.add_group_member();
      }

      for (let i = 0; i < this.group_members.length; ++i) {
        if (this.group_members[i].username.trim() === this.allowed_guest_domain) {
          this.incomplete_input_present = true;
          return;
        }
        list_of_members.push(this.group_members[i].username.trim());
        Vue.set(this.group_members, i, {
            id: i + 1,
            username: this.group_members[i].username.trim()
        });
      }
      await Group.create(this.project.pk, new NewGroupData({member_names: list_of_members}));
    }
    finally {
      this.d_creating_group = false;
    }
  }

  remove_group_member(index: number) {
    this.group_members.splice(index, 1);
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

.create-group-container {
  padding: 0 0 10px 0;
}

.create-group-button {
  @extend .teal-button;
  margin-top: 15px;
}

.create-group-button:disabled {
  @extend .gray-button;
}

.member-name-input {
  min-width: 200px;
  max-width: 300px;
}

.username-container {
  min-width: 300px;
}

</style>
