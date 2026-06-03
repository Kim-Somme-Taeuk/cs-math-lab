import { expect, test } from "@playwright/test";

test("roadmap visually separates ready and planned chapters", async ({ page }) => {
  await page.goto("/roadmap");

  await expect.poll(() => page.locator("#discrete-math").evaluate((element) => (element as HTMLDetailsElement).open)).toBe(false);

  await page.locator("#discrete-math-title").click();
  const readyCard = page.getByTestId("chapter-logic");
  await expect(readyCard.getByText("완성")).toBeVisible();

  await page.locator("#discrete-math-level-2").click();
  const plannedCard = page.getByTestId("chapter-proof-techniques");
  await expect(plannedCard.getByText("예정").first()).toBeVisible();

  const readyClassName = await readyCard.evaluate((element) => element.className);
  const plannedClassName = await plannedCard.evaluate((element) => element.className);

  expect(readyClassName).not.toContain("border-dashed");
  expect(plannedClassName).toContain("border-dashed");
});

test("subject cards open the matching roadmap subject", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: /선형대수/ }).click();

  await expect(page).toHaveURL(/\/roadmap#linear-algebra$/);
  await expect.poll(() => page.locator("#linear-algebra").evaluate((element) => (element as HTMLDetailsElement).open)).toBe(true);
  await expect
    .poll(() =>
      page
        .locator("#linear-algebra-level-1")
        .locator("xpath=ancestor::details[1]")
        .evaluate((element) => (element as HTMLDetailsElement).open),
    )
    .toBe(true);
  await expect.poll(() => page.locator("#discrete-math").evaluate((element) => (element as HTMLDetailsElement).open)).toBe(false);
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

  const quiz = page.getByRole("region", { name: "문제 풀기" }).last();
  await expect(quiz.getByRole("button", { name: "채점하기" })).toBeDisabled();

  const questions = quiz.locator("fieldset");
  const correctAnswers = [
    "{ 1, 2, 3, 4, 5 }",
    "{ 3 }",
    "{ 1, 2 }",
    "{ 4, 5, 6 }",
    "아니다. 1과 2가 B에 없기 때문이다.",
    "같은 원소를 가지므로 같은 집합으로 볼 수 있다.",
    "합집합",
    "교집합",
    "이미 방문한 정점을 다시 처리하지 않기 위해서",
  ];

  for (const [index, answer] of correctAnswers.entries()) {
    await questions.nth(index).getByLabel(answer).check();
  }

  await quiz.getByRole("button", { name: "채점하기" }).click();
  await expect(quiz.getByText("9 / 9 정답")).toBeVisible();
  await expect(quiz.getByText("정답입니다.")).toHaveCount(9);
});
