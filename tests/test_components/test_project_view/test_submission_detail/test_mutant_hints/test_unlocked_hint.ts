import { Wrapper } from "@vue/test-utils";

import { HttpError } from "ag-client-typescript";
import * as sinon from "sinon";

import UnlockedHint from "@/components/project_view/submission_detail/mutant_hints/unlocked_hint.vue";
import {
  MutantHintService,
  UnlockedHintData,
} from "@/components/project_view/submission_detail/mutant_hints/mutant_hint_service";

import { managed_mount } from "@/tests/setup";
import { checkbox_is_checked } from "@/tests/utils";

function make_hint(
  overrides: Partial<UnlockedHintData> = {},
): UnlockedHintData {
  return {
    pk: 1,
    mutation_test_suite_result: 2,
    mutation_test_suite_hint_config: 3,
    mutant_name: "mutant1",
    hint_number: 0,
    hint_text: "This is a hint",
    hint_rating: null,
    user_comment: "",
    ...overrides,
  };
}

describe("UnlockedHint tests", () => {
  let wrapper: Wrapper<UnlockedHint>;
  let hint: UnlockedHintData;

  beforeEach(() => {
    hint = make_hint();
    wrapper = managed_mount(UnlockedHint, { propsData: { hint: hint } });
  });

  test("Renders hint number and mutant name", () => {
    expect(wrapper.text()).toContain('Hint 1 for "mutant1"');
    expect(wrapper.text()).toContain("This is a hint");
  });

  test("Renders true mutant name when present", () => {
    const hint_with_true_name = make_hint({
      mutant_name: "m1",
      true_mutant_name: "true1",
    });
    wrapper = managed_mount(UnlockedHint, {
      propsData: { hint: hint_with_true_name },
    });
    expect(wrapper.text()).toContain('"m1" (a.k.a. "true1")');
  });

  test("Feedback form shown when hint is unrated", () => {
    expect(wrapper.find(".feedback-form").exists()).toBe(true);
  });

  test("Feedback form hidden when hint is already rated", () => {
    const rated_hint = make_hint({ hint_rating: 2 });
    wrapper = managed_mount(UnlockedHint, { propsData: { hint: rated_hint } });
    expect(wrapper.find(".feedback-form").exists()).toBe(false);
  });

  test("Send feedback button disabled until a rating is chosen", async () => {
    const button = wrapper.find(".rate-hint-button");
    expect(button.attributes("disabled")).toBeDefined();

    await wrapper.findAll('input[type="radio"]').at(0).setChecked();

    expect(button.attributes("disabled")).toBeUndefined();
  });

  test("Selecting a rating checks the corresponding radio button", async () => {
    const radios = wrapper.findAll('input[type="radio"]');
    await radios.at(1).setChecked();

    expect(checkbox_is_checked(radios.at(0))).toBe(false);
    expect(checkbox_is_checked(radios.at(1))).toBe(true);
    expect(checkbox_is_checked(radios.at(2))).toBe(false);
  });

  test("Submitting feedback sends the chosen rating and comment", async () => {
    const rate_hint_stub = sinon
      .stub(MutantHintService, "rate_hint")
      .resolves();

    await wrapper.findAll('input[type="radio"]').at(0).setChecked();
    await wrapper.find("textarea").setValue("Great hint!");
    await wrapper.find(".rate-hint-button").trigger("click");
    await wrapper.vm.$nextTick();

    expect(
      rate_hint_stub.calledOnceWithExactly(hint.pk, {
        hint_rating: 3,
        user_comment: "Great hint!",
      }),
    ).toBe(true);
  });

  test("API error displayed when submitting feedback fails", async () => {
    sinon
      .stub(MutantHintService, "rate_hint")
      .rejects(new HttpError(400, { __all__: "Failed to save rating" }));

    await wrapper.findAll('input[type="radio"]').at(0).setChecked();
    await wrapper.find(".rate-hint-button").trigger("click");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".error-msg").text()).toContain(
      "Failed to save rating",
    );
  });

  test("Comment textarea is labeled", () => {
    const label = wrapper.find(".comment-box label");
    const textarea = wrapper.find("textarea");
    expect(label.attributes("for")).toEqual(textarea.attributes("id"));
  });

  test("Updating the hint prop refreshes the comment shown in the form", async () => {
    expect((<HTMLTextAreaElement>wrapper.find("textarea").element).value).toBe(
      "",
    );

    const updated_hint = make_hint({ user_comment: "Already left a comment" });
    await wrapper.setProps({ hint: updated_hint });

    expect((<HTMLTextAreaElement>wrapper.find("textarea").element).value).toBe(
      "Already left a comment",
    );
  });
});
