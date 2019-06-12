<template>
  <div id="ag-test-suites-component">

    <div id="suite-nav-bar">

      <div id="nav-bar-header">
        <div id="suites-title"> Suites </div>
        <button type="button"
                id="add-suite-button"
                @click="open_new_suite_modal()">
          <i class="fas fa-plus plus"></i> Add Suite
        </button>
      </div>

      <div id="nav-bar-body" @wheel.stop>
        <div id="all-suites">
          <div v-for="test_suite of test_suites"
               class="suite-container"
               :key="test_suite.pk">
            <AGSuitePanel :test_suite="test_suite"
                          :active_suite="active_suite"
                          :active_case="active_case"
                          :active_command="active_command"
                          @update_active_suite="update_active_suite($event)"
                          @update_active_case="update_active_case($event)"
                          @update_active_command="update_active_command($event)">
            </AGSuitePanel>
          </div>
        </div>
      </div>
    </div>

    <div id="viewing-window">
      <div> {{index_active_suite}}</div>
      <div v-if="active_level_is_suite"
           class="settings-wrapper">
        <AGSuiteSettings :test_suite="active_suite"
                         :project="project">
        </AGSuiteSettings>
      </div>

      <div v-else-if="active_level_is_command"
           class="settings-wrapper">
        <AGCommandSettings :test_command="active_command"
                           :test_case="active_case"
                           :project="project">
        </AGCommandSettings>
      </div>
    </div> <!--viewing-window-->

    <div id="button-footer">
      <span v-if="active_level_is_command">
        <button type="button"
                @click="go_to_prev_command"
                id="prev-command-button"
                :disabled="!prev_command_is_available">
          <i class="fas fa-angle-double-left" id="prev"> </i> Previous Command
        </button>

        <button type="button"
                @click="go_to_next_command"
                id="next-command-button"
                :disabled="!next_command_is_available">
          Next Command <i class="fas fa-angle-double-right" id="next"></i>
        </button>
      </span>
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

          <APIErrors ref="api_errors"></APIErrors>

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

import {
  AGTestCase,
  AGTestCommand,
  AGTestSuite,
  AGTestSuiteObserver,
  Project
} from 'ag-client-typescript';
import { ID } from 'ag-client-typescript/dist/src/base';

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import AGCaseSettings from '@/components/project_admin/ag_suites/ag_case_settings.vue';
import AGCommandSettings from '@/components/project_admin/ag_suites/ag_command_settings.vue';
import AGSuitePanel from '@/components/project_admin/ag_suites/ag_suite_panel.vue';
import AGSuiteSettings from '@/components/project_admin/ag_suites/ag_suite_settings.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { deep_copy, handle_api_errors_async } from '@/utils';
import { is_not_empty } from '@/validators';

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

export default class AGSuites extends Vue implements AGTestSuiteObserver {

  @Prop({required: true, type: Project})
  project!: Project;

  readonly is_not_empty = is_not_empty;

  active_suite: AGTestSuite | null = null;
  active_case: AGTestCase | null = null;
  active_command: AGTestCommand | null = null;
  add_suite_form_is_valid = false;
  adding_suite = false;
  index_active_suite = -1;
  index_active_case = -1;
  index_active_command = -1;
  loading = true;
  new_suite_name = "";
  test_suites: AGTestSuite[] = [];

  async created() {
    AGTestSuite.subscribe(this);
    this.test_suites = await AGTestSuite.get_all_from_project(this.project.pk);
    this.loading = false;
  }

  beforeDestroy() {
    AGTestSuite.unsubscribe(this);
  }

  open_new_suite_modal() {
    (<Modal> this.$refs.new_suite_modal).open();
    Vue.nextTick(() => {
      (<ValidatedInput> this.$refs.new_suite_name).invoke_focus();
    });
  }

  get prev_command_is_available() {
    if (this.active_command !== null && this.active_case !== null) {
      if (this.index_active_case !== 0) {
        let num_commands =
          this.active_suite!.ag_test_cases[this.index_active_case - 1].ag_test_commands.length - 1;
        return num_commands >= this.index_active_command;
      }
      else {
        if (this.index_active_suite !== 0) {
          let num_cases = this.test_suites[this.index_active_suite - 1].ag_test_cases.length;
          if (num_cases > 0) {
            let num_commands = this.test_suites[this.index_active_suite - 1]
              .ag_test_cases[num_cases - 1].ag_test_commands.length;
            if (num_commands >= this.index_active_command) {
              return num_commands >= this.index_active_command;
            }
          }
        }
      }
    }
    return false;
  }

  go_to_prev_command() {
    if (this.index_active_case !== 0) {
      let num_commands = this.active_suite!.ag_test_cases[this.index_active_case - 1]
                           .ag_test_commands.length - 1;
      if (num_commands >= this.index_active_command) {
        this.index_active_case -= 1;
      }
    }
    else {
      if (this.index_active_suite !== 0) {
        let num_cases = this.test_suites[this.index_active_suite - 1].ag_test_cases.length;
        if (num_cases > 0) {
          let num_commands = this.test_suites[this.index_active_suite - 1]
            .ag_test_cases[num_cases - 1].ag_test_commands.length;
          if (num_commands >= this.index_active_command) {
            this.index_active_suite -= 1;
            this.index_active_case = num_cases - 1;
          }
        }
      }
    }
  }

  get next_command_is_available() {
    if (this.active_command !== null && this.active_case !== null) {
      if (this.active_suite!.ag_test_cases.length - 1 > this.index_active_case) {
        let num_commands = this.active_suite!.ag_test_cases[this.index_active_case + 1]
                             .ag_test_commands.length - 1;
        return num_commands >= this.index_active_command;
      }
      else {
        if (this.index_active_suite <= this.test_suites.length - 1) {
          if (this.test_suites[this.index_active_suite + 1].ag_test_cases.length > 0) {
            return this.test_suites[this.index_active_suite + 1].ag_test_cases[0]
                     .ag_test_commands.length - 1 >= this.index_active_command;
          }
        }
      }
    }
    return false;
  }

  go_to_next_command() {
    if (this.active_suite!.ag_test_cases.length - 1 > this.index_active_case) {
      let num_commands = this.active_suite!.ag_test_cases[this.index_active_case + 1]
                           .ag_test_commands.length - 1;
      if (num_commands >= this.index_active_command) {
        this.index_active_case += 1;
      }
    }
    else {
      if (this.index_active_suite <= this.test_suites.length - 1) {
        if (this.test_suites[this.index_active_suite + 1].ag_test_cases.length > 0) {
          let num_commands =
            this.test_suites[this.index_active_suite + 1].ag_test_cases[0]
              .ag_test_commands.length - 1;
          if (num_commands >= this.index_active_command) {
            this.index_active_suite += 1;
            this.index_active_case = 0;
          }
        }
      }
    }
  }

  get active_level_is_suite() {
    return this.active_suite !== null && this.active_case === null;
  }

  get active_level_is_command() {
    return this.active_command !== null;
  }

  update_active_suite(ag_suite: AGTestSuite) {
    if (this.active_suite !== null && this.active_suite.pk === ag_suite!.pk
        && this.index_active_case === -1 && this.index_active_command === -1) {
      console.log(this.active_suite.name + " Was already clicked on");
      this.index_active_suite = -1;
    }
    else {
      this.active_suite = deep_copy(ag_suite, AGTestSuite);
      this.index_active_suite = this.test_suites.findIndex(
        (test_suite: AGTestSuite) => ag_suite.pk === test_suite.pk
      );
      this.index_active_case = -1;
      this.index_active_command = -1;
    }
  }

  update_active_case(ag_case: AGTestCase) {
    if (this.active_case !== null && this.active_case.pk === ag_case!.pk
        && this.active_command === null) {
      this.index_active_case = -1;
    }
    else {
      this.active_case = deep_copy(ag_case, AGTestCase);
      this.index_active_case = this.active_suite!.ag_test_cases.findIndex(
        (test_case: AGTestCase) => ag_case.pk === test_case.pk
      );
      this.index_active_command = this.active_case!.ag_test_commands.length === 0 ? -1 : 0;
    }
  }

  update_active_command(ag_command: AGTestCommand) {
    this.index_active_command =  this.active_case!.ag_test_commands.findIndex(
        (test_command: AGTestCommand) => ag_command.pk === test_command.pk
    );
  }

  // SuiteObserver --------------------------------------------------------------------------------
  update_ag_test_suite_changed(ag_test_suite: AGTestSuite): void {
    let index = this.test_suites.findIndex((suite: AGTestSuite) => suite.pk === ag_test_suite.pk);
    Vue.set(this.test_suites, index, deep_copy(ag_test_suite, AGTestSuite));
  }

  update_ag_test_suite_created(ag_test_suite: AGTestSuite): void {
    this.test_suites.push(ag_test_suite);
    this.update_active_suite(ag_test_suite);
  }

  update_ag_test_suite_deleted(ag_test_suite: AGTestSuite): void {
    let index = this.test_suites.findIndex((suite: AGTestSuite) => ag_test_suite.pk === suite.pk);
    this.test_suites.splice(index, 1);
    if (this.test_suites.length === 0) {
      this.index_active_suite = -1;
    }
    else if (index === this.test_suites.length) {
      this.update_active_suite(this.test_suites[index - 1]);
    }
    else {
      console.log("More than one test suite and not the first one");
      this.update_active_suite(this.test_suites[index]);
    }
  }

  update_ag_test_suites_order_changed(project_pk: number, ag_test_suite_order: ID[]): void {}

  @handle_api_errors_async(handle_add_ag_suite_error)
  async add_suite() {
    try {
      this.adding_suite = true;
      await AGTestSuite.create(this.project.pk, { name: this.new_suite_name });
      (<Modal> this.$refs.new_suite_modal).close();
      this.new_suite_name = "";
    }
    finally {
      this.adding_suite = false;
    }
  }
}

function handle_add_ag_suite_error(component: AGSuites, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/ag_tests.scss';

.settings-wrapper {
  height: 100%;
}

#ag-test-suites-component {
  font-family: "Poppins";
  width: 100%;
  box-sizing: border-box;
  display: flex;
}

#suite-nav-bar {
  box-sizing: border-box;
  flex-direction: column;
  align-items: stretch;
  min-width: 400px;
}

#nav-bar-header {
  padding: 15px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-left: none;
  border-bottom: none;
  margin-top: 10px;
  box-sizing: border-box;
}

#nav-bar-body {
  box-sizing: border-box;
  flex: 2;
  overflow-y: scroll;
  padding-bottom: 10px;
  height: 700px;
}

#suites-title {
  font-size: 25px;
  display: inline-block;
}

#add-suite-button {
  @extend .white-button;
  box-shadow: none;
}

.plus {
  padding-right: 5px;
}

#viewing-window {
  box-sizing: border-box;
  flex: 1;
  padding-top: 20px;
}

#button-footer {
  background-color: $white-gray;
  border-top: 1px solid hsl(210, 20%, 94%);
  bottom: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  left: 0;
  right: 0;
  min-height: 55px;
  padding: 10px 10px 10px 10px;
  position: fixed;
}

#next-command-button, #prev-command-button {
  @extend .white-button;
  margin-left: 15px;
}

#next {
  padding-left: 5px;
}

#prev {
  padding-right: 5px;
}

// Modal **************************************************************
#name-and-command {
  padding: 10px 0 20px 0;
}

.name-container, .command-container {
  padding: 0 0 22px 0;
}

</style>
