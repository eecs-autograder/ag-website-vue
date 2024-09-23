// https://github.com/cypress-io/cypress/issues/28420

import { mount } from "cypress/vue2"
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}
