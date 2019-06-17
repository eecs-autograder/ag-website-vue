<template>
  <div id="ag-suite-panel" v-if="test_suite !== null">
      <div :class="['test-suite',
                   {'active-suite': is_active_suite},
                   {'suite-in-active-container': case_or_command_is_active_level}]"
         @click="$emit('update_active_suite', test_suite)">

        <div class="test-suite-name">
          <i v-if="is_active_suite" class="fas fa-caret-down suite-symbol-down"></i>
          <i v-else class="fas fa-caret-right suite-symbol-right"></i>
          <span>{{test_suite.name}}</span>
        </div>

        <div id="suite-menu"
             title="Add Case"
             @click.stop="open_new_case_modal">
          <i class="fas fa-plus"></i>
        </div>
      </div>

      <div class="cases-container" v-if="is_active_suite">
        <div v-for="(test_case, index) of test_suite.ag_test_cases"
             :key="test_case.pk">
          <AGCasePanel :test_case="test_case"
                       :active_case="active_case"
                       :active_command="active_command"
                       @update_active_case="$emit('update_active_case', $event)"
                       @update_active_command="$emit('update_active_command', $event)">
          </AGCasePanel>
        </div>
      </div>

    <modal ref="new_case_modal"
           click_outside_to_close
           size="large">
      <div class="modal-header"> New Case </div>
      <hr>
      <div class="modal-body">
        <div class="name-container">
          <validated-form id="add-case-form"
                          autocomplete="off"
                          spellcheck="false"
                          @submit.native.prevent="create_case"
                          @form_validity_changed="add_case_form_is_valid = $event">

            <div class="checkbox-container">
              <input id="ignore-case"
                     type="checkbox"
                     v-model="compound_case">
              <label class="checkbox-label"
                     for="ignore-case"> Compound case
              </label>
              <i class="fas fa-question-circle input-tooltip">
                <tooltip width="large" placement="right">
                  By default, the first command in a case shares the same name as the test case it
                  is created in. If you intend to have more than one command in this case, checking
                  this box will allow you to supply a different name than the test case name for
                  the first command in the case.
                </tooltip>
              </i>
            </div>

            <div class="case-name-container">
              <label class="text-label"> Case name </label>
              <validated-input ref="new_case_name"
                               v-model="new_case_name"
                               :validators="[is_not_empty]">
              </validated-input>
            </div>

            <div class="new-command-container">
              <div class="command-name" v-if="compound_case">
                <label class="text-label">{{compound_case ? "First command name" : "Command name"}}</label>
                <validated-input ref="first_command_name"
                                 v-model="first_command_name"
                                 :validators="[is_not_empty]">
                </validated-input>
              </div>

              <div class="command">
                <label class="text-label">{{compound_case ? "First Command" : "Command"}}</label>
                <validated-input ref="first_command"
                                 v-model="first_command"
                                 :validators="[is_not_empty]">
                </validated-input>
              </div>
            </div>

            <div class="new-command-container" v-if="compound_case">
              <div class="command-name">
                <label class="text-label"> Second command name </label>
                <validated-input ref="second_command_name"
                                 v-model="second_command_name"
                                 :validators="[is_not_empty]">
                </validated-input>
              </div>

              <div class="command">
                <label class="text-label"> Second Command </label>
                <validated-input ref="second_command"
                                 v-model="second_command"
                                 :validators="[is_not_empty]">
                </validated-input>
              </div>
            </div>

            <APIErrors ref="new_case_api_errors"></APIErrors>

            <button class="modal-create-button"
                    :disabled="!add_case_form_is_valid || adding_case">
              Add Case
            </button>

          </validated-form>
        </div>
      </div>
    </modal>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
  AGTestCase,
  AGTestCommand,
  AGTestSuite
} from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import AGCasePanel from '@/components/project_admin/ag_suites/ag_case_panel.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { handle_api_errors_async } from '@/utils';
import { is_not_empty } from '@/validators';

@Component({
  components: {
    AGCasePanel,
    APIErrors,
    Modal,
    Tooltip,
    ValidatedForm,
    ValidatedInput
  }
})
export default class AGSuitePanel extends Vue {

  @Prop({default: null, type: AGTestSuite})
  active_suite!: AGTestSuite | null;

  @Prop({required: true})
  active_case!: AGTestCase | null;

  @Prop({required: true})
  active_command!: AGTestCommand | null;

  @Prop({required: true, type: AGTestSuite})
  test_suite!: AGTestSuite;

  readonly is_not_empty = is_not_empty;

  add_case_form_is_valid = false;
  adding_case = false;
  loading = true;
  new_case_name = "";
  first_command_name = "";
  first_command = "";
  second_command_name = "";
  second_command = "";
  compound_case = false;

  get is_active_suite() {
    return this.active_suite !== null && this.active_suite.pk === this.test_suite!.pk;
  }

  get case_or_command_is_active_level() {
    return this.is_active_suite && this.active_case !== null;
  }

  open_new_case_modal() {
    if (this.active_suite === null || this.active_suite.pk !== this.test_suite!.pk) {
      this.$emit('update_active_suite', this.test_suite);
    }
    this.first_command_name = "";
    this.first_command = "";
    this.second_command_name = "";
    this.second_command = "";
    this.new_case_name = "";
    this.compound_case = false;
    (<Modal> this.$refs.new_case_modal).open();
    Vue.nextTick(() => {
      (<ValidatedInput> this.$refs.new_case_name).invoke_focus();
    });
  }

  @handle_api_errors_async(handle_create_ag_case_error)
  async create_case() {
    try {
      this.adding_case = true;
      (<APIErrors> this.$refs.new_case_api_errors).clear();
      let created_case = await AGTestCase.create(this.test_suite!.pk, {name: this.new_case_name});
      this.first_command_name = this.compound_case ? this.first_command_name : this.new_case_name;
      await AGTestCommand.create(
        created_case.pk, {name: this.first_command_name, cmd: this.first_command}
      );
      if (this.compound_case) {
        await AGTestCommand.create(
          created_case.pk, {name: this.second_command_name, cmd: this.second_command}
        );
      }
      (<Modal> this.$refs.new_case_modal).close();
    }
    finally {
      this.adding_case = false;
    }
  }
}

function handle_create_ag_case_error(component: AGSuitePanel, error: unknown) {
  (<APIErrors> component.$refs.new_case_api_errors).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/ag_tests.scss';

.test-suite {
  @extend .panel;
  padding: 0 5px 0 5px;

  .suite-symbol-right {
    padding: 0 10px 0 3px;
    font-size: 18px;
    color: darken($stormy-gray-dark, 10);
  }

  .suite-symbol-down {
    padding: 0 8px 0 0;
    font-size: 18px;
    color: darken($stormy-gray-dark, 10);
  }

  #suite-menu {
    padding: 5px;
    visibility: hidden;
  }
}

.test-suite:hover {
  #suite-menu {
    visibility: visible;
    color: darken($stormy-gray-dark, 10);
  }
}

.test-suite-name {
  padding: 5px;
}

.active-suite {
  @extend .active-level;

  #suite-menu, #suite-menu:hover {
    visibility: visible;
    color: white;
  }

  .suite-symbol-right, .suite-symbol-down {
    color: white;
  }
}

.active-suite:hover {
  #suite-menu {
    color: white;
  }
}

.suite-in-active-container {
  @extend .parent-of-active-level;
  background-color: white;

  #suite-menu, .suite-symbol-right, .suite-symbol-down {
    color: darken(teal, 10);
  }

  #suite-menu {
    visibility: visible;
  }
}

.suite-in-active-container:hover {
  #suite-menu {
    color: darken(teal, 10);
  }
}

// Modal **************************************************************
.case-name-container {
  padding: 0 0 0 0;
}

.command-name {
  padding: 32px 0 0 0;
}

.command {
  padding: 12px 0;
}

.new-command-inputs {
  width: 100%;
}

.checkbox-container {
  padding: 12px 0 12px 0;
}

.modal-create-button {
  margin-top: 10px;
}

</style>
