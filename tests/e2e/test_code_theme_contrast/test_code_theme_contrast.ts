import * as fs from "fs";
import * as path from "path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";

import { fake_login, run_in_django_shell } from "../utils";

// Verifies the code viewer's syntax theme is WCAG AA accessible against every
// background it renders on, in both light and dark mode.
// It seeds a handgrading result whose files exercise every token color bucket,
// with a comment covering half of each file so tokens land on both a plain code
// background and a commented-line background.

// One representative highlight.js class per theme color bucket.
// We'll assert these are present to make sure our coverage is complete.
const TOKEN_BUCKET_CLASSES = [
  "hljs-comment",
  "hljs-keyword",
  "hljs-title",
  "hljs-string",
  "hljs-number",
  "hljs-selector-class",
  "hljs-attribute",
];

const SEED_SCRIPT = fs.readFileSync(
  path.join(__dirname, "seed_code_theme_contrast.py"),
  "utf-8",
);

test.describe("code viewer syntax theme contrast", () => {
  test.describe.configure({ mode: "serial", timeout: 10_000 });

  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(20_000);
    context = await browser.newContext({ colorScheme: "light" });
    page = await context.newPage();
    const { project_pk, student, grader } = seed_handgrading_result();

    await fake_login(context, grader);
    await page.goto(`/web/project/${project_pk}`);

    await page.getByRole("link", { name: "Handgrading", exact: true }).click();
    await page
      .locator(".group-summary-panel")
      .filter({ hasText: student })
      .click();

    for (const filename of ["example.py", "example.css"]) {
      await page.getByRole("button", { name: filename }).click();
    }

    const files = page.locator(".files");
    // Coverage guard: every color bucket rendered...
    for (const token_class of TOKEN_BUCKET_CLASSES) {
      await expect(
        files.locator(`.${token_class}`).first(),
        `expected a rendered .${token_class} token`,
      ).toBeVisible();
    }
    // ...and tokens exist on both a commented-line background and a plain one.
    await expect(
      files.locator(".commented-line .hljs-keyword").first(),
      "expected a token on a commented line",
    ).toBeVisible();
    await expect(
      files.locator("tr:not(.commented-line) .hljs-keyword").first(),
      "expected a token on a non-commented line",
    ).toBeVisible();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("plain and commented-line backgrounds", async () => {
    await check_in_light_and_dark(page, check_resting_backgrounds);
  });

  test("hovered-comment background", async () => {
    await check_in_light_and_dark(page, check_hovered_background);
  });

  test("selected-region background", async () => {
    await check_in_light_and_dark(page, check_selected_background);
  });
});

function parse_seed_value(stdout: string, key: string): string {
  const match = stdout.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (match === null) {
    throw new Error(`seed script did not print ${key}. Output:\n${stdout}`);
  }
  return match[1].trim();
}

function seed_handgrading_result() {
  const { stdout } = run_in_django_shell(SEED_SCRIPT);
  return {
    project_pk: Number(parse_seed_value(stdout, "PROJECT_PK")),
    student: parse_seed_value(stdout, "STUDENT"),
    grader: parse_seed_value(stdout, "GRADER"),
  };
}

async function assert_no_contrast_violations(page: Page, label: string) {
  const { violations } = await new AxeBuilder({ page })
    .include(".files")
    .withRules(["color-contrast"])
    .analyze();
  expect(
    violations,
    `${label} contrast violations:\n${JSON.stringify(violations, null, 2)}`,
  ).toEqual([]);
}

// The plain code background and the commented-line background are both present
// at rest, so one scan covers them.
async function check_resting_backgrounds(page: Page, theme: string) {
  await assert_no_contrast_violations(page, `${theme}: plain + commented`);
}

// Hover and check each comment on each file so the commented tokens sit on the
// hovered background
async function check_hovered_background(page: Page, theme: string) {
  const files = page.locator(".files");
  const comments = files.locator(".comment");
  const comment_count = await comments.count();
  expect(comment_count).toBeGreaterThan(0);
  for (let i = 0; i < comment_count; i++) {
    await comments.nth(i).hover();
    await expect(
      files.locator(".hovered-comment-line").first(),
      "hovering a comment should highlight its lines",
    ).toBeVisible();
    await assert_no_contrast_violations(page, `${theme}: hovered comment ${i}`);
  }
  await page.mouse.move(0, 0);
  await expect(files.locator(".hovered-comment-line")).toHaveCount(0);
}

// Keyboard-select every line of each file so its tokens sit on the selection
// background, then cancel.
async function check_selected_background(page: Page, theme: string) {
  const panels = page.locator(".files .file-panel");
  const panel_count = await panels.count();
  for (let i = 0; i < panel_count; i++) {
    const lines = panels.nth(i).locator('[data-testid="code_line"]');
    const line_count = await lines.count();
    await lines.first().focus();
    for (let j = 0; j < line_count - 1; j++) {
      await page.keyboard.press("Shift+ArrowDown");
    }
    await expect(
      panels.nth(i).locator(".highlighted-region-line").first(),
      "keyboard selection should highlight the range",
    ).toBeVisible();
    await assert_no_contrast_violations(page, `${theme}: selected region ${i}`);
    await page.keyboard.press("Escape");
    await expect(panels.nth(i).locator(".highlighted-region-line")).toHaveCount(
      0,
    );
  }
}

async function ensure_light_theme(page: Page) {
  const containers = page.locator(".files .viewing-container.code-dark");
  if ((await containers.count()) > 0) {
    await page.locator(".files label.switch").click();
  }
  await expect(containers).toHaveCount(0);
}

// The toggle checkbox is visually hidden, so click its visible label wrapper.
async function switch_to_dark_theme(page: Page) {
  await page.locator(".files label.switch").click();
  await expect(
    page.locator(".files .viewing-container.code-dark").first(),
  ).toBeVisible();
}

async function check_in_light_and_dark(
  page: Page,
  check: (page: Page, theme: string) => Promise<void>,
) {
  await ensure_light_theme(page);
  await check(page, "light theme");
  await switch_to_dark_theme(page);
  await check(page, "dark theme");
}
