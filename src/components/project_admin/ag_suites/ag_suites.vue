<template>
  <div id="ag-test-suites-component">
    <div id="suite-navigation-bar">
      <button class="new-suite"
           @click="$refs.new_suite_modal.open()">
        <i class="fas fa-plus plus-sign"></i> Add Suite
      </button>
      <div class="all-suites" @wheel.stop>
        <div v-for="(test_suite, index) of test_suites"
             :class="['suite-container',
                     {'active-suite-container': active_suite !== null &&
                       test_suite.pk === active_suite.pk}]"
             :key="test_suite.pk">
          <AGSuitePanel :test_suite="test_suite"
                        :active_suite="active_suite"
                        :active_case="active_case"
                        :active_command="active_command"
                        :level_selected="level_selected"
                        :last_suite="index === test_suites.length - 1"
                        @update_active_suite="update_active_suite($event)"
                        @update_active_case="update_active_case($event)"
                        @update_active_command="update_active_command($event)">
          </AGSuitePanel>
        </div>
      </div>
    </div>

    <div id="viewing-window">
      <div v-if="level_selected === 'Suite' && active_suite !== null">
        <AGSuiteSettings :test_suite="active_suite"
                         :project="project">
        </AGSuiteSettings>
      </div>

      <div v-if="level_selected === 'Case' && active_case !== null">
        <AGCaseSettings :test_case="active_case"></AGCaseSettings>
      </div>

      <div v-if="level_selected === 'Command' && active_command !== null">
        <AGCommandSettings :test_command="active_command"
                           :project="project">
        </AGCommandSettings>
      </div>
    </div>

    <modal ref="new_suite_modal"
           click_outside_to_close
           size="medium">
      <div class="modal-header"> New Suite </div>
      <hr>
      <div class="modal-body">
        <validated-form id="add-suite-form"
                        autocomplete="off"
                        spellcheck="false"
                        @submit.native.prevent="add_suite"
                        @form_validity_changed="add_suite_form_is_valid = $event">
          <div class="name-container">
            <label class="text-label"> Suite Name </label>
            <validated-input ref="new_suite_name"
                             v-model="new_suite_name"
                             :validators="[is_not_empty]">
            </validated-input>
          </div>

          <APIErrors ref="api_errors_new_suite"></APIErrors>

          <button class="modal-create-button"
                  :disabled="!add_suite_form_is_valid || adding_suite"> Add Suite
          </button>
        </validated-form>
      </div>
    </modal>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import AGCaseSettings from '@/components/project_admin/ag_suites/ag_case_settings.vue';
import AGCommandSettings from '@/components/project_admin/ag_suites/ag_command_settings.vue';
import AGSuitePanel from '@/components/project_admin/ag_suites/ag_suite_panel.vue';
import AGSuiteSettings from '@/components/project_admin/ag_suites/ag_suite_settings.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';

import {
  AGTestCase,
  AGTestCommand,
  AGTestSuite,
  AGTestSuiteObserver,
  Project
} from 'ag-client-typescript';
import { ID } from 'ag-client-typescript/dist/src/base';

import { deep_copy, handle_api_errors_async } from '@/utils';
import {
  is_not_empty,
} from '@/validators';

@Component({
  components: {
    AGCaseSettings,
    AGCommandSettings,
    AGSuitePanel,
    AGSuiteSettings,
    APIErrors,
    Modal,
    ValidatedForm,
    ValidatedInput
  }
})

// CaseObserver, CommandObserver
export default class AGSuites extends Vue implements AGTestSuiteObserver {

  @Prop({required: true, type: Project})
  project!: Project;

  async created() {
    AGTestSuite.subscribe(this);
    this.d_project = this.project;
    this.test_suites = await AGTestSuite.get_all_from_project(this.d_project.pk);
    this.loading = false;
  }

  beforeDestroy() {
    AGTestSuite.unsubscribe(this);
  }

  readonly is_not_empty = is_not_empty;

  level_selected: string = "Suite";
  active_suite: AGTestSuite | null = null;
  active_case: AGTestCase | null = null;
  active_command: AGTestCommand | null = null;

  d_project!: Project;
  test_suites: AGTestSuite[] = [];
  loading = true;

  add_suite_form_is_valid = false;
  adding_suite = false;
  new_suite_name = "";

  update_active_suite(ag_test_suite: AGTestSuite) {
    console.log("Updating suite");
    if (this.active_suite !== null && this.active_suite.pk === ag_test_suite.pk
        && this.level_selected === "Suite") {
      this.active_suite = null;
    }
    else {
      this.active_suite = deep_copy(ag_test_suite, AGTestSuite);
      this.active_case = null;
      this.active_command = null;
      this.level_selected = "Suite";
    }
  }

  update_active_case(ag_test_case: AGTestCase) {
    this.active_case = deep_copy(ag_test_case, AGTestCase);
    this.active_command = null;
    this.level_selected = "Case";
  }

  update_active_command(ag_test_command: AGTestCommand) {
    this.active_command = deep_copy(ag_test_command, AGTestCommand);
    this.level_selected = "Command";
  }

  // SuiteObserver --------------------------------------------------------------------------------
  update_ag_test_suite_changed(ag_test_suite: AGTestSuite): void {
    console.log("A suite changed");
    let index = this.test_suites.findIndex((suite: AGTestSuite) => suite.pk === ag_test_suite.pk);
    Vue.set(this.test_suites, index, deep_copy(ag_test_suite, AGTestSuite));
  }

  update_ag_test_suite_created(ag_test_suite: AGTestSuite): void {
    this.test_suites.push(ag_test_suite);
  }

  update_ag_test_suite_deleted(ag_test_suite: AGTestSuite): void {
    let index = this.test_suites.findIndex((suite: AGTestSuite) => ag_test_suite.pk === suite.pk);
    this.test_suites.splice(index, 1);
    if (this.test_suites.length === 0) {
      this.active_suite = null;
    }
    else if (index === this.test_suites.length) {
      this.update_active_suite(this.test_suites[index - 1]);
    }
    else {
      this.update_active_suite(this.test_suites[index]);
    }
  }

  update_ag_test_suites_order_changed(project_pk: number, ag_test_suite_order: ID[]): void {}

  @handle_api_errors_async(handle_add_ag_suite_error)
  async add_suite() {
    try {
      this.adding_suite = true;
      await AGTestSuite.create(this.d_project.pk, { name: this.new_suite_name });
      (<Modal> this.$refs.new_suite_modal).close();
      this.new_suite_name = "";
    }
    finally {
      this.adding_suite = false;
    }
  }
}

function handle_add_ag_suite_error(component: AGSuites, error: unknown) {
  (<APIErrors> component.$refs.api_errors_new_suite).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/ag_tests.scss';

#ag-test-suites-component {
  font-family: "Poppins";
  margin-top: 10px;
  position: relative;
}

.new-suite {
  @extend .white-button;
  box-sizing: border-box;
  border-radius: 10px;
  padding: 10px;
  margin: 10px;
}

.active-suite-container {
  //border-right: 1px solid $navy-blue;
}

#name-and-command {
  padding: 10px 0 20px 0;
}

.name-container, .command-container {
  padding: 0 0 22px 0;
}

.all-suites {
  border: 2px solid $white-gray;
  /*border-right: none;*/
  border-top: none;
  border-left: none;
}

.plus-sign {
  padding: 0 10px 0 0;
  color: $navy-blue;
}

@media only screen and (min-width: 481px) {

  #ag-test-cases-component {
    position: relative;
  }

  #suite-navigation-bar {
    width: 370px;
    padding-top: 0;
    margin: 0;
  }

  .all-suites {
    max-height: 87vh;
    overflow-y: scroll;
    scroll-behavior: smooth;
  }

  #viewing-window {
    position: absolute;
    left: 368px;
    top: 0;
    right: 0;
  }
}

</style>
