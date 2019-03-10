<template>
  <div ref="single-course-component" class="single-course-component">
    <div class="course">
      <div class="course-info">
        <p class="course-name">{{course.name}} </p>
        <p class="course-semester-year">{{course.semester}} {{course.year}}</p>
      </div>

      <div class="toolbox">

        <div class="clone-course"
             @click="$refs.clone_course_modal.open()"
             title="Clone Course"
             v-if="is_admin">
          <p class="clone-course-label">
            <i class="fas fa-copy copier"> </i>
          </p>
        </div>

        <router-link tag="div"
                     :to="`/web/course_admin/${course.pk}`"
                     class="edit-admin-settings"
                     title="Edit Course"
                     v-if="is_admin">
          <a>
            <p class="edit-settings-label">
              <i class="fas fa-cog cog"></i>
            </p>
          </a>
        </router-link>

      </div>

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
  import { handle_400_errors_async } from '@/utils';
  import { is_not_empty, is_number, is_valid_course_year } from '@/validators';
  import { Course, Semester } from 'ag-client-typescript';
  import { AxiosResponse } from 'axios';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
    components: {
      Dropdown,
      Modal,
      ValidatedForm,
      ValidatedInput
    }
  })
  export default class CourseList extends Vue {

    @Prop({required: true, type: Course})
    course!: Course;

    @Prop({default: false, type: Boolean})
    is_admin!: boolean;

    new_course_name = "";
    new_course_semester: Semester = Semester.fall;
    new_course_year: number = 2000;

    api_errors: string[] = [];
    semesters = [Semester.fall, Semester.winter, Semester.spring, Semester.summer];
    clone_course_form_is_valid = false;

    readonly is_not_empty = is_not_empty;
    readonly is_number = is_number;
    readonly is_valid_course_year = is_valid_course_year;

    created() {
      this.new_course_year = this.course.year ? this.course.year : 2000;
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

.single-course-component { }

.toolbox {
  background-color: hsl(212, 60%, 94%);
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  border-top: none;
  text-align: right;
  padding: 1px 10px;
  box-sizing: border-box;
  min-height: 37px;
}

a {
  text-decoration: none;
  color: inherit;
}

.edit-settings-label, .clone-course-label {
  font-size: 16px;
  margin: 0;
}

.cog {
  transform: rotate(0deg);
  transition-duration: 1s;
  font-size: 18px;
}

.copier {
  transition-duration: 1s;
  font-size: 18px;
}

.edit-admin-settings, .clone-course {
  color: hsl(212, 50%, 27%);
  display: inline-block;
  padding: 5px 10px;
}

.clone-course {
  margin-right: 5px;
}

.edit-admin-settings:hover .cog  {
  transform: rotate(365deg);
  transition-duration: 1s;
  color: hsl(212, 80%, 57%);
}

.clone-course:hover .copier {
  transition-duration: 1s;
  color: hsl(212, 80%, 57%);
}

.course {
  box-sizing: border-box;
  color: black;
  cursor: pointer;
  font-size: 23px;
  margin: 0 15px 15px 0;
  min-height: 75px;
  position: relative;
  transition: box-shadow 1s;
}

.course-info {
  padding: 15px;
  background-image: linear-gradient(to bottom right, hsl(212, 100%, 90%), hsl(212, 100%, 85%));
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  border-bottom: none;
}

.course:hover { }

.course-name {
  font-size: 26px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
  color: hsl(220, 20%, 17%);
}

.course-semester-year {
  color: hsl(220, 20%, 17%);
  font-size: 16px;
  margin: 0;
  min-height: 25px;
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

.course-to-copy {
  background-color: hsl(220, 20%, 85%);
  letter-spacing: 1px;
  margin-left: 5px;
}

@media only screen and (min-width: 681px) {
  .single-course-component {
    display: inline-block;
    width: 50%;
    vertical-align: top;
  }
}

@media only screen and (min-width: 1081px) {
  .single-course-component {
    display: inline-block;
    width: 40%;
    min-width: 400px;
    max-width: 450px;
    vertical-align: top;
  }
}

</style>
