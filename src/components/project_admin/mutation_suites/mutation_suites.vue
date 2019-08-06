<template>
  <div id="mutation-test-suites-component" class="scroll-container">
    <template v-if="!d_loading">
      <div id="columns-container" class="scroll-column-container">
        <div id="mutation-test-suite-sidebar" class="scroll-column">
          <div class="scroll-container">

            <div id="sidebar-header">
              <div id="sidebar-title"> Suites </div>
              <button type="button"
                      id="add-mutation-test-suite-button"
                      @click="open_new_mutation_test_suite_modal">
                <i class="fas fa-plus plus"></i> Add Suite
              </button>
            </div>

            <div id="sidebar-body" class="scroll-column">
              <div id="all-mutation-test-suites">
                <div v-for="mutation_test_suite of d_mutation_test_suites"
                     :class="['mutation-test-suite-panel',
                       {'active-mutation-test-suite-panel': d_active_mutation_test_suite !== null
                         && d_active_mutation_test_suite.pk === mutation_test_suite.pk}]"
                     :key="mutation_test_suite.pk"
                     @click="d_active_mutation_test_suite = mutation_test_suite">
                  {{mutation_test_suite.name}}
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class="vertical-divider"></div>

        <div id="viewing-window" class="scroll-column-grow">
          <div v-if="d_active_mutation_test_suite !== null">
            <tabs ref="mutation-test-suite-tabs"
                  v-model="d_current_tab_index"
                  tab_active_class="white-theme-active"
                  tab_inactive_class="white-theme-inactive">
              <tab>
                <tab-header>
                  <div class="tab-heading"> General </div>
                </tab-header>
                <template slot="body">
                  <div class="tab-body">
                    <mutation-suite-general-settings
                      ref="mutation_suite_general_settings"
                      :mutation_test_suite="d_active_mutation_test_suite"
                      :project="project">
                    </mutation-suite-general-settings>
                  </div>
                </template>
              </tab>

              <tab>
                <tab-header ref="project_settings_tab">
                  <div class="tab-label">
                    <p class="tab-heading"> Buggy Implementations </p>
                  </div>
                </tab-header>
                <template slot="body">
                  <div class="tab-body">
                    <buggy-implementations ref="buggy_implementations"
                                           :mutation_test_suite="d_active_mutation_test_suite">
                    </buggy-implementations>
                  </div>
                </template>
              </tab>

              <tab>
                <tab-header ref="project_settings_tab">
                  <div class="tab-label">
                    <p class="tab-heading"> Commands </p>
                  </div>
                </tab-header>
                <template slot="body">
                  <div class="tab-body">
                    <mutation-commands ref="mutation_commands"
                                       :mutation_test_suite="d_active_mutation_test_suite">
                    </mutation-commands>
                  </div>
                </template>
              </tab>

              <tab>
                <tab-header ref="project_settings_tab">
                  <div class="tab-label">
                    <p class="tab-heading"> Feedback </p>
                  </div>
                </tab-header>
                <template slot="body">
                  <div class="tab-body"></div>
                </template>
              </tab>

              <tab>
                <tab-header ref="project_settings_tab">
                  <div class="tab-label">
                    <p class="tab-heading"> Danger Zone </p>
                  </div>
                </tab-header>
                <template slot="body">
                  <div class="tab-body">
                    <button class="delete-mutation-test-suite-button"
                            type="button"
                            @click="$refs.delete_mutation_test_suite_modal.open()">
                      Delete Test Suite: <span>{{d_active_mutation_test_suite.name}}</span>
                    </button>
                  </div>
                </template>
              </tab>
            </tabs>
          </div>
        </div>
      </div>

      <modal ref="delete_mutation_test_suite_modal"
             :size="'large'"
             :include_closing_x="false">
        <div class="modal-header"> Confirm Delete </div>
        <div class="modal-divider"></div>
        <div class="modal-body" v-if="d_active_mutation_test_suite !== null">
          <div class="modal-message">
            Are you sure you want to delete the suite:
            <span class="item-to-delete">{{d_active_mutation_test_suite.name}}</span>?
            This will delete all associated test cases and run results.
            THIS ACTION CANNOT BE UNDONE.
          </div>

          <div class="modal-footer">
            <div class="modal-button-container">
              <button class="modal-delete-button red-button"
                      :disabled="d_saving"
                      @click="delete_mutation_test_suite()"> Delete </button>

              <button class="modal-cancel-button white-button"
                      @click="$refs.delete_mutation_test_suite_modal.close()"> Cancel </button>
            </div>
          </div>
        </div>
      </modal>

      <modal ref="new_mutation_test_suite_modal"
             click_outside_to_close
             size="medium">
        <div class="modal-header"> New Suite </div>
        <div class="modal-divider"></div>
        <div class="modal-body">
          <validated-form
            id="create-mutation-test-suite-form"
            autocomplete="off"
            spellcheck="false"
            @submit="add_mutation_test_suite"
            @form_validity_changed="d_add_mutation_test_suite_form_is_valid = $event">
            <div class="mutation-test-suite-name-container">
              <label class="text-label"> Suite name </label>
              <validated-input ref="new_mutation_test_suite_name"
                               v-model="d_new_mutation_test_suite_name"
                               :show_warnings_on_blur="true"
                               :validators="[is_not_empty]">
              </validated-input>
            </div>

            <APIErrors ref="api_errors"></APIErrors>
            <div class="modal-button-container">
              <button class="modal-create-suite-button"
                      :disabled="!d_add_mutation_test_suite_form_is_valid || d_adding_suite">
                Add Suite
              </button>
            </div>
          </validated-form>
        </div>
      </modal>
    </template>
    <template v-else>
      <div class="loading-large"><i class="fa fa-spinner fa-pulse"></i></div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
    MutationTestSuite, MutationTestSuiteObserver,
    Project
} from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import BuggyImplementations from "@/components/project_admin/mutation_suites/buggy_implementations.vue";
import MutationCommand from "@/components/project_admin/mutation_suites/mutation_command.vue";
import MutationCommands from "@/components/project_admin/mutation_suites/mutation_commands.vue";
import MutationSuiteGeneralSettings from "@/components/project_admin/mutation_suites/mutation_suite_general_settings.vue";
import Tab from '@/components/tabs/tab.vue';
import TabHeader from '@/components/tabs/tab_header.vue';
import Tabs from '@/components/tabs/tabs.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { deep_copy, handle_api_errors_async } from '@/utils';
import { is_not_empty } from '@/validators';

@Component({
  components: {
    APIErrors,
    BuggyImplementations,
    Modal,
    MutationCommand,
    MutationCommands,
    MutationSuiteGeneralSettings,
    Tab,
    TabHeader,
    Tabs,
    ValidatedForm,
    ValidatedInput
  }
})
export default class MutationSuites extends Vue implements MutationTestSuiteObserver {
  @Prop({required: true, type: Project})
  project!: Project;

  readonly is_not_empty = is_not_empty;

  d_active_mutation_test_suite: MutationTestSuite | null = null;
  d_add_mutation_test_suite_form_is_valid = true;
  d_adding_suite = false;
  d_current_tab_index = 0;
  d_loading = true;
  d_mutation_test_suites: MutationTestSuite[] = [];
  d_new_mutation_test_suite_name = "";
  d_saving = false;

  async created() {
    MutationTestSuite.subscribe(this);
    this.d_mutation_test_suites = await MutationTestSuite.get_all_from_project(this.project.pk);
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
      (<Modal> this.$refs.new_mutation_test_suite_modal).close();
      this.d_new_mutation_test_suite_name = "";
    }
    finally {
      this.d_adding_suite = false;
    }
  }

  async delete_mutation_test_suite() {
    await this.d_active_mutation_test_suite!.delete();
    (<Modal> this.$refs.delete_mutation_test_suite_modal).close();
    this.d_active_mutation_test_suite = null;
    this.d_current_tab_index = 0;
  }

  open_new_mutation_test_suite_modal() {
    this.d_new_mutation_test_suite_name = "";
    (<Modal> this.$refs.new_mutation_test_suite_modal).open();
  }

  update_mutation_test_suite_created(mutation_test_suite: MutationTestSuite): void {
    console.log("Update mutation test suite created");
    this.d_mutation_test_suites.push(mutation_test_suite);
  }

  update_mutation_test_suite_changed(mutation_test_suite: MutationTestSuite): void {
    console.log("Update mutation test suite changed");
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
    console.log("Update mutation test suite deleted");
    let index = this.d_mutation_test_suites.findIndex(
      (mutation_suite: MutationTestSuite) => mutation_suite.pk === mutation_test_suite.pk
    );
    this.d_mutation_test_suites.splice(index, 1);
  }

  update_mutation_test_suites_order_changed(project_pk: number,
                                            mutation_test_suite_order: number[]): void {
    throw new Error("Method not implemented.");
  }
}

function handle_add_mutation_test_suite_error(component: MutationSuites, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}

</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/independent_scrolling.scss';

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

.tab-heading {
  background-color: inherit;
  margin: 0;
  overflow: hidden;
  height: 20px;
}

.tab-body {
  padding: 15px 0 0 0;
}

#columns-container {
  height: calc(100% - 55px);
}

#mutation-test-suite-sidebar {
  min-width: 300px;
  width: 200px;
}

#sidebar-header {
  padding: 15px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-left: none;
  border-bottom: none;
  margin-top: 10px;
}

#sidebar-title {
  display: inline-block;
  font-size: 1.125rem;
}

#add-mutation-test-suite-button {
  @extend .white-button;
  box-shadow: none;
}

.plus {
  font-size: 13px;
  margin-right: 3px;
}

#sidebar-body {
  padding-bottom: 10px;
}

#all-mutation-test-suites {
  border-color: $white-gray;
  border-style: solid;
  border-width: 1px 0;
}

.mutation-test-suite-panel {
  border-bottom: 1px solid $white-gray;
  cursor: pointer;
  font-size: 14px;
  padding: 8px;
  width: 100%;
}

.active-mutation-test-suite-panel {
  background-color: $light-blue;
}

.vertical-divider {
  border: 1px solid $pebble-medium;
  margin: 10px 8px 10px 0;
}

#viewing-window {
  padding-top: 20px;
}

.delete-mutation-test-suite-button {
  @extend .red-button;
  margin-left: 8px;
}

// MODAL stuff ----------------------------------------------------

.modal-header {
  font-size: 20px;
  padding: 10px 0 5px 0;
}

.modal-divider {
  background-color: darken($white-gray, 3);
  height: 2px;
  margin: 9px 0;
}

.modal-message {
  line-height: 22px;
  padding: 5px 0;
}

.modal-button-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 10px 0 0 0;
}

// create modal -----------------------------------------

.modal-create-suite-button {
  @extend .green-button;
  float: right;
}

// delete modal -----------------------------------------

.modal-delete-button {
  margin-right: 10px;
}

.item-to-delete {
  color: $ocean-blue;
  margin-left: 3px;
}

</style>
