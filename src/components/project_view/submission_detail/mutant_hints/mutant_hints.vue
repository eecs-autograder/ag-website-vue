<template>
  <div v-if="d_has_hints" class="mutant-hints">
    <fieldset class="fieldset">
      <legend class="legend">Hints</legend>

      <div
        class="unlocked-hint-wrapper"
        v-for="hint of d_unlocked_hints"
        :key="hint.pk"
      >
        <unlocked-hint :hint="hint" ref="unlocked_hint" tabindex="-1"></unlocked-hint>
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
        more hint(s) remain for
        {{ display_mutant_name(d_hints_remaining) }}
        <div class="request-hint-button-wrapper">
          <button
            @click="request_hint" class="blue-button request-hint-button"
            :disabled="d_requesting_new_hint || reached_daily_hint_limit"
          >
            Request a hint
          </button>
        </div>
      </div>
      <div
        v-if="d_hints_remaining !== null && d_hints_remaining.num_hints_remaining === 0"
        class="request-hint-wrapper all-hints-unlocked-msg"
      >
        All hints unlocked for {{ display_mutant_name(d_hints_remaining) }}.
      </div>
    </fieldset>

    <modal ref="unrated_hints_modal"
           v-if="d_show_unrated_hints_modal"
           @close="d_show_unrated_hints_modal = false"
           :click_outside_to_close="true"
           size="large"
           :include_closing_x="true">
      <div class="modal-header" style="font-size: 1.5rem; font-weight: bold;">
        We value your feedback
      </div>

      <div style="margin: .5rem 0;">
        <template v-if="has_unrated_hints">
          Please take a moment to tell us about the hint(s) you've received
        </template>
        <template>
          Thank you! Please request your hint by clicking the button below.
        </template>
      </div>

      <div
        class="unlocked-hint-wrapper"
        v-for="hint of unrated_hints"
        :key="hint.pk"
      >
        <unlocked-hint :hint="hint"></unlocked-hint>
      </div>

      <div class="modal-button-footer">
        <label class="checkbox-label" v-if="has_unrated_hints">
          <input type="checkbox" class="checkbox" v-model="d_decline_to_give_feedback"/>
          I decline to give feedback, <br> please give me a hint anyway
        </label>
        <button type="button"
                data-testid="submit_button"
                :class="has_unrated_hints ? 'orange-button' : 'blue-button'"
                style="margin-left: auto;"
                @click="request_hint"
                :disabled="!d_decline_to_give_feedback && has_unrated_hints">
          Request Hint
        </button>
      </div>
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';

import {
    FeedbackCategory,
    HttpClient,
    HttpError,
    MutationTestSuiteResultFeedback,
    Submission
} from 'ag-client-typescript';

import { handle_global_errors_async } from '@/error_handling';

import UnlockedHint from './unlocked_hint.vue';
import {
  HintRatingData,
  MutantHintObserver,
  MutantHintService,
  UnlockedHintData,
  display_mutant_name
} from './mutant_hint_service';
import { toggle } from '@/utils';
import { BeforeDestroy, Created } from '@/lifecycle';
import Modal from '@/components/modal.vue';
import { UnratedMutantHintData } from '@/components/submission_list/submission_list.vue';

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
  true_mutant_name?: string;
}

@Component({
  components: {
    Modal,
    UnlockedHint,
  }
})
export default class MutantHints extends Vue implements MutantHintObserver,
                                                        Created, BeforeDestroy {
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

  d_requesting_new_hint: boolean = false;

  @Inject({from: 'unrated_mutant_hint_data'})
  unrated_mutant_hint_data!: UnratedMutantHintData;

  readonly display_mutant_name = display_mutant_name;

  get unrated_hints() {
    return this.unrated_mutant_hint_data.unrated_hints
  }

  d_show_unrated_hints_modal: boolean = false;
  d_decline_to_give_feedback: boolean = false;

  async created() {
    await this.load_hint_info();
    MutantHintService.subscribe(this);
  }

  beforeDestroy() {
    MutantHintService.unsubscribe(this);
  }

  @handle_global_errors_async
  async load_hint_info() {
    try {
      await this.load_hint_limits();

      let unlocked_hints_response = await HttpClient.get_instance().get<UnlockedHintData[]>(
        `/mutation_test_suite_results/${this.mutation_test_suite_result.pk}/hints/`
      );
      this.d_unlocked_hints = unlocked_hints_response.data;
      this.d_unlocked_hints.sort((a, b) => a.pk - b.pk);

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

  @handle_global_errors_async
  async load_hint_limits() {
    try {
      let limits_response = await HttpClient.get_instance().get<HintLimits>(
        `/mutation_test_suite_results/${this.mutation_test_suite_result.pk}/mutant_hint_limits/`
      );
      this.d_hint_limits = limits_response.data;

      let hints_available_response = await HttpClient.get_instance().get<HintsRemaining>(
        `/mutation_test_suite_results/${this.mutation_test_suite_result.pk}/num_hints_remaining/`
      );
      if (hints_available_response.status === 204) {
        this.d_hints_remaining = null;
      }
      else {
        this.d_hints_remaining = hints_available_response.data;
      }
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

  get has_unrated_hints() {
    return this.unrated_hints.length !== 0;
  }

  @handle_global_errors_async
  async request_hint() {
    return toggle(this, 'd_requesting_new_hint', async () => {
      if (this.has_unrated_hints && !this.d_show_unrated_hints_modal) {
        this.d_show_unrated_hints_modal = true;
      }
      else {
        try {
          await MutantHintService.request_new_hint(this.mutation_test_suite_result.pk);
        }
        finally {
          this.d_show_unrated_hints_modal = false;
        }
      }
    });
  }

  get reached_daily_hint_limit() {
    if (this.d_hint_limits?.num_hints_allowed.submission === null
          && this.d_hint_limits.num_hints_allowed.today === null) {
      return false;
    }

    if (this.d_hint_limits?.num_hints_allowed.submission !== null
          && this.d_hint_limits?.num_hints_allowed.submission
                === this.d_hint_limits?.num_hints_unlocked.submission) {
      return true;
    }

    if (this.d_hint_limits?.num_hints_allowed.today !== null
          && this.d_hint_limits?.num_hints_allowed.today
                === this.d_hint_limits?.num_hints_unlocked.today) {
      return true;
    }

    return false;
  }

  update_hint_unlocked(hint: UnlockedHintData): void {
    if (hint.mutation_test_suite_result === this.mutation_test_suite_result.pk) {
      this.d_unlocked_hints.push(hint);
    }

    Vue.nextTick(() => {
      let component = (<Vue[]> this.$refs.unlocked_hint)[this.d_unlocked_hints.length - 1];
      (<HTMLElement> component.$el).focus();
    });

    this.load_hint_limits();
  }

  update_hint_rated(hint_pk: number, data: HintRatingData): void {
    let index = this.d_unlocked_hints.findIndex(item => item.pk === hint_pk);
    if (index !== -1) {
      this.d_unlocked_hints[index].hint_rating = data.hint_rating;
      this.d_unlocked_hints[index].user_comment = data.user_comment;
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
