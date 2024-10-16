/// <reference types="cypress" />

import ValidatedInput, { ValidatorResponse } from "./validated_input.vue";

const IS_NUMBER = (value: string): ValidatorResponse => {
  return {
    is_valid: value !== "" && !isNaN(Number(value)),
    error_msg: "Invalid number!",
  };
};

describe("<Validated_input />", () => {
  const propsData = {
    value: 1,
    validators: [IS_NUMBER],
    from_string_fn: (val: string) => parseInt(val, 10),
  };

  it("renders initial value", () => {
    cy.mount(ValidatedInput, {
      propsData: propsData,
    });
    cy.get_by_testid("input").should("have.value", "1");
  });

  it("emits on valid change", () => {
    const input_spy = cy.spy().as("input_spy");
    cy.mount(ValidatedInput, {
      propsData: propsData,
      listeners: {
        input: input_spy,
      },
    });
    cy.get_by_testid("input").clear().type("42");
    cy.get("@input_spy").should("have.been.calledWith", 42);
  });
});
