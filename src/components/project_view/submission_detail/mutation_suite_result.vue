<template>
  <div id="mutation-suite-result">

    <fieldset v-if="show_setup_fieldset"
              class="fieldset">
      <legend class="legend"> Setup Command </legend>

      <div id="setup-section">

        <div class="feedback-row"
             v-if="d_mutation_test_suite_result.setup_return_code !== null
                   || (d_mutation_test_suite_result.setup_timed_out !== null
                       && d_mutation_test_suite_result.setup_timed_out)">
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
            <div class="short-output">{{d_mutation_test_suite_result.setup_return_code}}</div>
          </div>
        </div>

        <div v-if="d_mutation_test_suite_result.fdbk_settings.show_setup_stdout"
             id="setup-stdout-section"
             class="feedback-row">
          <div class="feedback-label"> Output: </div>
          <div class="feedback">
            <template v-if="!d_setup_stdout_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_setup_stdout_content" class="short-output"> No Output </div>
              <pre v-else class="lengthy-output">{{d_setup_stdout_content}}</pre>
            </template>
          </div>
        </div>

        <div v-if="d_mutation_test_suite_result.fdbk_settings.show_setup_stderr"
             id="setup-stderr-section"
             class="feedback-row">
          <div class="feedback-label"> Error Output: </div>
          <div class="feedback">
            <template v-if="!d_setup_stderr_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_setup_stderr_content" class="short-output">No Output</div>
              <pre v-else class="lengthy-output">{{d_setup_stderr_content}}</pre>
            </template>
          </div>
        </div>

      </div>
    </fieldset>

    <fieldset v-if="show_student_tests_fieldset"
              class="fieldset">
      <legend class="legend"> Student Tests </legend>
      <div id="student-tests-section">

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

          <div class="feedback-label test-names-feedback-label"> Discarded test cases: </div>
          <div class="feedback test-names-feedback">
            <div id="list-of-discarded-tests">
              <div v-for="discarded_test_name of d_mutation_test_suite_result.discarded_tests"
                   class="single-discarded-test">
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
             id="false-positive-tests-section"
             class="feedback-row">

          <div class="feedback-explanation">
            Tests with false positives incorrectly reported a bug when run against a correct
            implementation.
          </div>
          <div class="feedback-label test-names-feedback-label">Tests with false positives:</div>
          <div class="feedback test-names-feedback">
            <div id="list-of-false-positive-tests">
              <div v-for="false_positive_test of d_mutation_test_suite_result.invalid_tests"
                   class="single-false-positive-test">
                <span>
                  <span v-if="test_timed_out(false_positive_test)">
                    <i class="far fa-clock timed-out-icon"></i>
                  </span>
                  <span v-else>
                    <i class="fas fa-exclamation-triangle false-positive-test-icon"></i>
                  </span>
                  {{false_positive_test}}
                </span>
                <span v-if="test_timed_out(false_positive_test)"
                      class="test-timed-out">
                  (Timed Out)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="get_valid_tests().length"
             class="feedback-row"
             id="valid-tests-section">
          <div class="feedback-label test-names-feedback-label"> Your test cases: </div>
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

        <div v-if="d_mutation_test_suite_result.fdbk_settings.show_get_test_names_stdout
                       || d_mutation_test_suite_result.fdbk_settings.show_get_test_names_stderr"
             class="feedback-row">

          <div class="feedback-label show-output-button-label">Test Names Output:</div>
          <div class="feedback">
            <button class="show-output-button"
                    id="show-test-names-output-button"
                    @click="toggle_d_show_student_test_names_output">
              {{d_show_student_test_names_output ? 'Hide' : 'Show'}} Output
            </button>
          </div>
        </div>

        <div v-if="d_mutation_test_suite_result.fdbk_settings.show_get_test_names_stdout
                   && d_show_student_test_names_output"
             class="feedback-row"
             id="test-names-stdout-section">
          <div class="feedback-label test-names-feedback-label"> Output: </div>
          <div class="feedback test-names-feedback">
            <template v-if="!d_student_test_names_stdout_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_student_test_names_stdout_content" class="short-output">No Output</div>
              <pre v-else class="lengthy-output">{{d_student_test_names_stdout_content}}</pre>
            </template>
          </div>
        </div>

        <div v-if="d_mutation_test_suite_result.fdbk_settings.show_get_test_names_stderr
                   && d_show_student_test_names_output"
             class="feedback-row"
             id="test-names-stderr-section">
          <div class="feedback-label test-names-feedback-label"> Error Output: </div>
          <div class="feedback test-names-feedback">
            <template v-if="!d_student_test_names_stderr_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_student_test_names_stderr_content" class="short-output">No Output</div>
              <pre v-else class="lengthy-output">{{d_student_test_names_stderr_content}}</pre>
            </template>
          </div>
        </div>

        <div v-if="d_mutation_test_suite_result.fdbk_settings.show_validity_check_stdout
                   || d_mutation_test_suite_result.fdbk_settings.show_validity_check_stderr"
             class="feedback-row">

          <div class="feedback-label show-output-button-label">Validity Output:</div>
          <div class="feedback">
            <button class="show-output-button"
                    id="show-validity-check-output-button"
                    @click="toggle_d_show_validity_check_output">
              {{d_show_validity_check_output ? 'Hide' : 'Show'}} Output
            </button>
          </div>
        </div>

        <div v-if="d_mutation_test_suite_result.fdbk_settings.show_validity_check_stdout
                   && d_show_validity_check_output"
             class="feedback-row"
             id="validity-check-stdout-section">
          <div class="feedback-label"> Output: </div>
          <div class="feedback">
            <template v-if="!d_validity_check_stdout_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_validity_check_stdout_content" class="short-output">No Output</div>
              <pre v-else class="lengthy-output">{{d_validity_check_stdout_content}}</pre>
            </template>
          </div>
        </div>

        <div v-if="d_mutation_test_suite_result.fdbk_settings.show_validity_check_stderr
                   && d_show_validity_check_output"
             class="feedback-row"
             id="validity-check-stderr-section">
          <div class="feedback-label"> Error Output: </div>
          <div class="feedback">
            <template v-if="!d_validity_check_stderr_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <p v-if="!d_validity_check_stderr_content" class="short-output">No Output</p>
              <pre v-else class="lengthy-output">{{d_validity_check_stderr_content}}
              </pre>
            </template>
          </div>
        </div>
      </div>
    </fieldset>

    <fieldset v-if="show_buggy_implementations_fieldset"
              class="fieldset">
      <legend class="legend"> Buggy Implementations </legend>
      <div id="buggy-implementations-section">

        <div v-if="d_mutation_test_suite_result.num_bugs_exposed !== null"
             id="num-bugs-exposed-section"
             class="feedback-row">
          <div class="feedback-label buggy-impl-feedback-label"> # of exposed bugs: </div>
          <div class="feedback buggy-impl-feedback">
            <div class="short-output">{{d_mutation_test_suite_result.num_bugs_exposed}}</div>
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

        <div v-if="d_mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stdout
                   || d_mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stderr"
             class="feedback-row">
          <div class="feedback-label show-output-button-label">Bug Output:</div>
          <div class="feedback">
            <button class="show-output-button"
                    id="show-buggy-output-button"
                    @click="toggle_d_show_buggy_implementations_output">
              {{d_show_buggy_implementations_output ? 'Hide' : 'Show'}} Output
            </button>
          </div>
        </div>
        <div v-if="d_mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stdout
                     && d_show_buggy_implementations_output"
               id="buggy-stdout-section"
               class="feedback-row">
          <div class="feedback-label buggy-impl-feedback-label"> Output: </div>
          <div class="feedback buggy-impl-feedback">
            <template v-if="!d_grade_buggy_stdout_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_grade_buggy_stdout_content" class="short-output">No Output</div>
              <pre v-else class="lengthy-output">{{d_grade_buggy_stdout_content}}</pre>
            </template>
          </div>
        </div>

        <div v-if="d_mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stderr
                   && d_show_buggy_implementations_output"
             class="feedback-row"
             id="buggy-stderr-section">
          <div class="feedback-label buggy-impl-feedback-label"> Error Output: </div>
          <div class="feedback buggy-impl-feedback">
            <template v-if="!d_grade_buggy_stderr_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_grade_buggy_stderr_content" class="short-output">No Output</div>
              <pre v-else class="lengthy-output">{{d_grade_buggy_stderr_content}}</pre>
            </template>
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
  on_submission_change(new_value: Submission, old_value: Submission) {
    this.d_submission = new_value;
  }

  @Watch('fdbk_category')
  on_fdbk_category_change(new_value: FeedbackCategory, old_value: FeedbackCategory) {
    this.d_fdbk_category = new_value;
  }

  @Watch('mutation_test_suite_result')
  async on_mutation_test_suite_results_change(new_value: MutationTestSuiteResultFeedback,
                                              old_value: MutationTestSuiteResultFeedback) {
    this.d_mutation_test_suite_result = JSON.parse(JSON.stringify(new_value));
    await this.get_results();
  }

  readonly CorrectnessLevel = CorrectnessLevel;
  readonly BugsExposedFeedbackLevel = BugsExposedFeedbackLevel;
  readonly ReturnCodeCorrectness = ReturnCodeCorrectness;

  d_setup_stdout_content: string | null = null;
  d_setup_stderr_content: string | null = null;
  d_student_test_names_stdout_content: string | null = null;
  d_student_test_names_stderr_content: string | null = null;
  d_validity_check_stdout_content: string | null = null;
  d_validity_check_stderr_content: string | null = null;
  d_grade_buggy_stdout_content: string | null = null;
  d_grade_buggy_stderr_content: string | null = null;

  d_submission: Submission | null = null;
  d_fdbk_category: FeedbackCategory = FeedbackCategory.past_limit_submission;
  d_mutation_test_suite_result: MutationTestSuiteResultFeedback | null = null;

  d_show_buggy_implementations_output = false;
  d_show_student_test_names_output = false;
  d_show_validity_check_output = false;

  d_load_grade_buggy_output = false;
  d_load_student_test_names_output = false;
  d_load_validity_check_output = false;

  d_setup_stdout_loaded = false;
  d_setup_stderr_loaded = false;
  d_student_test_names_stdout_loaded = false;
  d_student_test_names_stderr_loaded = false;
  d_validity_check_stdout_loaded = false;
  d_validity_check_stderr_loaded = false;
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

  get show_setup_fieldset(): boolean {
    return this.d_mutation_test_suite_result!.fdbk_settings.show_setup_stdout
           || this.d_mutation_test_suite_result!.fdbk_settings.show_setup_stderr
           || this.d_mutation_test_suite_result!.setup_return_code !== null
           || (this.d_mutation_test_suite_result!.setup_timed_out !== null
               && this.d_mutation_test_suite_result!.setup_timed_out!);
  }

  get show_buggy_implementations_fieldset(): boolean {
    return this.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stdout
           || this.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stderr
           || this.d_mutation_test_suite_result!.num_bugs_exposed !== null;
  }

  get show_student_tests_fieldset(): boolean {
    return this.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stdout
           || this.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stderr
           || this.d_mutation_test_suite_result!.discarded_tests.length > 0
           || (this.d_mutation_test_suite_result!.invalid_tests !== null
               && this.d_mutation_test_suite_result!.invalid_tests!.length > 0)
           || this.get_valid_tests().length > 0
           || this.d_mutation_test_suite_result!.fdbk_settings.show_validity_check_stdout
           || this.d_mutation_test_suite_result!.fdbk_settings.show_validity_check_stderr;
  }

  async toggle_d_show_buggy_implementations_output() {
    let old_toggle_val = this.d_show_buggy_implementations_output;
    this.d_show_buggy_implementations_output = !this.d_show_buggy_implementations_output;
    if (!old_toggle_val) {
      if (!this.d_load_grade_buggy_output) {
        this.d_load_grade_buggy_output = true;
        this.d_grade_buggy_stdout_loaded = false;
        this.d_grade_buggy_stderr_loaded = false;
        await this.load_grade_buggy_stdout_content();
        await this.load_grade_buggy_stderr_content();
      }
    }
  }

  async toggle_d_show_student_test_names_output() {
    let old_toggle_val = this.d_show_student_test_names_output;
    this.d_show_student_test_names_output = !this.d_show_student_test_names_output;
    if (!old_toggle_val) {
      if (!this.d_load_student_test_names_output) {
        this.d_load_student_test_names_output = true;
        this.d_student_test_names_stdout_loaded = false;
        this.d_student_test_names_stderr_loaded = false;
        await this.load_student_test_names_stdout_content();
        await this.load_student_test_names_stderr_content();
      }
    }
  }

  async toggle_d_show_validity_check_output() {
    let old_toggle_val = this.d_show_validity_check_output;
    this.d_show_validity_check_output = !this.d_show_validity_check_output;
    if (!old_toggle_val) {
      if (!this.d_load_validity_check_output) {
        this.d_load_validity_check_output = true;
        this.d_validity_check_stdout_loaded = false;
        this.d_validity_check_stderr_loaded = false;
        await this.load_validity_check_stdout_content();
        await this.load_validity_check_stderr_content();
      }
    }
  }

  async get_results() {
    this.d_mutation_test_suite_result_output_size
        = await ResultOutput.get_mutation_test_suite_result_output_size(
      this.d_submission!.pk,
      this.d_mutation_test_suite_result!.pk,
      this.d_fdbk_category
    );

    this.d_setup_stdout_loaded = false;
    this.d_setup_stderr_loaded = false;
    this.d_grade_buggy_stdout_loaded = false;
    this.d_grade_buggy_stderr_loaded = false;
    this.d_student_test_names_stdout_loaded = false;
    this.d_student_test_names_stderr_loaded = false;
    this.d_validity_check_stdout_loaded = false;
    this.d_validity_check_stderr_loaded = false;

    await this.load_setup_stdout_content();
    await this.load_setup_stderr_content();
    if (this.d_load_student_test_names_output) {
      await this.load_student_test_names_stdout_content();
      await this.load_student_test_names_stderr_content();
    }
    if (this.d_load_validity_check_output) {
      await this.load_validity_check_stdout_content();
      await this.load_validity_check_stderr_content();
    }
    if (this.d_load_grade_buggy_output) {
      await this.load_grade_buggy_stdout_content();
      await this.load_grade_buggy_stderr_content();
    }
  }

  async load_setup_stdout_content() {
    if (this.d_mutation_test_suite_result_output_size!.setup_stdout_size === null) {
      this.d_setup_stdout_content = null;
    }
    else {
      this.d_setup_stdout_content = await ResultOutput.get_mutation_test_suite_result_setup_stdout(
        this.submission.pk,
        this.d_mutation_test_suite_result!.pk,
        this.d_fdbk_category
      );
    }
    this.d_setup_stdout_loaded = true;
  }

  async load_setup_stderr_content() {
    if (this.d_mutation_test_suite_result_output_size!.setup_stderr_size === null) {
      this.d_setup_stderr_content = null;
    }
    else {
      this.d_setup_stderr_content = await ResultOutput.get_mutation_test_suite_result_setup_stderr(
        this.submission.pk,
        this.d_mutation_test_suite_result!.pk,
        this.d_fdbk_category
      );
    }
    this.d_setup_stderr_loaded = true;
  }

  async load_student_test_names_stdout_content() {
    if (this.d_mutation_test_suite_result_output_size!.get_student_test_names_stdout_size
        === null) {
      this.d_student_test_names_stdout_content = null;
    }
    else {
      this.d_student_test_names_stdout_content
          = await ResultOutput.get_mutation_test_suite_result_get_student_test_names_stdout(
        this.submission.pk,
        this.d_mutation_test_suite_result!.pk,
        this.d_fdbk_category
      );
    }
    this.d_student_test_names_stdout_loaded = true;
  }

  async load_student_test_names_stderr_content() {
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
    if (this.d_mutation_test_suite_result_output_size!.validity_check_stdout_size === null) {
      this.d_validity_check_stdout_content = null;
    }
    else {
      this.d_validity_check_stdout_content
          = await ResultOutput.get_mutation_test_suite_result_validity_check_stdout(
        this.submission.pk,
        this.d_mutation_test_suite_result!.pk,
        this.d_fdbk_category
      );
    }
    this.d_validity_check_stdout_loaded = true;
  }

  async load_validity_check_stderr_content() {
    if (this.d_mutation_test_suite_result_output_size!.validity_check_stderr_size === null) {
      this.d_validity_check_stderr_content = null;
    }
    else {
      this.d_validity_check_stderr_content
          = await ResultOutput.get_mutation_test_suite_result_validity_check_stderr(
        this.submission.pk,
        this.d_mutation_test_suite_result!.pk,
        this.d_fdbk_category
      );
    }
    this.d_validity_check_stderr_loaded = true;
  }

  async load_grade_buggy_stdout_content() {
    if (this.d_mutation_test_suite_result_output_size!.grade_buggy_impls_stdout_size === null) {
      this.d_grade_buggy_stdout_content = null;
    }
    else {
      this.d_grade_buggy_stdout_content
          = await ResultOutput.get_mutation_test_suite_result_grade_buggy_impls_stdout(
        this.submission.pk,
        this.d_mutation_test_suite_result!.pk,
        this.d_fdbk_category
      );
    }
    this.d_grade_buggy_stdout_loaded = true;
  }

  async load_grade_buggy_stderr_content() {
    if (this.d_mutation_test_suite_result_output_size!.grade_buggy_impls_stderr_size === null) {
      this.d_grade_buggy_stderr_content = null;
    }
    else {
      this.d_grade_buggy_stderr_content
          = await ResultOutput.get_mutation_test_suite_result_grade_buggy_impls_stderr(
        this.submission.pk,
        this.d_mutation_test_suite_result!.pk,
        this.d_fdbk_category
      );
    }
    this.d_grade_buggy_stderr_loaded = true;
  }

  test_timed_out(test: string): boolean {
    if (this.d_mutation_test_suite_result!.timed_out_tests === null) {
        return false;
    }
    return this.d_mutation_test_suite_result!.timed_out_tests!.findIndex(
        (item) => item === test
    ) !== -1;
  }

  get_valid_tests(): string[] {
    if (this.d_mutation_test_suite_result!.invalid_tests === null) {
        return this.d_mutation_test_suite_result!.student_tests;
    }
    let valid_tests = this.d_mutation_test_suite_result!.student_tests.filter(
      (student_test) => this.d_mutation_test_suite_result!.invalid_tests!.findIndex(
          (invalid_test) => invalid_test === student_test)
      === -1);
    return valid_tests;
  }

  get setup_return_code_correctness(): string {
    if (this.d_mutation_test_suite_result!.setup_timed_out !== null
        && this.d_mutation_test_suite_result!.setup_timed_out!) {
        return ReturnCodeCorrectness.timed_out;
    }
    else if (this.d_mutation_test_suite_result!.setup_return_code === 0) {
        return ReturnCodeCorrectness.correct;
    }
    return ReturnCodeCorrectness.incorrect;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/submission_detail.scss';

$discarded-test-color: #b53389;
$false-positive-test-color: $coral-pink;
$valid-test-color: $ocean-blue;
$bug-color: $navy-blue;

.bug-icon {
  color: $bug-color;
}

.discarded-test-icon {
  color: $discarded-test-color;
}

.false-positive-test-icon {
  color: $false-positive-test-color;
}

.timed-out-icon {
  color: $false-positive-test-color;
}

.valid-test-icon {
  color: $valid-test-color;
}

#setup-return-code-correctness-icon {
  padding: 0 0 0 5px;
}

#num-tests-accepted, #total-tests-submitted {
  text-decoration: underline;
  color: $discarded-test-color;
}

.test-timed-out {
  color: $false-positive-test-color;
  padding-left: 2px;
}

.discarded-test-icon,
.valid-test-icon,
.false-positive-test-icon,
.timed-out-icon,
.bug-icon {
  padding-right: 5px;
}

.bug-icon {
  font-size: 14px;
}

.single-bug,
.single-valid-test,
.single-false-positive-test,
.single-discarded-test {
  padding: 0 0 5px 0;
  word-break: break-word;
}

#list-of-bugs,
#list-of-valid-tests,
#list-of-false-positive-tests,
#list-of-discarded-tests {
  padding: 5px;
}

.feedback-explanation {
  font-weight: bold;
  padding: 5px 2px;
}

.show-output-button-label {
  font-weight: bold;
}

.show-output-button {
  @extend .white-button;
  box-shadow: none;
  margin: 0 10px;
}

.show-output-button:focus {
  outline: none;
  box-shadow: none;
}

@media only screen and (min-width: 700px) {
  $width-of-mutation-feedback-label: 200px;

  .feedback-label {
    width: $width-of-mutation-feedback-label;
  }

  .feedback {
    width: calc(100% - #{$width-of-mutation-feedback-label});
  }

  .show-output-button {
    margin: 0;
  }
}

</style>
