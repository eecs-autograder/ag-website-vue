<template>
  <div id="buggy-implementations-component"
       v-if="d_mutation_test_suite !== null">

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
                         :from_string_fn="string_to_num"
                         @input="$emit('input', d_mutation_test_suite)">
        </validated-input>
      </div>

      <div class="toggle-container">
        <toggle v-model="use_custom_max_points"
                @input="toggle_custom_max_points"
                ref="use_custom_max_points"
                id="use-custom-max-points">
          <div slot="on">
            Custom max points
          </div>
          <div slot="off">
            Auto max points
          </div>
        </toggle>
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
                         :from_string_fn="string_to_num"
                         input_style="max-width: 500px; width: 100%"
                         @input="$emit('input', d_mutation_test_suite)">
        </validated-input>
      </div>

      <div class="input-container">
        <label class="text-label"> Max num student tests </label>
        <validated-input ref="max_num_student_tests"
                         id="max-num-student-tests"
                         v-model="d_mutation_test_suite.max_num_student_tests"
                         :validators="[
                           is_not_empty,
                           is_integer,
                           is_non_negative
                         ]"
                         :from_string_fn="string_to_num"
                         input_style="max-width: 500px; width: 100%"
                         @input="$emit('input', d_mutation_test_suite)">
        </validated-input>
      </div>

      <div class="input-container">
        <label class="text-label"> Buggy Implementation Names </label>
        <div class="buggy-implementation-names-input-container">
          <textarea ref="buggy_implementation_names"
                    id="buggy-implementation-names-input"
                    @keyup="handle_keyup_event($event)"
                    v-model="buggy_impl_names">
          </textarea>
          <button id="add-buggy-impl-names-button"
                  @click="add_buggy_implementation_names">
            Add Names
          </button>

        </div>
      </div>

      <div id="all-buggy-implementation-names"
           v-if="d_mutation_test_suite.buggy_impl_names.length !== 0">
        <div v-for="(buggy_name, index) of d_mutation_test_suite.buggy_impl_names"
             :class="['buggy-implementation-row',
                     {'odd-buggy-implementation-row': index % 2 !== 0}]">
          <span class="buggy-implementation-name">{{buggy_name}}</span>
          <div class="remove-buggy-impl-name-container"
               @click="remove_buggy_implementation_name(index)"
               :title="`Remove ${buggy_name}`">
            <i class="fas fa-times remove-buggy-impl-name-icon"></i>
          </div>
        </div>
      </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
    MutationTestSuite
} from 'ag-client-typescript';

import APIErrors from "@/components/api_errors.vue";
import Toggle from "@/components/toggle.vue";
import ValidatedInput, { ValidatorResponse } from '@/components/validated_input.vue';
import { deep_copy, format_datetime } from "@/utils";
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
    Toggle,
    ValidatedInput
  }
})
export default class BuggyImplementations extends Vue {
  @Prop({required: true, type: MutationTestSuite})
  value!: MutationTestSuite;

  readonly is_integer = is_integer;
  readonly is_not_empty = is_not_empty;
  readonly is_number = is_number;
  readonly has_less_than_or_equal_to_four_digits = make_max_num_digits_validator(4);
  readonly has_less_than_or_equal_to_two_decimal_places = make_num_decimal_places_validator(2);
  readonly is_non_negative = is_non_negative;
  readonly string_to_num = string_to_num;
  readonly format_datetime = format_datetime;

  buggy_impl_names = "";
  d_mutation_test_suite: MutationTestSuite | null = null;
  d_mutation_test_suite_settings_form_is_valid = true;
  d_saving = false;
  use_custom_max_points = false;

  @Watch('value')
  on_value_changed(new_value: MutationTestSuite, old_value: MutationTestSuite) {
    this.d_mutation_test_suite = deep_copy(new_value, MutationTestSuite);
  }

  created() {
    this.d_mutation_test_suite = deep_copy(this.value, MutationTestSuite);
    this.use_custom_max_points = this.d_mutation_test_suite!.max_points !== null;
    this.sort_buggy_impl_names();
  }

  toggle_custom_max_points() {
    if (this.use_custom_max_points) {
      this.d_mutation_test_suite!.max_points = 0;
    }
    else {
      this.d_mutation_test_suite!.max_points = null;
    }
    this.$emit('input', this.d_mutation_test_suite);
  }

  sort_buggy_impl_names() {
    this.d_mutation_test_suite!.buggy_impl_names.sort(
      (buggy_name_a: string, buggy_name_b: string) =>
        buggy_name_a.localeCompare(buggy_name_b, undefined, {numeric: true}));
  }

  handle_keyup_event(key: KeyboardEvent) {
      if (key.code === "Enter") {
          this.add_buggy_implementation_names();
      }
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
        (buggy_name: string) => buggy_name === name) === -1) && name.trim() !== ""
    );
    for (let buggy_name of split_buggy_impl_names) {
      this.d_mutation_test_suite!.buggy_impl_names.push(buggy_name);
    }
    this.buggy_impl_names = "";
    this.$emit('input', this.d_mutation_test_suite);
    this.sort_buggy_impl_names();
  }

  remove_buggy_implementation_name(index: number) {
    this.d_mutation_test_suite!.buggy_impl_names.splice(index, 1);
    this.$emit('input', this.d_mutation_test_suite);
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/forms.scss';

$periwinkle: hsl(220, 30%, 56%);

#buggy-implementations-component {
  padding: 6px 12px 14px 2px;
}

.input-container {
  margin: 5px 0 10px 0;
}

.toggle-container {
  font-size: 14px;
  margin: 13px 5px 3px 0;
  padding-bottom: 5px;
  min-width: 500px;
}

.buggy-implementation-names-input-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: flex-start;
}

#buggy-implementation-names-input {
  max-width: 500px;
  width: 100%;
  background-color: #fff;
  border-radius: .25rem;
  border: 1px solid #ced4da;
  box-sizing: border-box;
  color: #495057;
  font-size: 1rem;
  line-height: 1;
  padding: 5px;
  height: 38px;
}

#all-buggy-implementation-names {
  border: 1px solid lighten($periwinkle, 20);
  display: inline-block;
}

.buggy-implementation-row {
  padding: 5px 6px 5px 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;

  .remove-buggy-impl-name-container {
    cursor: pointer;
    padding: 0 5px;
  }

  .remove-buggy-impl-name-icon {
    color: darken($periwinkle, 20);
  }
}

.odd-buggy-implementation-row {
  background-color: lighten($periwinkle, 40);
}

.buggy-implementation-name {
  color: lighten(black, 40);
  padding-right: 30px;
  cursor: default;
}

#add-buggy-impl-names-button {
  @extend .periwinkle-button;
  margin-left: 10px;
  align-self: flex-start;
}

</style>
