import { computed, nextTick, ref } from "vue";

import { use_title } from "@/composables/use_title";

test("Sets document title immediately", () => {
  use_title("Initial title");
  expect(document.title).toEqual("Initial title");
});

test("Updates document title when the ref changes", async () => {
  const title = use_title("Initial title");
  title.value = "New title";
  await nextTick();
  expect(document.title).toEqual("New title");
});

test("Getter sets document title immediately and tracks its dependencies", async () => {
  const name = ref("First");
  use_title(() => `${name.value} | Autograder.io`);
  expect(document.title).toEqual("First | Autograder.io");

  name.value = "Second";
  await nextTick();
  expect(document.title).toEqual("Second | Autograder.io");
});

test("Computed sets document title immediately and tracks its dependencies", async () => {
  const name = ref("First");
  use_title(computed(() => `${name.value} | Autograder.io`));
  expect(document.title).toEqual("First | Autograder.io");

  name.value = "Second";
  await nextTick();
  expect(document.title).toEqual("Second | Autograder.io");
});
