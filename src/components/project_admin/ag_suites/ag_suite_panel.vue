<template>
  <div id="ag-suite-panel">
      <div :class="['test-suite',
                   {'active-suite': is_active_suite},
                   {'suite-in-active-container': case_or_command_is_active_level}]"
         @click="$emit('update_active_suite', test_suite)">

        <div class="test-suite-name">
          <i v-if="is_active_suite" class="fas fa-folder-open suite-symbol"></i>
          <i v-else class="fas fa-folder suite-symbol"></i>
          <span>{{test_suite.name}}</span>
        </div>

        <div v-if="is_active_suite"
             class="suite-menu"
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
                          @submit.native.prevent="add_case"
                          @form_validity_changed="add_case_form_is_valid = $event">

            <div class="checkbox-container">
              <input id="ignore-case"
                     type="checkbox"
                     v-model="intend_on_having_more_than_one_command">
              <label class="checkbox-label"
                     for="ignore-case"> Case will eventually have more than one command
              </label>
              <i class="fas fa-question-circle input-tooltip">
                <tooltip width="medium" placement="right">
                  By default, the first command in a case shares the same name as the test case it
                  is created in. If you intend to have more than one command in this case, checking
                  this box will allow you to supply a different name than the test case name for
                  the first command in the case.
                </tooltip>
              </i>
            </div>

            <div class="case-name-container">
              <label class="text-label"> Case Name </label>
              <validated-input ref="new_case_name"
                               v-model="new_case_name"
                               :validators="[is_not_empty]">
              </validated-input>
            </div>

            <div class="command-name-container" v-if="intend_on_having_more_than_one_command">
              <label class="text-label"> Command Name</label>
              <validated-input ref="new_command_name"
                               v-model="new_command_name"
                               :validators="[is_not_empty]">
              </validated-input>
            </div>


            <div class="command-container">
              <label class="text-label"> Command </label>
              <validated-input ref="new_command"
                               v-model="new_command"
                               :validators="[is_not_empty]">
              </validated-input>
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

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import AGCasePanel from '@/components/project_admin/ag_suites/ag_case_panel.vue';
import Tooltip from '@/components/tooltip.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';

import {
  AGTestCase,
  AGTestCaseObserver,
  AGTestCommand,
  AGTestSuite
} from 'ag-client-typescript';

import { deep_copy, handle_api_errors_async } from '@/utils';
import {
  is_not_empty,
} from '@/validators';

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
export default class AGSuitePanel extends Vue implements AGTestCaseObserver {

  @Prop({required: true, type: AGTestSuite})
  test_suite!: AGTestSuite;

  @Prop({default: null, type: AGTestSuite})
  active_suite!: AGTestSuite | null;

  @Prop({required: true})
  active_case!: AGTestCase | null;

  @Prop({required: true})
  active_command!: AGTestCommand | null;

  readonly is_not_empty = is_not_empty;

  add_case_form_is_valid = false;
  adding_case = false;
  loading = true;
  new_case_name = "";
  new_command_name = "";
  new_command = "";
  intend_on_having_more_than_one_command = false;

  created() {
    AGTestCase.subscribe(this);
  }

  beforeDestroy() {
    AGTestCase.unsubscribe(this);
  }

  get is_active_suite() {
    return this.active_suite !== null && this.active_suite.pk === this.test_suite.pk;
  }

  get case_or_command_is_active_level() {
    return this.is_active_suite && this.active_case !== null;
  }

  open_new_case_modal() {
    this.new_command_name = "";
    this.new_command = "";
    this.new_case_name = "";
    this.intend_on_having_more_than_one_command = false;
    (<Modal> this.$refs.new_case_modal).open();
  }

  @handle_api_errors_async(handle_add_ag_case_error)
  async add_case() {
    try {
      this.adding_case = true;
      (<APIErrors> this.$refs.new_case_api_errors).clear();
      let created_case = await AGTestCase.create(
        this.test_suite!.pk, { name: this.new_case_name }
      );

      this.new_command_name = this.intend_on_having_more_than_one_command ?
        this.new_command_name : this.new_case_name;
      await AGTestCommand.create(
        created_case.pk, { name: this.new_command_name, cmd: this.new_command }
      );
      (<Modal> this.$refs.new_case_modal).close();
    }
    finally {
      this.adding_case = false;
    }
  }

  update_ag_test_case_changed(ag_test_case: AGTestCase): void {
    if (ag_test_case.ag_test_suite === this.test_suite.pk) {
      let index = this.test_suite.ag_test_cases.findIndex(
        (test_case: AGTestCase) => test_case.pk === ag_test_case.pk
      );
      Vue.set(this.test_suite.ag_test_cases, index, deep_copy(ag_test_case, AGTestCase));
    }
  }

  update_ag_test_case_created(ag_test_case: AGTestCase): void {
    if (ag_test_case.ag_test_suite === this.test_suite.pk) {
      this.test_suite.ag_test_cases.push(ag_test_case);
    }
    this.$emit('update_active_case', ag_test_case);
  }

  update_ag_test_case_deleted(ag_test_case: AGTestCase): void {
    if (ag_test_case.ag_test_suite === this.test_suite.pk) {
      let index = this.test_suite.ag_test_cases.findIndex(
        (test_case: AGTestCase) => test_case.pk === ag_test_case.pk
      );
      this.test_suite.ag_test_cases.splice(index, 1);
      if (this.test_suite.ag_test_cases.length === 0) {
        this.$emit('update_active_suite', this.test_suite);
      }
      else if (index === this.test_suite.ag_test_cases.length) {
        this.$emit('update_active_case', this.test_suite.ag_test_cases[index - 1]);
      }
      else {
        this.$emit('update_active_case', this.test_suite.ag_test_cases[index]);
      }
    }
  }

  update_ag_test_cases_order_changed(ag_test_suite_pk: number,
                                     ag_test_case_order: number[]): void {}
}

function handle_add_ag_case_error(component: AGSuitePanel, error: unknown) {
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
  padding: 0 5px 0 15px;

  .suite-symbol {
    padding-right: 8px;
    font-size: 16px;
    color: darken($stormy-gray-dark, 10);
  }
}

.test-suite-name {
  padding: 5px;
}

.new-case-button {
  padding-right: 10px;
}

.case-name-container {
  padding: 0 0 22px 0;
}

.command-name-container {
  padding: 0 0 22px 0;
}

.command-container {
  padding: 0 0 22px 0;
}

.checkbox-container {
  padding: 12px 0 12px 0;
}

.active-suite {
  @extend .active-level;

  .suite-symbol {
    color: white;
  }

  .suite-menu {
    color: white;
    padding: 5px;
  }

  .suite-menu:hover {
    color: darken($stormy-gray-dark, 10);
  }
}

.suite-in-active-container {
  @extend .parent-of-active-level;
  //background-color: hsl(210, 20%, 96%);
  background-color: white;

  .suite-symbol {
    color: darken(teal, 10);
  }

  .suite-menu {
    color: darken(teal, 10);
  }
}

.suite-symbol {
  padding-right: 8px;
  font-size: 16px;
}

.plus-sign {
    font-size: 14px;
}

</style>
