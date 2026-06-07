import { expect, test } from "@playwright/test";

test("roadmap links to subject pages", async ({ page }) => {
  await page.goto("/roadmap");

  await expect(page.getByRole("heading", { name: "컴공 수학 로드맵" })).toBeVisible();
  await expect(page.getByRole("link", { name: "시작", exact: true })).toHaveAttribute("href", "/subjects/discrete-math");
  await expect(page.getByRole("link", { name: /이산수학/ })).toHaveAttribute("href", "/subjects/discrete-math");
  await expect(page.getByRole("link", { name: /선형대수/ })).toHaveAttribute("href", "/subjects/linear-algebra");
});

test("subject page visually separates ready and planned chapters", async ({ page }) => {
  await page.goto("/subjects/discrete-math");

  const readyCard = page.getByRole("link", { name: /명제와 논리/ });
  await expect(readyCard.getByText("공개 중")).toBeVisible();

  const plannedCard = page.locator("li").filter({ hasText: "이산확률" }).locator("div").first();
  await expect(plannedCard.getByText("예정").first()).toBeVisible();

  const readyClassName = await readyCard.evaluate((element) => element.className);
  const plannedClassName = await plannedCard.evaluate((element) => element.className);

  expect(readyClassName).not.toContain("border-dashed");
  expect(plannedClassName).toContain("border-dashed");
});

test("subject cards open the matching roadmap subject", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: /선형대수/ }).click();

  await expect(page).toHaveURL(/\/subjects\/linear-algebra$/);
  await expect(page.getByRole("heading", { name: "선형대수" })).toBeVisible();
  await expect(page.getByText("Level 1. 벡터와 행렬 입문")).toBeVisible();
});

test("home ready chapters switch by discrete math level", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Level 1. 입문")).toBeVisible();
  await expect(page.getByRole("link", { name: /명제와 논리/ })).toBeVisible();

  await page.getByRole("button", { name: "다음 레벨" }).click();
  await expect(page.getByText("Level 2. 핵심 확장")).toBeVisible();
  await expect(page.getByRole("link", { name: /증명 기법/ })).toBeVisible();

  await page.getByRole("button", { name: "다음 레벨" }).click();
  await expect(page.getByText("Level 3. 컴공 응용")).toBeVisible();
  await expect(page.getByRole("link", { name: /점근적 분석/ })).toBeVisible();
});

test("asymptotic analysis chapter is available", async ({ page }) => {
  await page.goto("/chapters/asymptotic-analysis");

  await expect(page.getByRole("heading", { name: "점근적 분석" })).toBeVisible();
  await expect(page.getByText("코드를 보고 성장률을 읽는 법")).toBeVisible();
  await expect(page.getByRole("region", { name: "문제 풀기" }).last()).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("recursion and recurrences chapter is available", async ({ page }) => {
  await page.goto("/chapters/recursion-recurrences");

  await expect(page.getByRole("heading", { name: "재귀와 점화식 심화" })).toBeVisible();
  await expect(page.getByText("재귀 코드를 보면 점화식으로 바꿀 수 있다")).toBeVisible();
  await expect(page.getByRole("region", { name: "재귀 코드 추적" })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("logic interaction updates basic operators and stays within mobile width", async ({ page }) => {
  await page.goto("/chapters/logic");

  await expect(page.locator("#practice")).toBeVisible();
  await expect(page.locator('a[href="#practice"]').first()).toBeAttached();

  const playground = page.getByRole("region", { name: "진리표 실험" });
  await expect.poll(() => playground.evaluate((element) => (element as HTMLElement).innerText)).toContain("거짓");

  await playground.getByRole("button", { name: /^(명제 )?Q\b/ }).click();
  await expect.poll(() => playground.evaluate((element) => (element as HTMLElement).innerText)).toContain("참");

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("conditional interaction focuses on implication violation", async ({ page }) => {
  await page.goto("/chapters/conditionals");

  const playground = page.getByRole("region", { name: "조건문 실험" });
  await expect(playground.getByText(/P가 참인데 Q가 거짓/)).toBeVisible();

  await playground.getByRole("button", { name: /결론 Q/ }).click();
  await expect(playground.getByText(/약속이 지켜졌으므로/)).toBeVisible();
});

test("set playground calculates set operations correctly", async ({ page }) => {
  await page.goto("/chapters/sets");

  const playground = page.getByRole("region", { name: "집합 연산 실험" });
  await expect(playground.getByText("결과 = { 2, 4, 5, 6 }")).toBeVisible();

  await playground.getByRole("button", { name: "A ∩ B" }).click();
  await expect(playground.getByText("결과 = { 4, 6 }")).toBeVisible();

  await playground.getByRole("button", { name: "A - B" }).click();
  await expect(playground.getByText("결과 = { 2 }")).toBeVisible();

  await playground.getByRole("button", { name: "소수" }).first().click();
  await expect(playground.getByText("결과 = { 2, 3 }")).toBeVisible();
});

test("multiple choice quiz scores submitted answers", async ({ page }) => {
  await page.goto("/chapters/sets");

  const quiz = page.getByRole("region", { name: "문제 풀기" }).last();
  await expect(quiz.getByRole("button", { name: "채점하기" })).toBeDisabled();

  const correctAnswers = [
    "{ 1, 2, 3, 4, 5 }",
    "{ 4 }",
    "{ 3, 4 }",
    "{ 4, 5, 6 }",
    "맞다. { 2, 3 }의 모든 원소가 A에 있다.",
    "같은 원소를 가지므로 같은 집합으로 볼 수 있다.",
    "합집합",
    "교집합",
    "필요한 권한이 모두 부여되어 있다.",
    "이미 처리한 대상을 빠르게 확인하기 위해",
  ];

  for (const [index, answer] of correctAnswers.entries()) {
    await quiz.getByLabel(answer).check();
    if (index < correctAnswers.length - 1) {
      await quiz.getByRole("button", { name: "다음" }).click();
    }
  }

  await quiz.getByRole("button", { name: "채점하기" }).click();
  await expect(quiz.getByText("10 / 10 정답")).toBeVisible();
  await expect(quiz.getByText("맞았습니다.")).toBeVisible();
});
