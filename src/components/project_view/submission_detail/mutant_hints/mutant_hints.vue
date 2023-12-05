<template>
  <div v-if="d_has_hints" class="mutant-hints">
    <fieldset class="fieldset">
      <legend class="legend">Hints</legend>

      <!-- <div>{{ d_hint_limits }}</div> -->
      <!-- <div>{{ d_hints_remaining }}</div> -->
      <!-- <div>{{ d_unlocked_hints }}</div> -->

      <div
        class="unlocked-hint-wrapper"
        v-for="hint of d_unlocked_hints"
        :key="hint.pk"
      >
        <unlocked-hint
          :hint="hint"
          @hint_updated="on_hint_updated"
        ></unlocked-hint>
      </div>

      <div v-if="d_hint_limits !== null && d_unlocked_hints.length !== 0" class="hint-limits">
        <div>
          <span class="num-hints-unlocked">{{
            d_hint_limits.num_hints_unlocked.today
          }}</span><span v-if="d_hint_limits.num_hints_allowed.today !== null">/{{
            d_hint_limits.num_hints_allowed.today
          }}</span>
          hint(s) unlocked today.
        </div>

        <div>
          <span class="num-hints-unlocked">{{
            d_hint_limits.num_hints_unlocked.submission
          }}</span><span v-if="d_hint_limits.num_hints_allowed.submission !== null">/{{
            d_hint_limits.num_hints_allowed.submission
          }}</span>
          hint(s) unlocked on this submission.
        </div>
      </div>

      <div
        v-if="d_hints_remaining !== null && d_hints_remaining.num_hints_remaining !== 0"
        class="request-hint-wrapper"
      >
        Not sure what else to test?<br>
        <span class="num-hints-remaining">{{ d_hints_remaining.num_hints_remaining }}</span>
        more hint(s) remain for bug
        "{{ d_hints_remaining.mutant_name }}"
        <div class="request-hint-button-wrapper">
          <button @click="request_hint" class="blue-button request-hint-button">
            Request a hint
          </button>
        </div>
      </div>
      <div
        v-if="d_hints_remaining !== null && d_hints_remaining.num_hints_remaining === 0"
        class="request-hint-wrapper all-hints-unlocked-msg"
      >
        All hints unlocked for bug "{{ d_hints_remaining.mutant_name }}".
      </div>
      <!-- <div v-else>
        You've unlocked all the available hints for
      </div> -->
    </fieldset>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
    FeedbackCategory,
    HttpClient,
    HttpError,
    MutationTestSuiteResultFeedback,
    Submission
} from 'ag-client-typescript';

import { handle_global_errors_async } from '@/error_handling';

import UnlockedHint from './unlocked_hint.vue';

// FIXME: De-duplicate (also in submission_list.vue)
interface UnlockedHintData {
  pk: number;
  mutation_test_suite_result: number;
  mutation_test_suite_hint_config: number;
  mutant_name: string;
  hint_number: number;
  hint_text: string;
  hint_rating: number | null;
  user_comment: string;
}

interface HintLimits {
  num_hints_unlocked: {
    today: number,
    submission: number,
  };
  num_hints_allowed: {
    today: number,
    submission: number,
  };
}

interface HintsRemaining {
  num_hints_remaining: number;
  mutant_name: string;
}

@Component({
  components: {
    UnlockedHint
  }
})
export default class MutationSuiteResult extends Vue {
  @Prop({required: true, type: Object})
  mutation_test_suite_result!: MutationTestSuiteResultFeedback;

  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: String})
  fdbk_category!: FeedbackCategory;

  @Watch('mutation_test_suite_result')
  on_mutation_test_suite_results_change(new_value: MutationTestSuiteResultFeedback,
                                        old_value: MutationTestSuiteResultFeedback) {
    return this.load_hint_info();
  }

  d_has_hints: boolean | null = null;

  d_hints_remaining: HintsRemaining | null = null;
  d_unlocked_hints: UnlockedHintData[] = [];
  d_hint_limits: HintLimits | null = null;

  async created() {
    await this.load_hint_info();
  }

  @handle_global_errors_async
  async load_hint_info() {
    try {
      let limits_response = await HttpClient.get_instance().get<HintLimits>(
        `/mutation_test_suite_results/${this.mutation_test_suite_result.pk}/mutant_hint_limits/`
      );
      this.d_hint_limits = limits_response.data;

      let hints_available_response = await HttpClient.get_instance().get<HintsRemaining>(
        `/mutation_test_suite_results/${this.mutation_test_suite_result.pk}/num_hints_remaining/`
      );
      this.d_hints_remaining = hints_available_response.data;

      let unlocked_hints_response = await HttpClient.get_instance().get<UnlockedHintData[]>(
        `/mutation_test_suite_results/${this.mutation_test_suite_result.pk}/hints/`
      );
      this.d_unlocked_hints = unlocked_hints_response.data;

      this.d_has_hints = true;
    }
    catch (e) {
      if ((e instanceof HttpError) && e.status === 404) {
        this.d_has_hints = false;
      }
      else {
        // istanbul ignore next
        throw e;
      }
    }
  }

  async request_hint() {
    let response = await HttpClient.get_instance().post<UnlockedHintData>(
      `/mutation_test_suite_results/${this.mutation_test_suite_result.pk}/hints/`
    );
    this.d_unlocked_hints?.push(response.data);
  }

  on_hint_updated(data: {pk: number, hint_rating: number, user_comment: string}) {
    let hint = this.d_unlocked_hints.find(item => item.pk === data.pk);
    if (hint !== undefined) {
      hint.hint_rating = data.hint_rating;
      hint.user_comment = data.user_comment;
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/button_styles.scss';

.fieldset {
    margin-top: 5px;
    border-width: 1px;
    border-color: $light-blue;
    border-bottom: none;
    border-left: none;
    border-right: none;
    min-width: 0;
    padding-right: 0;
    padding-bottom: 5px;
}

.legend {
    font-weight: bold;
    font-size: 18px;
    color: black;
}

.unlocked-hint-wrapper {
  margin-bottom: .5rem;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.hint-limits {
  padding-bottom: .5rem;
  font-size: .875rem;
}

.request-hint-wrapper {
  padding: .25rem 0;
}

.request-hint-button-wrapper {
  padding-top: .125rem;
}

.request-hint-button {
  padding: .25rem .5rem;
  font-size: .875rem;
}

.num-hints-unlocked, .num-hints-remaining {
  color: darken($green, 5%);
  font-weight: bold;
}

.all-hints-unlocked-msg {
  font-size: .9em;
}

</style>
