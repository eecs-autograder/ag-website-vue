import { mount, Wrapper } from "@vue/test-utils";

import CollapsibleSection from "@/components/CollapsibleSection.vue";
import { find_collapsible_section_header } from "@/tests/utils";

describe("CollapsibleSection", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: Wrapper<Vue>;
  beforeEach(() => {
    wrapper = mount(CollapsibleSection, {
      slots: {
        header: "Foo",
        body: "Bar",
      },
    });
  });
  test("renders header", () => {
    expect(wrapper.html()).toContain("Foo");
  });

  test("does not render body initially", () => {
    expect(wrapper.html()).not.toContain("Bar");
  });

  test("renders header and body after header is clicked", async () => {
    await find_collapsible_section_header(wrapper).trigger("click");
    expect(wrapper.html()).toContain("Foo");
    expect(wrapper.html()).toContain("Bar");
  });

  test("hides body after header is clicked twice", async () => {
    await find_collapsible_section_header(wrapper).trigger("click");
    await find_collapsible_section_header(wrapper).trigger("click");
    expect(wrapper.html()).toContain("Foo");
    expect(wrapper.html()).not.toContain("Bar");
  });
});
