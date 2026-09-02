import DescriptionRenderer from "@/components/project_view/submission_detail/description_renderer.vue";

import { managed_mount } from "@/tests/setup";

describe("DescriptionRenderer", () => {
  test("Renders markdown as HTML", () => {
    const wrapper = managed_mount(DescriptionRenderer, {
      propsData: { text: "# Heading\n\nsome **bold** text" },
    });

    expect(wrapper.find("h1").text()).toEqual("Heading");
    expect(wrapper.find("strong").text()).toEqual("bold");
  });

  test("Sanitizes dangerous HTML", () => {
    const wrapper = managed_mount(DescriptionRenderer, {
      propsData: { text: '<script>window.alert("xss")</script>safe text' },
    });

    expect(wrapper.html()).not.toContain("<script");
    expect(wrapper.text()).toContain("safe text");
  });

  test("Re-renders when the text prop changes", async () => {
    const wrapper = managed_mount(DescriptionRenderer, {
      propsData: { text: "before" },
    });
    expect(wrapper.text()).toContain("before");

    await wrapper.setProps({ text: "after" });

    expect(wrapper.text()).toContain("after");
    expect(wrapper.text()).not.toContain("before");
  });
});
