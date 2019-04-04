<template>
  <div ref="single-course-component" class="single-course-component">
    <div class="course">
      <div class="course-info">
        <p class="course-name">{{course.name}} </p>
        <p class="course-subtitle">{{course.subtitle}}</p>
      </div>

      <div class="toolbox">
        <div class="clone-course"
             @click="$refs.clone_course_modal.open()"
             :title="'Clone ' + course.name"
             v-if="is_admin">
          <p class="clone-course-label">
            <i class="fas fa-copy copier"> </i>
          </p>
        </div>
        <router-link tag="div"
                     :to="`/web/course_admin/${course.pk}`"
                     class="edit-admin-settings"
                     :title="'Edit ' + course.name"
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
      <span class="modal-container">
        <p class="modal-header"> Cloning course:
          <span class="course-to-copy">{{course.name}} - {{course.semester}} {{course.year}}</span>
        </p>
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

            <APIErrors ref="api_errors"></APIErrors>

            <button type="submit"
                   class="create-clone-button"
                   :disabled="!clone_course_form_is_valid || clone_course_pending">
              Create Course
            </button>
          </ValidatedForm>
        </div>
      </span>
    </modal>
  </div>
</template>

<script lang="ts">
  import APIErrors from '@/components/api_errors.vue';
  import Dropdown from '@/components/dropdown.vue';
  import Modal from '@/components/modal.vue';
  import ValidatedForm from '@/components/validated_form.vue';
  import ValidatedInput from '@/components/validated_input.vue';
  import { handle_api_errors_async } from '@/utils';
  import { is_not_empty, is_number, make_min_value_validator } from '@/validators';
  import { Course, Semester } from 'ag-client-typescript';
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
    components: {
      APIErrors,
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

    semesters = [Semester.fall, Semester.winter, Semester.spring, Semester.summer];
    clone_course_form_is_valid = false;

    clone_course_pending = false;

    readonly is_not_empty = is_not_empty;
    readonly is_number = is_number;
    readonly is_valid_course_year = make_min_value_validator(2000);

    created() {
      this.new_course_name = this.course.name;
      if (this.course.semester !== null) {
        this.new_course_semester = this.course.semester;
      }
      let current_year = (new Date()).getFullYear();
      this.new_course_year = this.course.year !== null ? this.course.year : current_year;
    }

    @handle_api_errors_async(handle_add_copied_course_error)
    async make_copy_of_course() {
      try {
        this.clone_course_pending = true;
        await this.course.copy(
          this.new_course_name, this.new_course_semester, this.new_course_year
        );
        (<Modal> this.$refs.clone_course_modal).close();
      }
      finally {
        this.clone_course_pending = false;
      }
    }
  }

  function handle_add_copied_course_error(component: CourseList, error: unknown) {
    (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
  }

</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/course_admin.scss';

.single-course-component { }

.toolbox {
  background-color: hsl(212, 60%, 94%);
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
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
  color: mediumvioletred;
}

.clone-course:hover .copier {
  transition-duration: 1s;
  color: mediumvioletred;
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
  background-image: linear-gradient(to bottom right, hsl(212, 70%, 88%), hsl(212, 70%, 85%));
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
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

.course-subtitle {
  color: hsl(220, 20%, 17%);
  font-size: 14px;
  margin: 0;
  padding-top: 2px;
  min-height: 21px;
}

/**** Modal *******************************************************************/

.modal-header {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  padding: 5px 0;
}

.name-container, .year-container,
.semester-container {
  padding-bottom: 16px;
  display: block;
  max-width: 500px;
}

.name-container {
  padding-top: 10px;
}

#all-semesters {
  margin-top: 40px;
}

.semester-dropdown-header {
  width: 140px;
  height: 39px;
}

.course-to-copy {
  letter-spacing: 1px;
  margin-left: 5px;
  color: $ocean-blue;
}

.create-clone-button {
  @extend .green-button;
}

.create-clone-button:disabled {
  @extend .gray-button;
}

.create-clone-button, .create-clone-button:disabled {
  font-size: 16px;
  margin: 12px 0 10px 0;
  padding: 10px 15px;
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
  }
}

</style>
