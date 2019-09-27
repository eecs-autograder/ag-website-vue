<template>
  <div id="mutation-suite-result">
    <fieldset v-if="show_setup_fieldset"
              class="fieldset">
      <legend class="legend"> Setup Command </legend>

      <div v-if="d_mutation_test_suite_result.setup_return_code !== null
                 || d_mutation_test_suite_result.setup_timed_out"
           id="setup-section">
        <div class="feedback-row">
          <div class="feedback-label"
               id="setup-command-name">
            {{d_mutation_test_suite_result.setup_command_name !== null
            ? d_mutation_test_suite_result.setup_command_name : 'Setup'}}:
          </div>
          <span id="setup-return-code-correctness-icon">
            <span v-if="setup_return_code_correctness === ReturnCodeCorrectness.correct">
              <i class="fas fa-check-circle correct-icon"></i>
            </span>
            <span v-else-if="setup_return_code_correctness === ReturnCodeCorrectness.incorrect">
              <i class="fas fa-times-circle incorrect-icon"></i>
            </span>
            <span v-else-if="setup_return_code_correctness === ReturnCodeCorrectness.timed_out">
              <span> Timed Out </span>
              <i class="fas fa-clock timed-out-icon"></i>
            </span>
          </span>
        </div>

        <div v-if="d_mutation_test_suite_result.setup_return_code !== null"
             id="setup-return-code"
             class="feedback-row">
          <div class="feedback-label"> Return code: </div>
          <div class="feedback">
            <div class="short-output">
              {{d_mutation_test_suite_result.setup_return_code}}
            </div>
          </div>
        </div>

        <div v-if="d_mutation_test_suite_result.fdbk_settings.show_setup_stdout"
             id="setup-stdout-section"
             class="feedback-row">
          <div class="feedback-label"> Stdout: </div>

          <div class="feedback">
            <template v-if="!d_setup_stdout_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_setup_stdout_content"
                   class="short-output"> No Output </div>
              <pre v-else
                   class="lengthy-output">{{d_setup_stdout_content}}</pre>
            </template>
          </div>
        </div>

        <div v-if="d_mutation_test_suite_result.fdbk_settings.show_setup_stderr"
             id="setup-stderr-section"
             class="feedback-row">

          <div class="feedback-label"> Stderr: </div>

          <div class="feedback">
            <template v-if="!d_setup_stderr_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_setup_stderr_content"
                   class="short-output"> No Output
              </div>
              <pre v-else
                   class="lengthy-output">{{d_setup_stderr_content}}</pre>
            </template>
          </div>
        </div>
      </div>
    </fieldset>

    <div id="bug-section">
      <fieldset v-if="show_buggy_implementations_fieldset"
                class="fieldset">
        <legend class="legend"> Buggy Implementations </legend>

        <div v-if="d_mutation_test_suite_result.num_bugs_exposed !== null"
             id="num-bugs-exposed-section"
             class="feedback-row">

          <div class="feedback-label buggy-impl-feedback-label"> # of exposed bugs: </div>
          <div class="feedback buggy-impl-feedback">
            <div class="short-output">
              {{d_mutation_test_suite_result.num_bugs_exposed}}
            </div>
          </div>
        </div>

        <div v-if="d_mutation_test_suite_result.fdbk_settings.bugs_exposed_fdbk_level
                     === BugsExposedFeedbackLevel.exposed_bug_names
                     && d_mutation_test_suite_result.num_bugs_exposed > 1"
             class="feedback-row">

          <div class="feedback-label buggy-impl-feedback-label"> Bugs exposed: </div>
          <div class="feedback buggy-impl-feedback">
            <div id="list-of-bugs">
              <div v-for="bug_name of d_mutation_test_suite_result.bugs_exposed"
                   class="single-bug">
                    <span>
                      <i class="fas fa-bug bug-icon"></i>
                      {{bug_name}}
                    </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="d_mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stdout"
             id="buggy-stdout-section"
             class="feedback-row">
          <div class="feedback-label buggy-impl-feedback-label"> Stdout: </div>

          <div class="feedback buggy-impl-feedback">
            <template v-if="!d_grade_buggy_stdout_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_grade_buggy_stdout_content"
                   class="short-output"> No Output
              </div>
              <pre v-else
                   class="lengthy-output">{{d_grade_buggy_stdout_content}}</pre>
            </template>
          </div>

        </div>

        <div v-if="d_mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stderr"
             class="feedback-row"
             id="buggy-stderr-section">
          <div class="feedback-label buggy-impl-feedback-label"> Stderr: </div>

          <div class="feedback buggy-impl-feedback">
            <template v-if="!d_grade_buggy_stderr_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_grade_buggy_stderr_content"
                   class="short-output"> No Output
              </div>
              <pre v-else
                   class="lengthy-output">{{d_grade_buggy_stderr_content}}</pre>
            </template>
          </div>
        </div>
      </fieldset>

    </div>

    <fieldset v-if="d_mutation_test_suite_result.fdbk_settings.show_validity_check_stdout
                    || d_mutation_test_suite_result.fdbk_settings.show_validity_check_stderr"
              class="fieldset">
      <legend class="legend"> Validity Check </legend>
      <div id="student-tests-section">
        <div v-if="d_mutation_test_suite_result.fdbk_settings.show_validity_check_stdout"
             class="feedback-row"
             id="validity-check-stdout-section">
          <div class="feedback-label"> Stdout: </div>

          <div class="feedback">
            <template v-if="!d_validity_checkout_stdout_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_validity_checkout_stdout_content"
                 class="short-output"> No Output
              </div>
              <pre v-else
                   class="lengthy-output">{{d_validity_checkout_stdout_content}}
              </pre>
            </template>
          </div>
        </div>

        <div v-if="d_mutation_test_suite_result.fdbk_settings.show_validity_check_stderr"
             class="feedback-row"
             id="validity-check-stderr-section">
          <div class="feedback-label"> Stderr: </div>

          <div class="feedback">
            <template v-if="!d_validity_checkout_stderr_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <p v-if="!d_validity_checkout_stderr_content"
                 class="short-output"> No Output
              </p>
              <pre v-else
                   class="lengthy-output">{{d_validity_checkout_stderr_content}}
              </pre>
            </template>
          </div>
        </div>
      </div>
    </fieldset>

    <fieldset v-if="show_test_names_fieldset"
              class="fieldset">
      <legend class="legend"> Get Test Names </legend>
      <div v-if="d_mutation_test_suite_result.fdbk_settings.show_get_test_names_stdout"
           class="feedback-row"
           id="test-names-stdout-section">
        <div class="feedback-label test-names-feedback-label"> Stdout: </div>

        <div class="feedback test-names-feedback">
          <template v-if="!d_student_test_names_stdout_loaded">
            <div class="loading-output">
              <i class="fa fa-spinner fa-pulse fa-fw"></i>
            </div>
          </template>
          <template v-else>
            <div v-if="!d_student_test_names_stdout_content"
                 class="short-output"> No Output
            </div>
            <pre v-else
                 class="lengthy-output">{{d_student_test_names_stdout_content}}</pre>
          </template>
        </div>
      </div>

      <div v-if="d_mutation_test_suite_result.fdbk_settings.show_get_test_names_stderr"
           class="feedback-row"
           id="test-names-stderr-section">
        <div class="feedback-label test-names-feedback-label"> Stderr: </div>

        <div class="feedback test-names-feedback">
          <template v-if="!d_student_test_names_stderr_loaded">
            <div class="loading-output">
              <i class="fa fa-spinner fa-pulse fa-fw"></i>
            </div>
          </template>
          <template v-else>
            <div v-if="!d_student_test_names_stderr_content"
               class="short-output"> No Output
            </div>
            <pre v-else
                 class="lengthy-output">{{d_student_test_names_stderr_content}}</pre>
          </template>
        </div>
      </div>

      <div v-if="get_valid_tests().length"
           class="feedback-row"
           id="valid-tests-section">

        <div class="feedback-label test-names-feedback-label"> Valid test cases: </div>

        <div class="feedback test-names-feedback">
          <div id="list-of-valid-tests">
            <div v-for="valid_test of get_valid_tests()"
                 class="single-valid-test">
              <span>
                <i class="far fa-check-circle valid-test-icon"></i>
                {{valid_test}}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="d_mutation_test_suite_result.discarded_tests.length"
           id="discarded-tests-section"
           class="feedback-row">

        <div class="feedback-explanation">
          This suite accepts up to
          <span id="num-tests-accepted">
            {{d_mutation_test_suite_result.student_tests.length}}</span>
          tests, but you submitted
          <span id="total-tests-submitted">
            {{d_mutation_test_suite_result.student_tests.length
              + d_mutation_test_suite_result.discarded_tests.length}}</span>.
        </div>

        <div class="feedback-label test-names-feedback-label">
          Discarded test cases:
        </div>

        <div class="feedback test-names-feedback">
          <div id="list-of-discarded-tests">
            <div v-for="discarded_test_name of d_mutation_test_suite_result.discarded_tests"
                 class="single-valid-test">
              <span>
                <i class="far fa-trash-alt discarded-test-icon"></i>
                {{discarded_test_name}}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="d_mutation_test_suite_result.invalid_tests !== null &&
                 d_mutation_test_suite_result.invalid_tests.length"
           id="invalid-tests-section"
           class="feedback-row">

        <div class="feedback-explanation">
          Invalid tests time out or incorrectly report a bug when run against a
          correct implementation.
        </div>

        <div class="feedback-label test-names-feedback-label">
          Invalid test cases:
        </div>
        <div class="feedback test-names-feedback">
          <div id="list-of-invalid-tests">
            <div v-for="invalid_test of d_mutation_test_suite_result.invalid_tests"
                 class="single-invalid-test">
              <span>
                <i class="fas fa-exclamation-triangle invalid-test-icon"></i>
                {{invalid_test}}
              </span>

              <span v-if="test_timed_out(invalid_test)"
                    class="test-timed-out">
                (Timed Out)
                <i class="far fa-clock timed-out-icon"></i>
              </span>
            </div>
          </div>
        </div>
      </div>

    </fieldset>
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
import { ReturnCodeCorrectness } from '@/components/project_view/submission_detail/return_code_correctness';
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
  readonly ReturnCodeCorrectness = ReturnCodeCorrectness;

  d_setup_stdout_content: string | null = null;
  d_setup_stderr_content: string | null = null;
  d_student_test_names_stdout_content: string | null = null;
  d_student_test_names_stderr_content: string | null = null;
  d_validity_checkout_stdout_content: string | null = null;
  d_validity_checkout_stderr_content: string | null = null;
  d_grade_buggy_stdout_content: string | null = null;
  d_grade_buggy_stderr_content: string | null = null;

  d_submission: Submission | null = null;
  d_fdbk_category: FeedbackCategory = FeedbackCategory.past_limit_submission;
  d_mutation_test_suite_result: MutationTestSuiteResultFeedback | null = null;

  d_setup_stdout_loaded = false;
  d_setup_stderr_loaded = false;
  d_student_test_names_stdout_loaded = false;
  d_student_test_names_stderr_loaded = false;
  d_validity_checkout_stdout_loaded = false;
  d_validity_checkout_stderr_loaded = false;
  d_grade_buggy_stdout_loaded = false;
  d_grade_buggy_stderr_loaded = false;
  d_mutation_test_suite_result_output_size: ResultOutput.MutationTestSuiteResultOutputSize
                                            | null = null;

  async created() {
    this.d_fdbk_category = this.fdbk_category;
    this.d_submission = this.submission;
    this.d_mutation_test_suite_result = this.mutation_test_suite_result;
    await this.get_results();
  }

  get show_setup_fieldset() {
    return this.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stdout
           || this.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stderr
           || this.d_mutation_test_suite_result!.setup_return_code !== null
           || this.d_mutation_test_suite_result!.setup_timed_out;
  }

  get show_test_names_fieldset() {
    return this.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stdout
           || this.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stderr
           || this.d_mutation_test_suite_result!.discarded_tests.length
           || (this.d_mutation_test_suite_result!.invalid_tests !== null
               && this.d_mutation_test_suite_result!.invalid_tests!.length)
           || this.get_valid_tests().length;
  }

  get show_buggy_implementations_fieldset() {
    return this.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stdout
           || this.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stderr
           || this.d_mutation_test_suite_result!.num_bugs_exposed !== null;
  }


  async get_results() {
    this.d_mutation_test_suite_result_output_size
        = await ResultOutput.get_mutation_test_suite_result_output_size(
      this.d_submission!.pk,
      this.d_mutation_test_suite_result!.pk,
      this.d_fdbk_category
    );
    await this.load_setup_stdout_content();
    await this.load_setup_stderr_content();
    await this.load_student_test_names_stdout_content();
    await this.load_student_test_names_stderr_content();
    await this.load_validity_check_stdout_content();
    await this.load_validity_check_stderr_content();
    await this.load_grade_buggy_stdout_content();
    await this.load_grade_buggy_stderr_content();
    this.d_mutation_test_suite_result!.invalid_tests = [
      'one', 'two'
    ];
  }

  async load_setup_stdout_content() {
    this.d_setup_stdout_loaded = false;
    if (this.d_mutation_test_suite_result_output_size!.setup_stdout_size === null) {
      this.d_setup_stdout_content = null;
    }
    else {
      this.d_setup_stdout_content = await ResultOutput.get_mutation_test_suite_result_setup_stdout(
        this.submission.pk,
        this.mutation_test_suite_result.pk,
        this.d_fdbk_category
      );
    }
    this.d_setup_stdout_loaded = true;
  }

  async load_setup_stderr_content() {
    this.d_setup_stderr_loaded = false;
    if (this.d_mutation_test_suite_result_output_size!.setup_stderr_size === null) {
      this.d_setup_stderr_content = null;
    }
    else {
      this.d_setup_stderr_content = await ResultOutput.get_mutation_test_suite_result_setup_stderr(
        this.submission.pk,
        this.mutation_test_suite_result.pk,
        this.d_fdbk_category
      );
    }
    this.d_setup_stderr_loaded = true;
  }

  async load_student_test_names_stdout_content() {
    this.d_student_test_names_stdout_loaded = false;
    if (this.d_mutation_test_suite_result_output_size!.get_student_test_names_stdout_size
        === null) {
      this.d_student_test_names_stdout_content = null;
    }
    else {
      this.d_student_test_names_stdout_content
          = await ResultOutput.get_mutation_test_suite_result_get_student_test_names_stdout(
        this.submission.pk,
        this.mutation_test_suite_result.pk,
        this.d_fdbk_category
      );
    }
    this.d_student_test_names_stdout_loaded = true;
  }

  async load_student_test_names_stderr_content() {
    this.d_student_test_names_stderr_loaded = false;
    if (this.d_mutation_test_suite_result_output_size!.get_student_test_names_stderr_size
        === null) {
      this.d_student_test_names_stderr_content = null;
    }
    else {
      this.d_student_test_names_stderr_content
          = await ResultOutput.get_mutation_test_suite_result_get_student_test_names_stderr(
        this.submission.pk,
        this.mutation_test_suite_result.pk,
        this.d_fdbk_category
      );
    }
    this.d_student_test_names_stderr_loaded = true;
  }

  async load_validity_check_stdout_content() {
    this.d_validity_checkout_stdout_loaded = false;
    if (this.d_mutation_test_suite_result_output_size!.validity_check_stdout_size === null) {
      this.d_validity_checkout_stdout_content = null;
    }
    else {
      this.d_validity_checkout_stdout_content
          = await ResultOutput.get_mutation_test_suite_result_validity_check_stdout(
        this.submission.pk,
        this.mutation_test_suite_result.pk,
        this.d_fdbk_category
      );
    }
    this.d_validity_checkout_stdout_loaded = true;
  }

  async load_validity_check_stderr_content() {
    this.d_validity_checkout_stderr_loaded = false;
    if (this.d_mutation_test_suite_result_output_size!.validity_check_stderr_size === null) {
      this.d_validity_checkout_stderr_content = null;
    }
    else {
      this.d_validity_checkout_stderr_content
          = await ResultOutput.get_mutation_test_suite_result_validity_check_stderr(
        this.submission.pk,
        this.mutation_test_suite_result.pk,
        this.d_fdbk_category
      );
    }
    this.d_validity_checkout_stderr_loaded = true;
  }

  async load_grade_buggy_stdout_content() {
    this.d_grade_buggy_stdout_loaded = false;
    if (this.d_mutation_test_suite_result_output_size!.grade_buggy_impls_stdout_size === null) {
      this.d_grade_buggy_stdout_content = null;
    }
    else {
      this.d_grade_buggy_stdout_content
          = await ResultOutput.get_mutation_test_suite_result_grade_buggy_impls_stdout(
        this.submission.pk,
        this.mutation_test_suite_result.pk,
        this.d_fdbk_category
      );
    }
    this.d_grade_buggy_stdout_loaded = true;
  }

  async load_grade_buggy_stderr_content() {
    this.d_grade_buggy_stderr_loaded = false;
    if (this.d_mutation_test_suite_result_output_size!.grade_buggy_impls_stderr_size === null) {
      this.d_grade_buggy_stderr_content = null;
    }
    else {
      this.d_grade_buggy_stderr_content
          = await ResultOutput.get_mutation_test_suite_result_grade_buggy_impls_stderr(
        this.submission.pk,
        this.mutation_test_suite_result.pk,
        this.d_fdbk_category
      );
    }
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

  get setup_return_code_correctness(): string {
    if (this.mutation_test_suite_result.setup_timed_out !== null
        && this.mutation_test_suite_result.setup_timed_out) {
        return ReturnCodeCorrectness.timed_out;
    }
    else if (this.mutation_test_suite_result.setup_return_code === 0) {
        return ReturnCodeCorrectness.correct;
    }
    return ReturnCodeCorrectness.incorrect;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/components/submission_detail.scss';

$left-side-width-adjusted: 175px;

.section-divider {
  height: 1px;
  background-color: hsl(220, 30%, 60%);
  margin: 5px 0;
}

.list-item {
  padding: 1px 0;
  font-weight: normal;
}

.bug-icon {
  color: $navy-blue;
}

.invalid-test-icon {
  color: $warning-red;
}

.discarded-test-icon {
  color: #7a8fb8;
}

.valid-test-icon {
  color: $ocean-blue;
}

#setup-return-code-correctness-icon {
  padding: 0 0 0 5px;
}

#num-tests-accepted {
  text-decoration: underline;
}

#total-tests-submitted {
  text-decoration: underline;
}

.test-timed-out {
  color: $navy-blue;
  padding-left: 2px;
}

$width-of-feedback-label: 170px;

.feedback-label {
  width: $width-of-feedback-label;
}

.feedback {
  width: calc(100% - #{$width-of-feedback-label});
}

.discarded-test-icon,
.valid-test-icon,
.invalid-test-icon,
.bug-icon {
  padding-right: 5px;
}

.single-bug,
.single-valid-test,
.single-invalid-test {
  padding: 0 0 5px 0;
}

#list-of-bugs,
#list-of-valid-tests,
#list-of-invalid-tests,
#list-of-discarded-tests {
  padding: 5px;
}

.feedback-explanation {
  font-weight: bold;
  padding: 5px 0;
}

</style>
