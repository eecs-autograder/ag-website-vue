<template>
  <div id="mutation-suite-result">
    <div v-if="mutation_test_suite_result.setup_return_code !== null
               || mutation_test_suite_result.setup_timed_out"
         class="setup-section">

      <div class="feedback-row">
        <div class="feedback-label">
          {{mutation_test_suite_result.setup_command_name !== null
          ? mutation_test_suite_result.setup_command_name : 'Setup'}}:
        </div>

        <span id="setup_return_code_icon">
          {{get_setup_return_code_correctness()}}
        </span>
      </div>

      <div v-if="mutation_test_suite_result.setup_return_code !== null"
           class="feedback-row">
        <div class="feedback-label"> Setup Return Code: </div>
        <div class="feedback-output-content-short">
          {{mutation_test_suite_result.setup_return_code}}
        </div>
      </div>

      <div v-if="mutation_test_suite_result.fdbk_settings.show_setup_stdout"
           class="feedback-row">
        <p class="feedback-label"> Setup Output: </p>

        <template v-if="!setup_stdout_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <div v-if="!setup_stdout_content"
               class="feedback-output-content-single-line"> No Output </div>
          <pre v-else
               class="feedback-output-content-lengthy">{{setup_stdout_content}}</pre>
        </template>

      </div>

      <div v-if="mutation_test_suite_result.fdbk_settings.show_setup_stderr"
           class="feedback-row">
        <p class="feedback-label"> Setup Error Output: </p>

        <template v-if="!setup_stderr_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <div v-if="!setup_stderr_content"
               class="feedback-output-content-short">
            No Output
          </div>
          <pre v-else
               class="feedback-output-content-lengthy">{{setup_stderr_content}}</pre>
        </template>

      </div>
    </div>

    <div class="bug-section">

      <div v-if="mutation_test_suite_result.num_bugs_exposed !== null"
           class="feedback-row">
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
           class="feedback-row">
        <div class="feedback-label"> Buggy Stdout: </div>
        <template v-if="!grade_buggy_stdout_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <div v-if="!grade_buggy_stdout_content"
               class="feedback-output-content-short">
            No Output
          </div>
          <pre v-else
               class="feedback-output-content-lengthy">{{grade_buggy_stdout_content}}</pre>
        </template>
      </div>

      <div v-if="mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stderr"
           class="feedback-row">
        <div class="feedback-label"> Buggy Stderr: </div>

        <template v-if="!grade_buggy_stderr_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <div v-if="!grade_buggy_stderr_content"
               class="feedback-output-content-short">
            No Output
          </div>
          <pre v-else
               class="feedback-output-content-lengthy">{{grade_buggy_stderr_content}}</pre>
        </template>

      </div>
    </div>

    <div v-if="mutation_test_suite_result.student_tests.length"
         class="test-summary-section">
      <div>
        <div v-if="mutation_test_suite_result.fdbk_settings.show_validity_check_stdout"
             class="feedback-row">
          <div class="feedback-label"> Validity Check Stdout: </div>

          <template v-if="!validity_checkout_stdout_loaded">
            <i class="fa fa-spinner fa-pulse fa-fw"></i>
          </template>
          <template v-else>
            <div v-if="!validity_checkout_stdout_content"
               class="feedback-output-content-short">
              No Output
            </div>
            <pre v-else
                 class="feedback-output-content-lengthy">{{validity_checkout_stdout_content}}</pre>
          </template>

        </div>

        <div v-if="mutation_test_suite_result.fdbk_settings.show_validity_check_stderr"
             class="feedback-row">
          <div class="feedback-label"> Validity Check Stderr: </div>

          <template v-if="!validity_checkout_stderr_loaded">
            <i class="fa fa-spinner fa-pulse fa-fw"></i>
          </template>
          <template v-else>
            <p v-if="!validity_checkout_stderr_content"
               class="feedback-output-content-short">
              No Output
            </p>
            <pre v-else
                 class="feedback-output-content-lengthy">{{validity_checkout_stderr_content}}</pre>
          </template>

        </div>
      </div>

      <div v-if="mutation_test_suite_result.fdbk_settings.show_get_test_names_stdout"
           class="feedback-row">
        <div class="feedback-label"> Get test names stdout: </div>

        <template v-if="!test_names_stdout_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <div v-if="!test_names_stdout_content"
               class="feedback-output-content-short">
            No Output
          </div>
          <pre v-else
               class="feedback-output-content-lengthy">{{test_names_stdout_content}}</pre>
        </template>

      </div>

      <div v-if="mutation_test_suite_result.fdbk_settings.show_get_test_names_stderr"
           class="feedback-row">
        <div class="feedback-label"> Get test names stderr: </div>

        <template v-if="!test_names_stderr_loaded">
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </template>
        <template v-else>
          <div v-if="!test_names_stderr_content"
             class="feedback-output-content-short"> No Output
          </div>
          <pre v-else
               class="feedback-output-content-lengthy">{{test_names_stderr_content}}</pre>
        </template>

      </div>

      <div v-if="mutation_test_suite_result.discarded_tests.length">
        <div class="discarded-explanation">
          This suite accepts up to
          <span class="too-many-tests-submitted-data">
            {{mutation_test_suite_result.student_tests.length}}
          </span>
          tests, but you submitted
          <span class="too-many-tests-submitted-data">
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

      <div v-if="mutation_test_suite_result.invalid_tests.length">
        <div class="list-label feedback-label">
          These tests incorrectly reported a bug when run against a correct implementation:
        </div>
        <ul id="list-of-incorrectly-reported-bug-tests"
            class="fa-ul">
          <li class="list-item"
              v-for="invalid_test of mutation_test_suite_result.invalid_tests">
            <span class="fa-li">
              <i class="fas fa-exclamation-triangle incorrectly-reported-bug-icon"></i>
            </span>
            {{invalid_test}}
<!--            <i v-if="test_timed_out(invalid_test)"-->
<!--            <i class="far fa-clock"-->
<!--               title="This test case exceeded the time limit">-->
<!--            </i>-->
          </li>
        </ul>
      </div>

      <div v-if="get_valid_tests().length"
        class="feedback-row">
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

  readonly CorrectnessLevel = CorrectnessLevel;
  readonly BugsExposedFeedbackLevel = BugsExposedFeedbackLevel;

  setup_stdout_content: string | null = null;
  setup_stderr_content: string | null = null;
  test_names_stdout_content: string | null = null;
  test_names_stderr_content: string | null = null;
  validity_checkout_stdout_content: string | null = null;
  validity_checkout_stderr_content: string | null = null;
  grade_buggy_stdout_content: string | null = null;
  grade_buggy_stderr_content: string | null = null;
  d_fdbk_category: FeedbackCategory = FeedbackCategory.past_limit_submission;

  setup_stdout_loaded = false;
  setup_stderr_loaded = false;
  test_names_stdout_loaded = false;
  test_names_stderr_loaded = false;
  validity_checkout_stdout_loaded = false;
  validity_checkout_stderr_loaded = false;
  grade_buggy_stdout_loaded = false;
  grade_buggy_stderr_loaded = false;

  async created() {
    this.d_fdbk_category = this.fdbk_category;
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
    this.setup_stdout_content = await ResultOutput.get_mutation_test_suite_result_setup_stdout(
      this.submission.pk,
      this.mutation_test_suite_result.pk,
      this.d_fdbk_category
    );
    this.setup_stdout_loaded = true;
  }

  async load_setup_stderr_content() {
    this.setup_stderr_content = await ResultOutput.get_mutation_test_suite_result_setup_stderr(
      this.submission.pk,
      this.mutation_test_suite_result.pk,
      this.d_fdbk_category
    );
    this.setup_stderr_loaded = true;
  }

  async load_test_names_stdout_content() {
    this.test_names_stdout_content
      = await ResultOutput.get_mutation_test_suite_result_get_student_test_names_stdout(
      this.submission.pk,
      this.mutation_test_suite_result.pk,
      this.d_fdbk_category
    );
    this.test_names_stdout_loaded = true;
  }

  async load_test_names_stderr_content() {
    this.test_names_stderr_content
      = await ResultOutput.get_mutation_test_suite_result_get_student_test_names_stdout(
      this.submission.pk,
      this.mutation_test_suite_result.pk,
      this.d_fdbk_category
    );
    this.test_names_stderr_loaded = true;
  }

  async load_validity_check_stdout_content() {
    this.validity_checkout_stdout_content =
      await ResultOutput.get_mutation_test_suite_result_validity_check_stdout(
      this.submission.pk,
      this.mutation_test_suite_result.pk,
      this.d_fdbk_category
    );
    this.validity_checkout_stdout_loaded = true;
  }

  async load_validity_check_stderr_content() {
    this.validity_checkout_stderr_content =
      await ResultOutput.get_mutation_test_suite_result_validity_check_stderr(
      this.submission.pk,
      this.mutation_test_suite_result.pk,
      this.d_fdbk_category
    );
    this.validity_checkout_stderr_loaded = true;
  }

  async load_grade_buggy_stdout_content() {
    this.grade_buggy_stdout_content =
        await ResultOutput.get_mutation_test_suite_result_grade_buggy_impls_stdout(
      this.submission.pk,
      this.mutation_test_suite_result.pk,
      this.d_fdbk_category
    );
    this.grade_buggy_stdout_loaded = true;
  }

  async load_grade_buggy_stderr_content() {
    this.grade_buggy_stderr_content =
        await ResultOutput.get_mutation_test_suite_result_grade_buggy_impls_stderr(
      this.submission.pk,
      this.mutation_test_suite_result.pk,
      this.d_fdbk_category
    );
    this.grade_buggy_stderr_loaded = true;
  }

  test_timed_out(test: string): boolean {
    return this.mutation_test_suite_result!.timed_out_tests!.findIndex(
        (item) => item === test
    ) !== -1;
  }

  get_valid_tests(): string[] {
    let valid_tests = this.mutation_test_suite_result.student_tests.filter(
      (student_test) => this.mutation_test_suite_result!.invalid_tests!.findIndex(
          (invalid_test) => invalid_test === student_test)
      === -1);
    return valid_tests;
  }

  get_setup_return_code_correctness() {
    if (this.mutation_test_suite_result.setup_timed_out === null) {
        return "Timed Out";
    }
    else if (this.mutation_test_suite_result.setup_return_code === 0) {
        return "Correct";
    }
    return "Incorrect";
  }

  get_return_code_correctness(return_code: number) {
    if (return_code === null) {
      return CorrectnessLevel.not_available;
    }
    if (return_code === 0) {
      return CorrectnessLevel.all_correct;
    }
    return CorrectnessLevel.none_correct;
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
