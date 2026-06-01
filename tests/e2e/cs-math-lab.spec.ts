import { expect, test } from "@playwright/test";

test("roadmap visually separates ready and draft chapters", async ({ page }) => {
  await page.goto("/roadmap");

  const readyCard = page.getByTestId("chapter-logic");
  const draftCard = page.getByTestId("chapter-functions");

  await expect(readyCard.getByText("완성")).toBeVisible();
  await expect(draftCard.getByText("초안")).toBeVisible();

  const readyBackground = await readyCard.evaluate((element) => getComputedStyle(element).backgroundColor);
  const draftBackground = await draftCard.evaluate((element) => getComputedStyle(element).backgroundColor);
  const draftClassName = await draftCard.evaluate((element) => element.className);

  expect(readyBackground).not.toBe(draftBackground);
  expect(draftClassName).toContain("bg-slate-100");
});

test("logic interaction updates basic operators and stays within mobile width", async ({ page }) => {
  await page.goto("/chapters/logic");

  const playground = page.getByRole("region", { name: "진리표 실험" });
  await expect(playground.getByRole("cell", { name: "P AND Q" })).toBeVisible();
  await expect(playground.getByRole("row", { name: /P AND Q/ })).toContainText("거짓");

  await playground.getByRole("button", { name: /명제 Q/ }).click();
  await expect(playground.getByRole("row", { name: /P AND Q/ })).toContainText("참");

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("conditional interaction focuses on implication violation", async ({ page }) => {
  await page.goto("/chapters/conditionals");

  const playground = page.getByRole("region", { name: "조건문 실험" });
  await expect(playground.getByText(/P -> Q =/)).toContainText("거짓");
  await expect(playground.getByText(/약속을 직접 어긴 사례/)).toBeVisible();

  await playground.getByRole("button", { name: /결론 Q/ }).click();
  await expect(playground.getByText(/P -> Q =/)).toContainText("참");
});

test("set playground calculates set operations correctly", async ({ page }) => {
  await page.goto("/chapters/sets");

  const playground = page.getByRole("region", { name: "집합 연산 실험" });
  await expect(playground.getByText("결과 = { 1, 2, 3, 4, 5 }")).toBeVisible();

  await playground.getByRole("button", { name: "A ∩ B" }).click();
  await expect(playground.getByText("결과 = { 3 }")).toBeVisible();

  await playground.getByRole("button", { name: "A - B" }).click();
  await expect(playground.getByText("결과 = { 1, 2 }")).toBeVisible();

  await playground.getByRole("button", { name: "Aᶜ" }).click();
  await expect(playground.getByText("결과 = { 4, 5, 6 }")).toBeVisible();
});

test("multiple choice quiz scores submitted answers", async ({ page }) => {
  await page.goto("/chapters/sets");

  const quiz = page.getByRole("region", { name: "손풀이 문제" });
  await expect(quiz.getByRole("button", { name: "채점하기" })).toBeDisabled();

  const questions = quiz.locator("fieldset");
  await questions.nth(0).getByLabel("{ 1, 2, 3, 4, 5 }").check();
  await questions.nth(1).getByLabel("{ 3 }").check();
  await questions.nth(2).getByLabel("{ 1, 2 }").check();
  await questions.nth(3).getByLabel("{ 4, 5, 6 }").check();

  await quiz.getByRole("button", { name: "채점하기" }).click();
  await expect(quiz.getByText("4 / 4 정답")).toBeVisible();
  await expect(quiz.getByText("정답입니다.")).toHaveCount(4);
});
