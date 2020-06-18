<template>
  <div v-if="d_loading" class="loading-centered loading-large">
    <i class="fa fa-spinner fa-pulse"></i>
  </div>
  <div v-else id="mutation-test-suites-component" class="scroll-container">
    <div class="sidebar-container">
      <div id="mutation-test-suite-sidebar" class="sidebar-menu">
        <div id="sidebar-header"
             class="sidebar-header" :class="{'sidebar-header-closed': d_collapsed}">
          <span class="sidebar-collapse-button" @click="d_collapsed = !d_collapsed">
            <i class="fas fa-bars"></i>
          </span>
          <template v-if="!d_collapsed">
            <div class="sidebar-header-text"> Suites </div>
            <button type="button"
                    id="add-mutation-test-suite-button"
                    class="sidebar-new-button"
                    @click="open_new_mutation_test_suite_modal">
              <i class="fas fa-plus sidebar-plus"></i> Add Suite
            </button>
          </template>
        </div>

        <div class="sidebar-content" v-if="!d_collapsed">
          <draggable ref="mutation_test_suite_order"
                      v-model="d_mutation_test_suites"
                      @change="set_mutation_test_suite_order"
                      @end="$event.item.style.transform = 'none'"
                      handle=".handle">
            <div v-for="mutation_test_suite of d_mutation_test_suites"
                class="mutation-test-suite-panel panel level-1"
                :class="{
                  'active':
                    d_active_mutation_test_suite !== null
                    && d_active_mutation_test_suite.pk === mutation_test_suite.pk
                }"
                :key="mutation_test_suite.pk"
                @click="d_active_mutation_test_suite = mutation_test_suite">
              <div class="text">{{mutation_test_suite.name}}</div>
              <div class="icons">
                <i class="icon handle fas fa-arrows-alt"></i>
              </div>
            </div>
          </draggable>
        </div>
      </div>

      <div class="body" :class="{'body-closed': d_collapsed}">
        <div v-if="d_active_mutation_test_suite !== null">
          <validated-form id="mutation-test-suite-form"
                          autocomplete="off"
                          spellcheck="false"
                          @submit="save_mutation_test_suite"
                          @form_validity_changed="d_settings_form_is_valid = $event">
            <suite-settings
              :suite="d_active_mutation_test_suite"
              :project="project"
              :docker_images="d_docker_images"
              @field_change="Object.assign(d_active_mutation_test_suite, $event)">
            </suite-settings>

            <fieldset class="fieldset">
              <legend class="legend"> Buggy Implementations </legend>
              <buggy-implementations ref="buggy_implementations"
                                      v-model="d_active_mutation_test_suite">
              </buggy-implementations>
            </fieldset>

            <fieldset class="fieldset">
              <legend class="legend"> Commands </legend>
              <mutation-commands ref="mutation_commands"
                                  v-model="d_active_mutation_test_suite">
              </mutation-commands>
            </fieldset>

            <fieldset class="fieldset">
              <legend class="legend"> Feedback Settings </legend>
              <div id="config-panels-container">
                <feedback-config-panel ref="normal_config_panel"
                                        v-model="d_active_mutation_test_suite.normal_fdbk_config"
                                        :preset_options="fdbk_presets">
                  <template slot="header">
                    <div class="config-name">
                      {{FeedbackConfigLabel.normal}}
                      <tooltip width="large" placement="top">
                        {{FeedbackDescriptions.normal}}
                      </tooltip>
                    </div>
                  </template>
                  <template slot="settings">
                    <MutationTestSuiteAdvancedFdbkSettings
                      ref="normal_edit_feedback_settings"
                      v-model="d_active_mutation_test_suite.normal_fdbk_config"
                      :config_name="FeedbackConfigLabel.normal">
                    </MutationTestSuiteAdvancedFdbkSettings>
                  </template>
                </feedback-config-panel>

                <feedback-config-panel
                  ref="final_graded_config_panel"
                  v-model="d_active_mutation_test_suite.ultimate_submission_fdbk_config"
                  :preset_options="fdbk_presets">
                  <template slot="header">
                    {{FeedbackConfigLabel.ultimate_submission}}
                    <tooltip width="large" placement="top">
                      {{FeedbackDescriptions.ultimate_submission}}
                    </tooltip>
                  </template>
                  <template slot="settings">
                    <MutationTestSuiteAdvancedFdbkSettings
                      ref="final_graded_edit_feedback_settings"
                      v-model="d_active_mutation_test_suite.ultimate_submission_fdbk_config"
                      :config_name="FeedbackConfigLabel.ultimate_submission">
                    </MutationTestSuiteAdvancedFdbkSettings>
                  </template>
                </feedback-config-panel>

                <feedback-config-panel
                  ref="past_limit_config_panel"
                  v-model="d_active_mutation_test_suite.past_limit_submission_fdbk_config"
                  :preset_options="fdbk_presets">
                  <template slot="header">
                    {{FeedbackConfigLabel.past_limit}}
                    <tooltip width="large" placement="top">
                      {{FeedbackDescriptions.past_limit}}
                    </tooltip>
                  </template>
                  <template slot="settings">
                    <MutationTestSuiteAdvancedFdbkSettings
                      ref="past_limit_edit_feedback_settings"
                      v-model="d_active_mutation_test_suite.past_limit_submission_fdbk_config"
                      :config_name="FeedbackConfigLabel.past_limit">
                    </MutationTestSuiteAdvancedFdbkSettings>
                  </template>
                </feedback-config-panel>

                <feedback-config-panel
                  ref="student_lookup_config_panel"
                  v-model="d_active_mutation_test_suite.staff_viewer_fdbk_config"
                  :preset_options="fdbk_presets">
                  <template slot="header">
                    {{FeedbackConfigLabel.staff_viewer}}
                    <tooltip width="large" placement="top">
                      {{FeedbackDescriptions.staff_viewer}}
                    </tooltip>
                  </template>
                  <template slot="settings">
                    <MutationTestSuiteAdvancedFdbkSettings
                      ref="student_lookup_edit_feedback_settings"
                      v-model="d_active_mutation_test_suite.staff_viewer_fdbk_config"
                      :config_name="FeedbackConfigLabel.staff_viewer">
                    </MutationTestSuiteAdvancedFdbkSettings>
                  </template>
                </feedback-config-panel>
              </div>

              <APIErrors ref="api_errors"></APIErrors>
              <div class="button-footer">
                <button type="submit"
                        class="save-button"
                        id="save-mutation-test-suite-button"
                        :disabled="!d_settings_form_is_valid || d_saving">Save</button>

                <last-saved
                  :last_modified="d_active_mutation_test_suite.last_modified"
                  :saving="d_saving">
                </last-saved>
              </div>
            </fieldset>
          </validated-form>

          <!-------------------- Danger Zone --------------------------->
          <div class="danger-zone-container">
            <div class="danger-text">
              Delete Test Suite: <span>{{d_active_mutation_test_suite.name}}</span>
            </div>
            <button class="delete-mutation-test-suite-button delete-button"
                    type="button"
                    @click="d_show_delete_mutation_test_suite_modal = true">
              Delete
            </button>
          </div>

        </div>
      </div>
    </div>

    <modal v-if="d_show_delete_mutation_test_suite_modal"
            @close="d_show_delete_mutation_test_suite_modal = false"
            ref="delete_mutation_test_suite_modal"
            size="large"
            click_outside_to_close>
      <div class="modal-header"> Confirm Delete </div>
      <div class="modal-body" v-if="d_active_mutation_test_suite !== null">
        <div class="modal-message">
          Are you sure you want to delete the suite:
          <span class="item-to-delete">{{d_active_mutation_test_suite.name}}</span>? <br><br>
          This will delete all associated test cases and run results. <br>
          <b>THIS ACTION CANNOT BE UNDONE.</b>
        </div>

        <APIErrors ref="delete_errors"></APIErrors>
        <div class="modal-button-footer">
          <button class="modal-delete-button red-button"
                  :disabled="d_deleting"
                  @click="delete_mutation_test_suite()"> Delete </button>

          <button class="modal-cancel-button white-button"
                  @click="d_show_delete_mutation_test_suite_modal = false"> Cancel </button>
        </div>
      </div>
    </modal>

    <modal v-if="d_show_new_mutation_test_suite_modal"
            @close="d_show_new_mutation_test_suite_modal = false"
            ref="new_mutation_test_suite_modal"
            click_outside_to_close
            size="medium">
      <div class="modal-header"> New Suite </div>
      <div class="modal-body">
        <validated-form
          id="create-mutation-test-suite-form"
          autocomplete="off"
          spellcheck="false"
          @submit="add_mutation_test_suite"
          @form_validity_changed="d_add_mutation_test_suite_form_is_valid = $event">
          <div class="mutation-test-suite-name-container">
            <label class="label"> Suite name </label>
            <validated-input ref="new_mutation_test_suite_name"
                              v-model="d_new_mutation_test_suite_name"
                              :validators="[is_not_empty]">
            </validated-input>
          </div>

          <APIErrors ref="api_errors"></APIErrors>
          <div class="modal-button-footer">
            <button class="modal-create-suite-button green-button"
                    :disabled="!d_add_mutation_test_suite_form_is_valid || d_adding_suite">
              Add Suite
            </button>
          </div>
        </validated-form>
      </div>
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Draggable from 'vuedraggable';

import {
    BugsExposedFeedbackLevel,
    MutationTestSuite,
    MutationTestSuiteObserver,
    Project,
    SandboxDockerImage,
} from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import LastSaved from "@/components/last_saved.vue";
import Modal from '@/components/modal.vue';
import {
    FeedbackConfigLabel,
    FeedbackDescriptions,
    MutationTestSuiteFeedbackPreset
} from '@/components/project_admin/feedback_config_panel/feedback_config_utils';
import BuggyImplementations from "@/components/project_admin/mutation_suites/buggy_implementations.vue";
import MutationCommand from "@/components/project_admin/mutation_suites/mutation_command.vue";
import MutationCommands from "@/components/project_admin/mutation_suites/mutation_commands.vue";
import MutationTestSuiteAdvancedFdbkSettings from '@/components/project_admin/mutation_suites/mutation_test_suite_advanced_fdbk_settings.vue';
import SuiteSettings from '@/components/project_admin/suite_settings.vue';
import Tooltip from "@/components/tooltip.vue";
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { handle_api_errors_async, handle_global_errors_async, make_error_handler_func } from '@/error_handling';
import { SafeMap } from '@/safe_map';
import { deep_copy, format_datetime, toggle } from '@/utils';
import { is_not_empty } from '@/validators';

import FeedbackConfigPanel from '../feedback_config_panel/feedback_config_panel.vue';

@Component({
  components: {
    APIErrors,
    BuggyImplementations,
    Draggable,
    FeedbackConfigPanel,
    LastSaved,
    Modal,
    MutationCommand,
    MutationCommands,
    MutationTestSuiteAdvancedFdbkSettings,
    SuiteSettings,
    Tooltip,
    ValidatedForm,
    ValidatedInput
  }
})
export default class MutationSuites extends Vue implements MutationTestSuiteObserver {
  @Prop({required: true, type: Project})
  project!: Project;

  readonly FeedbackConfigLabel = FeedbackConfigLabel;
  readonly FeedbackDescriptions = FeedbackDescriptions;
  readonly is_not_empty = is_not_empty;
  readonly format_datetime = format_datetime;

  d_docker_images: SandboxDockerImage[] = [];

  d_active_mutation_test_suite: MutationTestSuite | null = null;
  d_add_mutation_test_suite_form_is_valid = true;
  d_adding_suite = false;
  d_loading = true;
  d_mutation_test_suites: MutationTestSuite[] = [];
  d_new_mutation_test_suite_name = "";
  d_deleting = false;
  d_saving = false;
  d_settings_form_is_valid = true;
  d_show_new_mutation_test_suite_modal = false;
  d_show_delete_mutation_test_suite_modal = false;

  d_collapsed = false;

  @handle_global_errors_async
  async created() {
    MutationTestSuite.subscribe(this);
    this.d_mutation_test_suites = await MutationTestSuite.get_all_from_project(this.project.pk);
    let global_images = await SandboxDockerImage.get_images(null);
    let course_images = await SandboxDockerImage.get_images(this.project.course);
    this.d_docker_images = global_images.concat(course_images);
    this.d_loading = false;
  }

  beforeDestroy() {
    MutationTestSuite.unsubscribe(this);
  }

  @handle_api_errors_async(handle_add_mutation_test_suite_error)
  async add_mutation_test_suite() {
    try {
      this.d_adding_suite = true;
      await MutationTestSuite.create(
        this.project.pk, {name: this.d_new_mutation_test_suite_name}
      );
      this.d_show_new_mutation_test_suite_modal = false;
      this.d_new_mutation_test_suite_name = "";
    }
    finally {
      this.d_adding_suite = false;
    }
  }

  @handle_api_errors_async(make_error_handler_func('delete_errors'))
  async delete_mutation_test_suite() {
    return toggle(this, 'd_deleting', async () => {
      await this.d_active_mutation_test_suite!.delete();
      this.d_show_delete_mutation_test_suite_modal = false;
      this.d_active_mutation_test_suite = null;
    });
  }

  @handle_global_errors_async
  set_mutation_test_suite_order() {
    return MutationTestSuite.update_order(
      this.project.pk, this.d_mutation_test_suites.map(suite => suite.pk));
  }

  open_new_mutation_test_suite_modal() {
    this.d_new_mutation_test_suite_name = "";
    this.d_show_new_mutation_test_suite_modal = true;
    Vue.nextTick(() => {
      (<ValidatedInput> this.$refs.new_mutation_test_suite_name).focus();
    });
  }

  update_mutation_test_suite_created(mutation_test_suite: MutationTestSuite): void {
    if (mutation_test_suite.project === this.project.pk) {
      this.d_mutation_test_suites.push(mutation_test_suite);
      this.d_active_mutation_test_suite = mutation_test_suite;
    }
  }

  update_mutation_test_suite_changed(mutation_test_suite: MutationTestSuite): void {
    if (mutation_test_suite.project !== this.project.pk) {
      return;
    }

    let index = this.d_mutation_test_suites.findIndex(
      (mutation_suite: MutationTestSuite) => mutation_suite.pk === mutation_test_suite.pk
    );
    let changed_suite_is_active = this.d_mutation_test_suites[index]
                                  === this.d_active_mutation_test_suite;
    Vue.set(this.d_mutation_test_suites,
            index,
            deep_copy(mutation_test_suite, MutationTestSuite)
    );
    if (changed_suite_is_active) {
      this.d_active_mutation_test_suite = this.d_mutation_test_suites[index];
    }
  }

  update_mutation_test_suite_deleted(mutation_test_suite: MutationTestSuite): void {
    if (mutation_test_suite.project !== this.project.pk) {
      return;
    }

    let index = this.d_mutation_test_suites.findIndex(
      (mutation_suite: MutationTestSuite) => mutation_suite.pk === mutation_test_suite.pk
    );
    this.d_mutation_test_suites.splice(index, 1);
  }

  update_mutation_test_suites_order_changed(project_pk: number,
                                            mutation_test_suite_order: number[]): void {
  }

  readonly fdbk_presets = new SafeMap<string, MutationTestSuiteFeedbackPreset>([
    [
      'Everything',
      {
        show_setup_return_code: true,
        show_setup_stdout: true,
        show_setup_stderr: true,
        show_get_test_names_return_code: true,
        show_get_test_names_stdout: true,
        show_get_test_names_stderr: true,
        show_validity_check_stdout: true,
        show_validity_check_stderr: true,
        show_grade_buggy_impls_stdout: true,
        show_grade_buggy_impls_stderr: true,
        show_invalid_test_names: true,
        show_points: true,
        bugs_exposed_fdbk_level: BugsExposedFeedbackLevel.exposed_bug_names
      }
    ],
    [
      'Num Bugs + Prep Output',
      {
        show_setup_return_code: true,
        show_setup_stdout: true,
        show_setup_stderr: true,
        show_get_test_names_return_code: true,
        show_get_test_names_stdout: true,
        show_get_test_names_stderr: true,
        show_validity_check_stdout: true,
        show_validity_check_stderr: true,
        show_grade_buggy_impls_stdout: false,
        show_grade_buggy_impls_stderr: false,
        show_invalid_test_names: true,
        show_points: true,
        bugs_exposed_fdbk_level: BugsExposedFeedbackLevel.num_bugs_exposed
      }
    ],
    [
      'Num Bugs Exposed',
      {
        show_setup_return_code: true,
        show_setup_stdout: false,
        show_setup_stderr: false,
        show_get_test_names_return_code: false,
        show_get_test_names_stdout: false,
        show_get_test_names_stderr: false,
        show_validity_check_stdout: false,
        show_validity_check_stderr: false,
        show_grade_buggy_impls_stdout: false,
        show_grade_buggy_impls_stderr: false,
        show_invalid_test_names: true,
        show_points: true,
        bugs_exposed_fdbk_level: BugsExposedFeedbackLevel.num_bugs_exposed
      }
    ],
    [
      'False Positives',
      {
        show_setup_return_code: true,
        show_setup_stdout: false,
        show_setup_stderr: false,
        show_get_test_names_return_code: false,
        show_get_test_names_stdout: false,
        show_get_test_names_stderr: false,
        show_validity_check_stdout: false,
        show_validity_check_stderr: false,
        show_grade_buggy_impls_stdout: false,
        show_grade_buggy_impls_stderr: false,
        show_invalid_test_names: true,
        show_points: false,
        bugs_exposed_fdbk_level: BugsExposedFeedbackLevel.no_feedback
      }
    ],

    [
      'Private',
      {
        show_setup_return_code: false,
        show_setup_stdout: false,
        show_setup_stderr: false,
        show_get_test_names_return_code: false,
        show_get_test_names_stdout: false,
        show_get_test_names_stderr: false,
        show_validity_check_stdout: false,
        show_validity_check_stderr: false,
        show_grade_buggy_impls_stdout: false,
        show_grade_buggy_impls_stderr: false,
        show_invalid_test_names: false,
        show_points: false,
        bugs_exposed_fdbk_level: BugsExposedFeedbackLevel.no_feedback
      }
    ],

    [
      'Num Bugs Exposed (Old)',
      {
        show_setup_return_code: true,
        show_setup_stdout: false,
        show_setup_stderr: false,
        show_get_test_names_return_code: true,
        show_get_test_names_stdout: false,
        show_get_test_names_stderr: false,
        show_validity_check_stdout: false,
        show_validity_check_stderr: false,
        show_grade_buggy_impls_stdout: false,
        show_grade_buggy_impls_stderr: false,
        show_invalid_test_names: true,
        show_points: true,
        bugs_exposed_fdbk_level: BugsExposedFeedbackLevel.num_bugs_exposed
      }
    ],
    [
      'False Positives (old)',
      {
        show_setup_return_code: true,
        show_setup_stdout: false,
        show_setup_stderr: false,
        show_get_test_names_return_code: true,
        show_get_test_names_stdout: false,
        show_get_test_names_stderr: false,
        show_validity_check_stdout: false,
        show_validity_check_stderr: false,
        show_grade_buggy_impls_stdout: false,
        show_grade_buggy_impls_stderr: false,
        show_invalid_test_names: true,
        show_points: true,
        bugs_exposed_fdbk_level: BugsExposedFeedbackLevel.no_feedback
      }
    ],
  ]);

  @handle_api_errors_async(handle_save_mutation_test_suite_error)
  async save_mutation_test_suite() {
    try {
      this.d_saving = true;
      (<APIErrors> this.$refs.api_errors).clear();
      await this.d_active_mutation_test_suite!.save();
    }
    finally {
      this.d_saving = false;
    }
  }
}

function handle_save_mutation_test_suite_error(component: MutationSuites, error: unknown) {
    (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}

function handle_add_mutation_test_suite_error(component: MutationSuites, error: unknown) {
    (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/collapsible_sidebar.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/list_panels.scss';
@import '@/styles/loading.scss';
@import '@/styles/modal.scss';

* {
  box-sizing: border-box;
}

$border-color: $gray-blue-1;

@include collapsible-sidebar(
  $sidebar-width: 300px,
  $sidebar-header-height: 2.625rem,
  $background-color: white,
  $border-color: $border-color,
  $stretch: true,
);

.sidebar-container {
  .body {
    padding: .625rem .875rem;
    overflow-x: hidden;
  }
}

@include list-panels();

.panel .icons .icon {
  padding: .375rem;

  &:hover {
    color: darken($stormy-gray-dark, 20%);
  }
}

.handle {
  cursor: grabbing;
}

.item-to-delete {
  color: $ocean-blue;
}
</style>
