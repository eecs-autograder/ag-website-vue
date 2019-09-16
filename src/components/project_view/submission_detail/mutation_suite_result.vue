<template>
  <div id="mutation-suite-result">
    <div v-if="mutation_test_suite_result.setup_return_code !== null
               || mutation_test_suite_result.setup_timed_out"
         id="setup-section">

      <div class="feedback-row">
        <div class="feedback-label"
             id="setup-command-name">
          {{mutation_test_suite_result.setup_command_name !== null
          ? mutation_test_suite_result.setup_command_name : 'Setup'}}:
        </div>

        <span id="setup-return-code-correctness">
          {{get_setup_return_code_correctness()}}
        </span>
      </div>

      <div v-if="mutation_test_suite_result.setup_return_code !== null"
           class="feedback-row"
           id="setup-return-code">
        <div class="feedback-label"> Setup Return Code: </div>
        <div class="feedback-output-content-short">
          {{mutation_test_suite_result.setup_return_code}}
        </div>
      </div>

      <div v-if="mutation_test_suite_result.fdbk_settings.show_setup_stdout"
           class="feedback-row"
           id="setup-stdout-section">
        <p class="feedback-label"> Setup Output: </p>

        <template v-if="!d_setup_stdout_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <div v-if="!d_setup_stdout_content"
               class="feedback-output-content-single-line"> No Output </div>
          <pre v-else
               class="feedback-output-content-lengthy">{{d_setup_stdout_content}}</pre>
        </template>

      </div>

      <div v-if="mutation_test_suite_result.fdbk_settings.show_setup_stderr"
           class="feedback-row"
           id="setup-stderr-section">
        <p class="feedback-label"> Setup Error Output: </p>

        <template v-if="!d_setup_stderr_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <div v-if="!d_setup_stderr_content"
               class="feedback-output-content-short"> No Output
          </div>
          <pre v-else
               class="feedback-output-content-lengthy">{{d_setup_stderr_content}}</pre>
        </template>

      </div>
    </div>

    <div id="bug-section">

      <div v-if="mutation_test_suite_result.num_bugs_exposed !== null"
           class="feedback-row"
           id="num-bugs-exposed-section">
        <div class="feedback-label"> Bugs exposed: </div>
        <div class="feedback-output-content-short">
          {{mutation_test_suite_result.num_bugs_exposed}}
        </div>
      </div>

      <div v-if="mutation_test_suite_result.fdbk_settings.bugs_exposed_fdbk_level
                 === BugsExposedFeedbackLevel.exposed_bug_names">
        <ul id="list-of-bug-names-exposed"
            class="fa-ul">
          <li class="list-item"
              v-for="bug_name of mutation_test_suite_result.bugs_exposed">
            <span class="fa-li"><i class="fas fa-bug bug-icon"></i></span>
            {{bug_name}}
          </li>
        </ul>
      </div>

      <div v-if="mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stdout"
           class="feedback-row"
           id="buggy-stdout-section">
        <div class="feedback-label"> Buggy Stdout: </div>
        <template v-if="!d_grade_buggy_stdout_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <div v-if="!d_grade_buggy_stdout_content"
               class="feedback-output-content-short"> No Output
          </div>
          <pre v-else
               class="feedback-output-content-lengthy">{{d_grade_buggy_stdout_content}}</pre>
        </template>
      </div>

      <div v-if="mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stderr"
           class="feedback-row"
           id="buggy-stderr-section">
        <div class="feedback-label"> Buggy Stderr: </div>

        <template v-if="!d_grade_buggy_stderr_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <div v-if="!d_grade_buggy_stderr_content"
               class="feedback-output-content-short"> No Output
          </div>
          <pre v-else
               class="feedback-output-content-lengthy">{{d_grade_buggy_stderr_content}}</pre>
        </template>

      </div>
    </div>

    <div v-if="mutation_test_suite_result.student_tests.length"
         id="student-tests-section">
      <div>
        <div v-if="mutation_test_suite_result.fdbk_settings.show_validity_check_stdout"
             class="feedback-row"
             id="validity-check-stdout-section">
          <div class="feedback-label"> Validity Check Stdout: </div>

          <template v-if="!d_validity_checkout_stdout_loaded">
            <i class="fa fa-spinner fa-pulse fa-fw"></i>
          </template>
          <template v-else>
            <div v-if="!d_validity_checkout_stdout_content"
               class="feedback-output-content-short"> No Output
            </div>
            <pre v-else
                 class="feedback-output-content-lengthy">{{d_validity_checkout_stdout_content}}
            </pre>
          </template>

        </div>

        <div v-if="mutation_test_suite_result.fdbk_settings.show_validity_check_stderr"
             class="feedback-row"
             id="validity-check-stderr-section">
          <div class="feedback-label"> Validity Check Stderr: </div>

          <template v-if="!d_validity_checkout_stderr_loaded">
            <i class="fa fa-spinner fa-pulse fa-fw"></i>
          </template>
          <template v-else>
            <p v-if="!d_validity_checkout_stderr_content"
               class="feedback-output-content-short"> No Output
            </p>
            <pre v-else
                 class="feedback-output-content-lengthy">{{d_validity_checkout_stderr_content}}
            </pre>
          </template>

        </div>
      </div>

      <div v-if="mutation_test_suite_result.fdbk_settings.show_get_test_names_stdout"
           class="feedback-row"
           id="test-names-stdout-section">
        <div class="feedback-label"> Get test names stdout: </div>

        <template v-if="!d_test_names_stdout_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <div v-if="!d_test_names_stdout_content"
               class="feedback-output-content-short"> No Output
          </div>
          <pre v-else
               class="feedback-output-content-lengthy">{{d_test_names_stdout_content}}</pre>
        </template>

      </div>

      <div v-if="mutation_test_suite_result.fdbk_settings.show_get_test_names_stderr"
           class="feedback-row"
           id="test-names-stderr-section">
        <div class="feedback-label"> Get test names stderr: </div>

        <template v-if="!d_test_names_stderr_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <div v-if="!d_test_names_stderr_content"
             class="feedback-output-content-short"> No Output
          </div>
          <pre v-else
               class="feedback-output-content-lengthy">{{d_test_names_stderr_content}}</pre>
        </template>
      </div>

      <div v-if="mutation_test_suite_result.discarded_tests.length"
           id="discarded-tests-section">
        <div id="discarded-explanation">
          This suite accepts up to
          <span id="num-tests-accepted">
            {{mutation_test_suite_result.student_tests.length}}
          </span>
          tests, but you submitted
          <span id="total-tests-submitted">
            {{mutation_test_suite_result.student_tests.length
              + mutation_test_suite_result.discarded_tests.length}}
          </span>.
        </div>
        <div class="feedback-label list-label"> These tests were discarded: </div>
        <ul id="list-of-discarded-tests" class="fa-ul">
          <li class="list-item"
              v-for="discarded_test_name of mutation_test_suite_result.discarded_tests">
            <span class="fa-li"><i class="fas fa-square discarded-test-icon"></i></span>
            {{discarded_test_name}}
          </li>
        </ul>
      </div>

      <div v-if="mutation_test_suite_result.invalid_tests !== null &&
                 mutation_test_suite_result.invalid_tests.length"
           id="invalid-tests-section">
        <div class="list-label feedback-label">
          These tests incorrectly reported a bug when run against a correct implementation:
        </div>
        <ul id="list-of-incorrectly-reported-bug-tests"
            class="fa-ul">
          <li class="list-item invalid-test"
              v-for="invalid_test of mutation_test_suite_result.invalid_tests">
            <span class="fa-li">
              <i class="fas fa-exclamation-triangle incorrectly-reported-bug-icon"></i>
            </span>
            {{invalid_test}}
            <i v-if="test_timed_out(invalid_test)"
               class="test-timed-out"> (Timed Out) </i>
          </li>
        </ul>
      </div>

      <div v-if="get_valid_tests().length"
           class="feedback-row"
           id="valid-tests-section">
        <div class="feedback-label"> Valid test cases you submitted: </div>
        <ul id="list-of-valid-tests"
            class="fa-ul">
          <li class="list-item"
              v-for="valid_test of get_valid_tests()">
            <span class="fa-li">
              <i class="fas fa-check-circle valid-test-icon"></i>
            </span>{{valid_test}}
          </li>
        </ul>
      </div>

    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
    BugsExposedFeedbackLevel,
    FeedbackCategory,
    MutationTestSuiteResultFeedback,
    ResultOutput,
    Submission
} from 'ag-client-typescript';

import CorrectnessIcon, { CorrectnessLevel } from "@/components/project_view/submission_detail/correctness_icon.vue";
import { deep_copy } from "@/utils";

@Component({
  components: {
    CorrectnessIcon
  }
})
export default class MutationSuiteResult extends Vue {
  @Prop({required: true, type: Object})
  mutation_test_suite_result!: MutationTestSuiteResultFeedback;

  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: String})
  fdbk_category!: FeedbackCategory;

  @Watch('submission')
  async on_submission_change(new_value: Submission, old_value: Submission) {
      this.d_submission = deep_copy(new_value, Submission);
      await this.get_results();
  }

  @Watch('mutation_test_suite_result')
  async on_mutation_test_suite_results_change(new_value: MutationTestSuiteResultFeedback,
                                              old_value: MutationTestSuiteResultFeedback) {
    this.d_mutation_test_suite_result = JSON.parse(JSON.stringify(new_value));
    await this.get_results();
  }

  @Watch('fdbk_category')
  async on_fdbk_category_change(new_value: FeedbackCategory, old_value: FeedbackCategory) {
      this.d_fdbk_category = new_value;
      await this.get_results();
  }

  readonly CorrectnessLevel = CorrectnessLevel;
  readonly BugsExposedFeedbackLevel = BugsExposedFeedbackLevel;

  d_setup_stdout_content: string | null = null;
  d_setup_stderr_content: string | null = null;
  d_test_names_stdout_content: string | null = null;
  d_test_names_stderr_content: string | null = null;
  d_validity_checkout_stdout_content: string | null = null;
  d_validity_checkout_stderr_content: string | null = null;
  d_grade_buggy_stdout_content: string | null = null;
  d_grade_buggy_stderr_content: string | null = null;

  d_submission: Submission | null = null;
  d_fdbk_category: FeedbackCategory = FeedbackCategory.past_limit_submission;
  d_mutation_test_suite_result: MutationTestSuiteResultFeedback | null = null;

  d_setup_stdout_loaded = false;
  d_setup_stderr_loaded = false;
  d_test_names_stdout_loaded = false;
  d_test_names_stderr_loaded = false;
  d_validity_checkout_stdout_loaded = false;
  d_validity_checkout_stderr_loaded = false;
  d_grade_buggy_stdout_loaded = false;
  d_grade_buggy_stderr_loaded = false;

  async created() {
    this.d_fdbk_category = this.fdbk_category;
    this.d_submission = this.submission;
    this.d_mutation_test_suite_result = this.mutation_test_suite_result;
    await this.get_results();
  }

  async get_results() {
    await this.load_setup_stdout_content();
    await this.load_setup_stderr_content();
    await this.load_test_names_stdout_content();
    await this.load_test_names_stderr_content();
    await this.load_validity_check_stdout_content();
    await this.load_validity_check_stderr_content();
    await this.load_grade_buggy_stdout_content();
    await this.load_grade_buggy_stderr_content();
  }

  async load_setup_stdout_content() {
    this.d_setup_stdout_loaded = false;
    this.d_setup_stdout_content = await ResultOutput.get_mutation_test_suite_result_setup_stdout(
      this.submission.pk,
      this.mutation_test_suite_result.pk,
      this.d_fdbk_category
    );
    this.d_setup_stdout_loaded = true;
  }

  async load_setup_stderr_content() {
    this.d_setup_stderr_loaded = false;
    this.d_setup_stderr_content = await ResultOutput.get_mutation_test_suite_result_setup_stderr(
      this.submission.pk,
      this.mutation_test_suite_result.pk,
      this.d_fdbk_category
    );
    this.d_setup_stderr_loaded = true;
  }

  async load_test_names_stdout_content() {
    this.d_test_names_stdout_content
        = await ResultOutput.get_mutation_test_suite_result_get_student_test_names_stdout(
      this.submission.pk,
      this.mutation_test_suite_result.pk,
      this.d_fdbk_category
    );
    this.d_test_names_stdout_loaded = true;
  }

  async load_test_names_stderr_content() {
    this.d_test_names_stderr_content
        = await ResultOutput.get_mutation_test_suite_result_get_student_test_names_stderr(
      this.submission.pk,
      this.mutation_test_suite_result.pk,
      this.d_fdbk_category
    );
    this.d_test_names_stderr_loaded = true;
  }

  async load_validity_check_stdout_content() {
    this.d_validity_checkout_stdout_loaded = false;
    this.d_validity_checkout_stdout_content
        = await ResultOutput.get_mutation_test_suite_result_validity_check_stdout(
      this.submission.pk,
      this.mutation_test_suite_result.pk,
      this.d_fdbk_category
    );
    this.d_validity_checkout_stdout_loaded = true;
  }

  async load_validity_check_stderr_content() {
    this.d_validity_checkout_stderr_loaded = false;
    this.d_validity_checkout_stderr_content
        = await ResultOutput.get_mutation_test_suite_result_validity_check_stderr(
      this.submission.pk,
      this.mutation_test_suite_result.pk,
      this.d_fdbk_category
    );
    this.d_validity_checkout_stderr_loaded = true;
  }

  async load_grade_buggy_stdout_content() {
    this.d_grade_buggy_stdout_loaded = false;
    this.d_grade_buggy_stdout_content
        = await ResultOutput.get_mutation_test_suite_result_grade_buggy_impls_stdout(
      this.submission.pk,
      this.mutation_test_suite_result.pk,
      this.d_fdbk_category
    );
    this.d_grade_buggy_stdout_loaded = true;
  }

  async load_grade_buggy_stderr_content() {
    this.d_grade_buggy_stderr_loaded = false;
    this.d_grade_buggy_stderr_content
        = await ResultOutput.get_mutation_test_suite_result_grade_buggy_impls_stderr(
      this.submission.pk,
      this.mutation_test_suite_result.pk,
      this.d_fdbk_category
    );
    this.d_grade_buggy_stderr_loaded = true;
  }

  test_timed_out(test: string): boolean {
    if (this.mutation_test_suite_result.timed_out_tests === null) {
        return false;
    }
    return this.mutation_test_suite_result!.timed_out_tests!.findIndex(
        (item) => item === test
    ) !== -1;
  }

  get_valid_tests(): string[] {
    if (this.mutation_test_suite_result.invalid_tests === null) {
        return this.mutation_test_suite_result.student_tests;
    }
    let valid_tests = this.mutation_test_suite_result.student_tests.filter(
      (student_test) => this.mutation_test_suite_result!.invalid_tests!.findIndex(
          (invalid_test) => invalid_test === student_test)
      === -1);
    return valid_tests;
  }

  get_setup_return_code_correctness(): string {
    if (this.mutation_test_suite_result.setup_timed_out !== null
        && this.mutation_test_suite_result.setup_timed_out) {
        return "Timed Out";
    }
    else if (this.mutation_test_suite_result.setup_return_code === 0) {
        return "Correct";
    }
    return "Incorrect";
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/components/submission_detail.scss';

#list-of-bug-names-exposed,
#list-of-incorrectly-reported-bug-tests,
#list-of-valid-tests,
#list-of-discarded-tests {
  margin-top: 0;
  margin-bottom: 0;
  padding-top: 5px;
  padding-bottom: 5px;
  font-size: 14px;
}

#list-of-bug-names-exposed li,
#list-of-incorrectly-reported-bug-tests li,
#list-of-valid-tests li,
#list-of-discarded-tests li {
  margin-bottom: 2px;
}

.bug-icon {
  color: $stormy-gray-light;
  font-size: 13px;
}

.incorrectly-reported-bug-icon{
  color: $warning-red;
  font-size: 13px;
}

.discarded-test-icon {
  color: $orange;
  font-size: 13px;
}

.valid-test-icon {
  color: $ocean-blue;
  font-size: 13px;
}

#setup-return-code-icon {
  display: inline-block;
  color: $green;
}
</style>
