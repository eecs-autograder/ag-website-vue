<template>
  <div>
      <div :class="['test-suite', {'last-suite': last_suite},
                   {'active-suite': level_selected === 'Suite'
                     && active_suite !== null && active_suite.pk === test_suite.pk},
                   {'suite-in-active-container': active_suite !== null
                     && active_suite.pk === test_suite.pk}]"
         @click="$emit('update_active_suite', test_suite)">

        <div class="suite-name">{{test_suite.name}}</div>
      </div>

      <div class="cases-container" v-if="active_suite !== null
                                         && active_suite.pk === test_suite.pk">
        <div v-if="active_suite !== null && active_suite.pk === test_suite.pk"
             class="new-case-button"><i class="fas fa-plus plus-sign"></i> Add Case  </div>
        <div v-for="(test_case, index) of test_suite.ag_test_cases"
             :key="test_case.pk">
          <AGCasePanel :test_case="test_case"
                       :level_selected="level_selected"
                       :active_case="active_case"
                       :active_command="active_command"
                       :last_case="index === test_suite.ag_test_cases.length - 1"
                       @update_active_case="$emit('update_active_case', $event)"
                       @update_active_command="$emit('update_active_command', $event)">
          </AGCasePanel>
        </div>
      </div>

    <modal ref="new_case_modal"
           click_outside_to_close
           size="medium">
      <div class="modal-header"> New Case </div>
      <hr>
      <div class="modal-body">
        <div class="name-container">
          <label class="text-label"> Case Name </label>
          <validated-form id="add-case-form"
                          autocomplete="off"
                          spellcheck="false"
                          @submit.native.prevent="add_case"
                          @form_validity_changed="add_case_form_is_valid = $event">
            <div class="name-container">
              <validated-input ref="new_case_name"
                               v-model="new_case_name"
                               :validators="[is_not_empty]">
              </validated-input>
            </div>

            <div class="name-container">
              <label class="text-label"> Command Name </label>
              <validated-input ref="new_command_name"
                               v-model="new_command_name"
                               :validators="[is_not_empty]">
              </validated-input>
            </div>
            <div class="command-container">
              <label class="text-label"> Command </label>
              <validated-input ref="new_command_name"
                               v-model="new_command"
                               :validators="[is_not_empty]">
              </validated-input>
            </div>

            <APIErrors ref="api_errors_new_case"></APIErrors>

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
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';

import { AGTestCase, AGTestCaseObserver, AGTestCommand, AGTestSuite } from 'ag-client-typescript';

import { deep_copy, handle_api_errors_async } from '@/utils';
import {
  is_not_empty,
} from '@/validators';

@Component({
  components: {
    AGCasePanel,
    APIErrors,
    Modal,
    ValidatedForm,
    ValidatedInput
  }
})
export default class AGSuitePanel extends Vue implements AGTestCaseObserver {

  @Prop({default: false, type: Boolean})
  last_suite!: boolean;

  @Prop({required: true, type: AGTestSuite})
  test_suite!: AGTestSuite;

  @Prop({default: null, type: AGTestSuite})
  active_suite!: AGTestSuite | null;

  @Prop({required: true})
  active_case!: AGTestCase | null;

  @Prop({required: true})
  active_command!: AGTestCommand | null;

  @Prop({required: true, type: String})
  level_selected!: string;

  readonly is_not_empty = is_not_empty;

  add_case_form_is_valid = false;
  adding_case = false;
  loading = true;
  new_case_name = "";
  new_command_name = "";
  new_command = "";

  created() {
    AGTestCase.subscribe(this);
  }

  beforeDestroy() {
    AGTestCase.unsubscribe(this);
  }

  @handle_api_errors_async(handle_add_ag_case_error)
  async add_case() {
    try {
      this.adding_case = true;
      let test_case = await AGTestCase.create(this.test_suite!.pk, { name: this.new_case_name });
      this.add_command(test_case.pk);
      (<Modal> this.$refs.new_case_modal).close();
      this.new_case_name = "";
    }
    finally {
      this.adding_case = false;
    }
  }

  @handle_api_errors_async(handle_add_ag_command_error)
  async add_command(test_case_pk: number) {
    try {
      this.adding_case = true;
      await AGTestCommand.create(
        test_case_pk, { name: this.new_command_name, cmd: this.new_command }
      );
      this.new_command_name = "";
      this.new_command = "";
    }
    finally {
      this.adding_case = false;
    }
  }

  update_ag_test_case_changed(ag_test_case: AGTestCase): void {
    console.log("A case changed");
    let index = this.test_suite.ag_test_cases.findIndex(
      (test_case: AGTestCase) => test_case.pk === ag_test_case.pk
    );
    Vue.set(this.test_suite.ag_test_cases, index, deep_copy(ag_test_case, AGTestCase));
  }

  update_ag_test_case_created(ag_test_case: AGTestCase): void {
    console.log("A Test Case Was Created");
    if (ag_test_case.ag_test_suite === this.test_suite.pk) {
      this.test_suite.ag_test_cases.push(ag_test_case);
    }
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
  (<APIErrors> component.$refs.api_errors_new_case).show_errors_from_response(error);
}

function handle_add_ag_command_error(component: AGSuitePanel, error: unknown) {
  (<APIErrors> component.$refs.api_errors_new_command).show_errors_from_response(error);
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Hind|Poppins');
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/ag_tests.scss';

.test-suite {
  cursor: pointer;
  border: 1px solid darken($white-gray, 3);
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: none;
  background-color: white;
}

.last-suite {
  border-bottom: none;
}

.new-case-button {
  padding: 5px 10px;
  width: 92.5%;
  margin: 4px 0 4px 7.5%;
}

.plus-sign {
  padding: 0 10px 0 0;
  color: black;
}

.suite-in-active-container {
  background-color: $suite-in-active-container-color;
}

.parent-of-active-case {
  background-color: $parent-of-active-color;
}

.active-suite, .active-suite:hover {
  background-color: $active-color;
}

.case-name {
  display: inline-block;
  padding: 10px;
  max-width: 80%;
}

.add-case {
  display: inline-block;
  padding: 4px 8px;
  font-size: 25px;
  margin-left: 2px;
  cursor: pointer;
}

.name-container, .command-container {
  padding: 0 0 22px 0;
}
</style>
