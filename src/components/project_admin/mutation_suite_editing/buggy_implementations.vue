<template>
  <div>
    <validated-form id="buggy-implementation-settings-form"
                    autocomplete="off"
                    spellcheck="false"
                    @form_validity_changed="d_mutation_test_suite_settings_form_is_valid = $event"
                    @submit="save_buggy_implementations_settings">
      <div class="input-container">
        <label class="text-label"> Points per exposed bug </label>
        <validated-input ref="points_per_exposed_bug"
                         id="points-per-exposed-bug"
                         v-model="d_mutation_test_suite.points_per_exposed_bug"
                         :validators="[
                           is_not_empty,
                           is_number,
                           is_non_negative,
                           has_less_than_or_equal_to_four_digits,
                           has_less_than_or_equal_to_two_decimal_places
                         ]"
                         input_style="max-width: 500px; width: 100%"
                         :from_string_fn="string_to_num">
        </validated-input>
      </div>

      <div class="checkbox-input-container">
        <input id="use-max-points"
               type="checkbox"
               class="checkbox"
               @change="toggle_custom_max_points"
               v-model="use_custom_max_points"/>
        <label class="checkbox-label"
               for="use-max-points">
          Use Custom Max Points
        </label>
      </div>

      <div v-if="use_custom_max_points"
           class="input-container">
        <label class="text-label"> Max points </label>
        <validated-input ref="max_points"
                         id="max-points"
                         v-model="d_mutation_test_suite.max_points"
                         :validators="[
                           is_not_empty,
                           is_integer,
                           is_non_negative
                         ]"
                         input_style="max-width: 500px; width: 100%"
                         :from_string_fn="string_to_num">
        </validated-input>
      </div>

      <div class="input-container">
        <label class="text-label"> Max num student tests </label>
        <validated-input ref="max_num_student_tests"
                         id="max-num-student-tests"
                         v-model="d_mutation_test_suite.max_num_student_tests"
                         :validators="[
                           is_not_empty,
                           is_non_negative
                         ]"
                         input_style="max-width: 500px; width: 100%"
                         :from_string_fn="string_to_num">
        </validated-input>
      </div>

      <div class="input-container">
        <label class="text-label"> Buggy Implementation Names </label>
        <validated-input ref="buggy_implementation_names"
                         id="buggy-implementation-names-input"
                         num_rows="3"
                         v-model="buggy_impl_names"
                         :validators="[]"
                         input_style="max-width: 500px; width: 100%">
        </validated-input>
      </div>

      <div>
        <button class="blue-button add-buggy-impl-names-button"
                type="button"
                @click="add_buggy_implementation_names"> Add
        </button>
      </div>

      <div id="buggy-implementation-names"
           v-if="d_mutation_test_suite.buggy_impl_names.length !== 0">
        <div v-for="(buggy_name, index) of d_mutation_test_suite.buggy_impl_names"
             :class="['buggy-implementation-row', {'odd-index': index % 2 !== 0}]">
          <span class="buggy-name">{{buggy_name}}</span>
          <div class="remove-buggy-impl-name-container"
               @click="remove_buggy_implementation_name(index)">
            <i class="fas fa-times remove-buggy-impl-name"></i>
          </div>
        </div>
      </div>

      <div class="bottom-of-form">
        <APIErrors ref="api_errors"></APIErrors>

        <button class="green-button"
                id="save-button"
                :disabled="!d_mutation_test_suite_settings_form_is_valid || d_saving">
          Save
        </button>
      </div>

    </validated-form>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
  MutationTestSuite
} from 'ag-client-typescript';

import APIErrors from "@/components/api_errors.vue";
import ValidatedForm from "@/components/validated_form.vue";
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { deep_copy, handle_api_errors_async } from "@/utils";
import {
    is_integer,
    is_non_negative,
    is_not_empty,
    is_number,
    make_max_num_digits_validator,
    make_num_decimal_places_validator,
    string_to_num
} from '@/validators';

@Component({
  components: {
    APIErrors,
    ValidatedForm,
    ValidatedInput
  }
})
export default class BuggyImplementations extends Vue {
  @Prop({required: true, type: MutationTestSuite})
  mutation_test_suite!: MutationTestSuite;

  buggy_impl_names = "";
  d_mutation_test_suite: MutationTestSuite | null = null;
  d_mutation_test_suite_settings_form_is_valid = true;
  d_saving = false;
  use_custom_max_points = false;

  readonly is_integer = is_integer;
  readonly is_not_empty = is_not_empty;
  readonly is_number = is_number;
  readonly has_less_than_or_equal_to_four_digits = make_max_num_digits_validator(4);
  readonly has_less_than_or_equal_to_two_decimal_places = make_num_decimal_places_validator(2);
  readonly is_non_negative = is_non_negative;
  readonly string_to_num = string_to_num;

  @Watch('mutation_test_suite')
  on_mutation_test_suite_change(new_value: MutationTestSuite, old_value: MutationTestSuite) {
    this.d_mutation_test_suite = deep_copy(new_value, MutationTestSuite);
  }

  created() {
    this.d_mutation_test_suite = deep_copy(this.mutation_test_suite, MutationTestSuite);
    this.use_custom_max_points = this.d_mutation_test_suite.max_points !== null;
    this.sort_buggy_impl_names();
  }

  toggle_custom_max_points() {
    if (this.use_custom_max_points && this.d_mutation_test_suite!.max_points === null) {
      this.d_mutation_test_suite!.max_points = 0;
      return;
    }
    if (!this.use_custom_max_points) {
      this.d_mutation_test_suite!.max_points = null;
    }
  }

  sort_buggy_impl_names() {
    this.d_mutation_test_suite!.buggy_impl_names.sort(
      (buggy_name_a: string, buggy_name_b: string) =>
        buggy_name_a.localeCompare(buggy_name_b, undefined, {numeric: true}));
  }

  add_buggy_implementation_names() {
    let split_regex = /\s+/g;
    let replace_regex = /,+/g;
    let trimmed_input = this.buggy_impl_names.trim();
    if (trimmed_input.length === 0) {
        return;
    }
    let split_buggy_impl_names = trimmed_input.replace(replace_regex, " ").split(split_regex);
    split_buggy_impl_names = split_buggy_impl_names.filter((name: string) =>
          (this.d_mutation_test_suite!.buggy_impl_names.findIndex(
            (buggy_name: string) => buggy_name === name) === -1)
          && name.trim() !== ""
    );

    for (let buggy_name of split_buggy_impl_names) {
      this.d_mutation_test_suite!.buggy_impl_names.push(buggy_name);
    }
    this.buggy_impl_names = "";
    this.sort_buggy_impl_names();
  }

  remove_buggy_implementation_name(index: number) {
    this.d_mutation_test_suite!.buggy_impl_names.splice(index, 1);
  }

  @handle_api_errors_async(handle_save_mutation_suite_settings_error)
  async save_buggy_implementations_settings() {
    try {
      this.d_saving = true;
      await this.d_mutation_test_suite!.save();
    }
    finally {
      this.d_saving = false;
    }
  }
}

function handle_save_mutation_suite_settings_error(component: BuggyImplementations,
                                                   error: unknown) {
    (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}


</script>


<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';

.input-container {
  margin: 10px 0;
}

.buggy-implementation-row {
  padding: 5px 6px 5px 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

#buggy-implementation-names {
  display: inline-block;
  margin-top: 10px;
  border: 2px solid $white-gray;
}

.remove-buggy-impl-name-container {
  cursor: pointer;
}

.buggy-name {
  color: lighten(black, 40);
  padding-right: 30px;
}

.remove-buggy-impl-name {
  color: hsl(220, 20%, 85%);
}

.remove-buggy-impl-name:hover {
  color: hsl(220, 20%, 55%);
}

.odd-index {
  background-color: hsl(210, 20%, 96%);
}

.bottom-of-form {
  padding: 20px 0;
}

</style>
