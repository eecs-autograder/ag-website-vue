<template>
  <div ref="single-course-component">

    <div :class="['course', {'last-course-in-semester': d_last_course_in_semester}]">
      <p class="course-name">{{course.name}} ({{course.pk}}) {{d_last_course_in_semester}}</p>
      <p class="course-semester-year">{{course.semester}} {{course.year}}</p>
      <div v-if="is_admin"
           class="clone-course"
           @click="$refs.clone_course_modal.open()">
        <p class="clone-course-label"> Clone
          <i class="far fa-copy copy-icon"> </i>
        </p>
      </div>
      <router-link tag="div"
                   :to="`/web/course_admin/${course.pk}`"
                   v-if="is_admin"
                   class="edit-admin-settings">
        <a>
          <p class="edit-settings-label"> Edit
            <i class="fas fa-cog cog"></i>
          </p>
        </a>
      </router-link>
    </div>

    <modal ref="clone_course_modal"
           click_outside_to_close
           size="large">
      <h2>
        Cloning course:
        <span class="course-to-copy">{{course.name}} {{course.semester}} {{course.year}}</span>
      </h2>
      <hr>
      <div id="clone-course-modal">
        <ValidatedForm ref="clone_course_form"
                       id="clone-course-form"
                       autocomplete="off"
                       @submit.native.prevent="make_copy_of_course">

          <div class="name-container">
            <label class="input-label"> Course name: </label>
            <ValidatedInput ref="copy_of_course_name"
                            v-model="new_course_name"
                            input_style="width: 100%; max-width: 500px;"
                            :validators="[is_not_empty]"
                            :num_rows="1"
                            @input_validity_changed="clone_course_form_is_valid = $event">
            </ValidatedInput>
          </div>

          <div class="semester-container">
            <label class="input-label"> Semester: </label>
            <div>
              <dropdown ref="semester_dropdown"
                        :items="semesters"
                        @update_item_selected="new_course_semester = $event">
                <template slot="header">
                  <div tabindex="1" class="dropdown-header-wrapper">
                    <div class="dropdown-header semester-dropdown-header">{{new_course_semester}}
                      <i class="fas fa-caret-down dropdown-caret"></i>
                    </div>
                  </div>
                </template>
                <div slot-scope="{item}">
                  <span class="semester-item">{{item}}</span>
                </div>
              </dropdown>
            </div>
          </div>

          <div class="year-container">
            <label class="input-label"> Year: </label>
            <ValidatedInput ref="copy_of_course_year"
                            v-model="new_course_year"
                            :num_rows="1"
                            input_style="width: 65px;"
                            :validators="[is_not_empty, is_number, is_valid_course_year]"
                            @input_validity_changed="clone_course_form_is_valid = $event">
            </ValidatedInput>
          </div>


          <div v-for="error of api_errors"
               class="api-error-container">
            <div class="api-error">{{error}}</div>
            <button class="dismiss-error-button"
                    type="button"
                    @click="api_errors = []">
              <span class="dismiss-error"> Dismiss
              </span>
            </button>
          </div>

          <input type="submit"
                 class="create-clone-button"
                 value="Create Course"
                 :disabled="!clone_course_form_is_valid">
        </ValidatedForm>
      </div>
    </modal>
  </div>
</template>

<script lang="ts">
  import Dropdown from '@/components/dropdown.vue';
  import Modal from '@/components/modal.vue';
  import ValidatedForm from '@/components/validated_form.vue';
  import ValidatedInput from '@/components/validated_input.vue';
  import { ObserverComponent } from '@/observer_component';
  import { handle_400_errors_async } from '@/utils';
  import { is_not_empty, is_number, is_valid_course_year } from '@/validators';
  import { Course, Semester } from 'ag-client-typescript';
  import { AxiosResponse } from 'axios';
  import { Component, Prop, Watch } from 'vue-property-decorator';

  @Component({
    components: {
      Dropdown,
      Modal,
      ValidatedForm,
      ValidatedInput
    }
  })

  export default class CourseList extends ObserverComponent {

    @Prop({required: true, type: Course})
    course!: Course;

    @Prop({default: false, type: Boolean})
    last_course_in_semester!: boolean;

    @Prop({default: false, type: Boolean})
    is_admin!: boolean;

    @Watch('last_course_in_semester')
    on_course_order_changed(new_status: boolean, old_status: boolean) {
      console.log("This happened");
      this.d_last_course_in_semester = new_status;
    }

    new_course_name = "";
    new_course_semester: Semester = Semester.fall;
    new_course_year: number = 2000;

    api_errors: string[] = [];
    semesters = [Semester.fall, Semester.winter, Semester.spring, Semester.summer];
    clone_course_form_is_valid = false;
    d_last_course_in_semester = false;

    readonly is_not_empty = is_not_empty;
    readonly is_number = is_number;
    readonly is_valid_course_year = is_valid_course_year;

    created() {
      this.new_course_year = this.course.year ? this.course.year : 2000;
      this.d_last_course_in_semester = this.last_course_in_semester;
    }

    @handle_400_errors_async(handle_add_copied_course_error)
    async make_copy_of_course() {
      try {
        this.api_errors = [];
        await this.course.copy(
          this.new_course_name, this.new_course_semester, this.new_course_year
        );
        (<Modal> this.$refs.clone_course_modal).close();
        console.log("Cloning successful");
        this.new_course_name = "";
        this.new_course_semester = Semester.fall;
        this.new_course_year = this.course.year ? this.course.year : 2000;
      }
      finally {}
    }
  }

  function handle_add_copied_course_error(component: CourseList, response: AxiosResponse) {
    let errors = response.data["__all__"];
    if (errors.length > 0) {
      component.api_errors = [errors[0]];
    }
  }

</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/course_admin.scss';

$current-lang-choice: "Poppins";

.course-to-copy {
  background-color: hsl(220, 20%, 85%);
  letter-spacing: 1px;
  margin-left: 5px;
}

.copy-icon {
  margin-left: 5px;
  color: black;
}

.copy-icon:hover {
  color: darken(lavender, 21);
}

a {
  text-decoration: none;
  color: black;
}

.edit-settings-label, .clone-course-label {
  font-size: 16px;
  margin: 0;
}

.cog {
  margin-left: 5px;
  transform: rotate(0deg);
  transition-duration: 1s;
}

.clone-course {
  bottom: 15px;
  position: absolute;
  right: 100px;
}

.edit-admin-settings {
  position: absolute;
  bottom: 15px;
  right: 15px;
}

.edit-admin-settings, .clone-course {
  background-color: lighten(lavender, 2);
  border-radius: 4px;
  border: 1.5px solid darken(lavender, 11);
  padding: 5px 10px;
  transition: box-shadow 1s;
}

.edit-admin-settings:hover, .clone-course:hover {
  background-color: white;
  border: 1.5px solid darken(lavender, 5);
}

.edit-admin-settings:hover .cog  {
  transform: rotate(365deg);
  transition-duration: 1s;
}

.course {
  background-color: darken(lavender, 8);
  border-radius: 2px;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.1);
  color: black;
  cursor: pointer;
  font-size: 23px;
  margin: 0 0 15px 0;
  min-height: 75px;
  padding: 15px;
  position: relative;
  transition: box-shadow 1s;
}

.course:hover {
  background-color: darken(lavender, 11);
  box-shadow: 0 5px 9px 0 rgba(0,0,0,0.2);
}

.last-course-in-semester {
  margin-bottom: 50px;
}

.course-name {
  font-size: 26px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
}

.course-semester-year {
  color: black;
  font-size: 16px;
  margin: 0;
  min-height: 25px;
  padding-bottom: 15px;
  position: relative;
}

/**** Modal *******************************************************************/

#clone-course-modal {
  font-family: $current-lang-choice;
}

.create-clone-button {
  @extend .green-button;
}

.create-clone-button, .create-clone-button:disabled {
  @extend %submission-button;
}

.create-clone-button:disabled {
  @extend .gray-button;
}

.create-clone-button:disabled:hover {
  background-color: hsl(210, 13%, 63%);
  cursor: default;
}

.name-container, .year-container,
.semester-container {
  padding-bottom: 16px;
  display: block;
  max-width: 500px;
}

#all-semesters {
  margin-top: 40px;
}

</style>
