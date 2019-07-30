<template>
  <div id="mutation-suites" v-if="!d_loading">

    <div id="mutation-test-suite-sidebar">
      <div> Mutation Testing Suites </div>
      <div>
        <button type="button"
                id="add-mutation-test-suite-button"
                @click="open_new_mutation_test_suite_modal">
          <i class="fas fa-plus plus"></i> Add Suite
        </button>
      </div>

      <div id="suites">
        <div v-for="mutation_test_suite of d_mutation_test_suites">
          <mutation-suite-panel :mutation_test_suite="mutation_test_suite"
                                @update_active_suite="update_active_mutation_test_suite($event)">
          </mutation-suite-panel>
        </div>
      </div>
    </div>

    <div id="viewing-window">
      <div v-if="d_active_mutation_test_suite !== null">
        <mutation-suite-settings :mutation_test_suite="d_active_mutation_test_suite"
                                 :project="project">
        </mutation-suite-settings>
      </div>
    </div>

    <modal ref="new_mutation_test_suite_modal"
           click_outside_to_close
           size="medium">
      <div class="modal-header"> New Suite </div>
      <hr>
      <div class="modal-body">
        <validated-form id="add-ag-test-suite-form"
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

          <button class="modal-create-suite-button"
                  :disabled="!d_add_mutation_test_suite_form_is_valid || d_adding_suite"> Add Suite
          </button>
        </validated-form>
      </div>
    </modal>

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
import MutationSuitePanel from '@/components/project_admin/mutation_suite_editing/mutation_suite_panel.vue';
import MutationSuiteSettings from "@/components/project_admin/mutation_suite_editing/mutation_suite_settings.vue";
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { deep_copy, handle_api_errors_async } from '@/utils';
import { is_not_empty } from '@/validators';

@Component({
  components: {
    APIErrors,
    Modal,
    MutationSuitePanel,
    MutationSuiteSettings,
    ValidatedForm,
    ValidatedInput
  }
})
export default class MutationSuites extends Vue implements MutationTestSuiteObserver {
  @Prop({required: true, type: Project})
  project!: Project;

  readonly is_not_empty = is_not_empty;

  d_active_mutation_test_suite: MutationTestSuite | null = null;
  d_mutation_test_suites: MutationTestSuite[] = [];
  d_loading = true;
  d_adding_suite = false;
  d_add_mutation_test_suite_form_is_valid = true;
  d_new_mutation_test_suite_name = "";

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
      let new_suite = await MutationTestSuite.create(
        this.project.pk, {name: this.d_new_mutation_test_suite_name}
      );
      (<Modal> this.$refs.new_mutation_test_suite_modal).close();
      this.d_new_mutation_test_suite_name = "";
    }
    finally {
      this.d_adding_suite = false;
    }
  }

  update_active_mutation_test_suite(mutation_test_suite: MutationTestSuite) {
      this.d_active_mutation_test_suite = mutation_test_suite;
  }

  open_new_mutation_test_suite_modal() {
    (<Modal> this.$refs.new_mutation_test_suite_modal).open();
    Vue.nextTick(() => {
      (<ValidatedInput> this.$refs.new_mutation_test_suite_name).focus();
    });
  }

  update_mutation_test_suite_created(mutation_test_suite: MutationTestSuite): void {
      this.d_mutation_test_suites.push(mutation_test_suite);
  }
  update_mutation_test_suite_changed(mutation_test_suite: MutationTestSuite): void {
      let index = this.d_mutation_test_suites.findIndex(
          (mutation_suite: MutationTestSuite) => mutation_suite.pk === mutation_test_suite.pk
      );
      Vue.set(this.d_mutation_test_suites,
              index,
              deep_copy(mutation_test_suite, MutationTestSuite)
      );
  }
  update_mutation_test_suite_deleted(mutation_test_suite: MutationTestSuite): void {
      let index = this.d_mutation_test_suites.findIndex(
          (mutation_suite: MutationTestSuite) => mutation_suite.pk === mutation_test_suite.pk
      );
      this.d_mutation_test_suites.splice(index, 1);
  }
  update_mutation_test_suites_order_changed(project_pk: number, mutation_test_suite_order: number[]): void {
      throw new Error("Method not implemented.");
  }
}

function handle_add_mutation_test_suite_error(component: MutationSuites, error: unknown) {
    (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/button_styles.scss';

#mutation-suites {
  padding: 10px;
}

#add-mutation-test-suite-button {
  @extend .white-button;
  box-shadow: none;
}

.modal-header {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  padding: 5px 0;
}

.modal-create-suite-button {
  @extend .green-button;
  float: right;
}

.mutation-test-suite-name-container {
  padding: 0 0 22px 0;
}

#mutation-test-suite-sidebar {
  width: 200px;
}

#viewing-window {

}

.plus {
  margin-right: 3px;
  font-size: 14px;
}

#suites {
  margin-top: 10px;
}

</style>
