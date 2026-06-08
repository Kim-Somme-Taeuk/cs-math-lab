import { expect, test } from "@playwright/test";

test("roadmap links to subject pages", async ({ page }) => {
  await page.goto("/roadmap");

  await expect(page.getByRole("heading", { name: "컴공 수학 로드맵" })).toBeVisible();
  await expect(page.getByRole("link", { name: "시작", exact: true })).toHaveAttribute("href", "/subjects/discrete-math");
  await expect(page.getByRole("link", { name: /이산수학/ })).toHaveAttribute("href", "/subjects/discrete-math");
  await expect(page.getByRole("link", { name: /선형대수/ })).toHaveAttribute("href", "/subjects/linear-algebra");
});

test("subject page shows discrete math level 3 chapters as ready", async ({ page }) => {
  await page.goto("/subjects/discrete-math");

  const readyCard = page.getByRole("link", { name: /명제와 논리/ });
  await expect(readyCard.getByText("공개 중")).toBeVisible();

  const levelThreeReadyCard = page.getByRole("link", { name: /최단 경로 개념/ });
  await expect(levelThreeReadyCard.getByText("공개 중")).toBeVisible();

  const readyClassName = await readyCard.evaluate((element) => element.className);
  const levelThreeReadyClassName = await levelThreeReadyCard.evaluate((element) => element.className);

  expect(readyClassName).not.toContain("border-dashed");
  expect(levelThreeReadyClassName).not.toContain("border-dashed");
});

test("subject cards open the matching roadmap subject", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: /선형대수/ }).click();

  await expect(page).toHaveURL(/\/subjects\/linear-algebra$/);
  await expect(page.getByRole("heading", { name: "선형대수" })).toBeVisible();
  await expect(page.getByText("Level 1. 벡터와 행렬 입문")).toBeVisible();
  await expect(page.getByRole("link", { name: /벡터/ }).first().getByText("공개 중")).toBeVisible();
});

test("home ready chapters switch across all public subject levels", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "전체 공개 챕터" })).toBeVisible();
  await expect(page.getByText("Level 1. 전체 공개 챕터")).toBeVisible();
  await expect(page.getByRole("link", { name: "Level 1-1 명제와 논리" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Level 1-1 벡터" })).toBeVisible();

  await page.getByRole("button", { name: "다음 레벨" }).click();
  await expect(page.getByText("Level 2. 전체 공개 챕터")).toBeVisible();
  await expect(page.getByRole("link", { name: "Level 2-1 증명 기법" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Level 2-1 선형결합과 span" })).toBeVisible();

  await page.getByRole("button", { name: "다음 레벨" }).click();
  await expect(page.getByText("Level 3. 전체 공개 챕터")).toBeVisible();
  await expect(page.getByRole("link", { name: "Level 3-1 점근적 분석" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Level 3-1 좌표계와 변환 행렬" })).toBeVisible();
});

test("asymptotic analysis chapter is available", async ({ page }) => {
  await page.goto("/chapters/asymptotic-analysis");

  await expect(page.getByRole("heading", { name: "점근적 분석" })).toBeVisible();
  await expect(page.getByText("코드를 보고 성장률을 읽는 법")).toBeVisible();
  await expect(page.getByRole("region", { name: "문제 풀기" }).last()).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("chapter AI chatbot opens and sends chapter-scoped questions", async ({ page }) => {
  await page.route("**/api/ai/chat", async (route) => {
    const body = route.request().postDataJSON() as { slug: string; messages: Array<{ role: string; content: string }> };

    expect(body.slug).toBe("logic");
    expect(body.messages.at(-1)).toMatchObject({ role: "user", content: "명제 예시 알려줘" });

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        answer: "명제와 논리 챕터 자료 기준으로, 참과 거짓을 판단할 수 있는 문장이 명제입니다.",
        source: "fallback",
      }),
    });
  });

  await page.goto("/chapters/logic");

  await page.getByRole("button", { name: "AI 챗봇 열기" }).click();
  await expect(page.getByRole("region", { name: "AI 챗봇" })).toBeVisible();
  await page.getByLabel("AI 챗봇 질문").fill("명제 예시 알려줘");
  await page.getByRole("button", { name: "질문 보내기" }).click();

  await expect(page.getByText("명제와 논리 챕터 자료 기준으로")).toBeVisible();
});

test("mobile AI chatbot button sits above chapter navigation button", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile layout only");

  await page.goto("/chapters/logic");

  const aiBox = await page.getByRole("button", { name: "AI 챗봇 열기" }).boundingBox();
  const navBox = await page.locator("details summary").filter({ hasText: "챕터 이동 열기" }).boundingBox();

  expect(aiBox).not.toBeNull();
  expect(navBox).not.toBeNull();
  expect(aiBox!.y + aiBox!.height).toBeLessThan(navBox!.y);
});

test("recursion and recurrences chapter is available", async ({ page }) => {
  await page.goto("/chapters/recursion-recurrences");

  await expect(page.getByRole("heading", { name: "재귀와 점화식 심화" })).toBeVisible();
  await expect(page.getByText("재귀 코드를 보면 점화식으로 바꿀 수 있다")).toBeVisible();
  await expect(page.getByRole("region", { name: "재귀 코드 추적" })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("discrete probability chapter is available", async ({ page }) => {
  await page.goto("/chapters/discrete-probability");

  await expect(page.getByRole("heading", { name: "이산확률" })).toBeVisible();
  await expect(page.getByText("표본공간과 사건을 잡고 경우의 수로 확률을 읽는 법")).toBeVisible();
  await expect(page.getByRole("region", { name: "확률 실험" })).toBeVisible();
  await expect(page.getByRole("region", { name: "문제 풀기" }).last().getByText("0 / 10 응답")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("number theory chapter is available", async ({ page }) => {
  await page.goto("/chapters/number-theory");

  await expect(page.getByRole("heading", { name: "정수론 기초" })).toBeVisible();
  await expect(page.getByText("정수를 약수, 배수, 소수, gcd, lcm 관점으로 읽고 코드로 옮기는 감각")).toBeVisible();
  await expect(page.getByRole("region", { name: "정수론 판별" })).toBeVisible();
  await expect(page.getByRole("region", { name: "문제 풀기" }).last().getByText("0 / 10 응답")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("modular arithmetic chapter is available", async ({ page }) => {
  await page.goto("/chapters/modular-arithmetic");

  await expect(page.getByRole("heading", { name: "모듈러 연산" })).toBeVisible();
  await expect(page.getByText("큰 수를 그대로 들고 가지 않고, 필요한 나머지만 남겨서 구조를 읽는 법")).toBeVisible();
  await expect(page.getByRole("region", { name: "모듈러 실험" })).toBeVisible();
  await expect(page.getByRole("region", { name: "문제 풀기" }).last().getByText("0 / 10 응답")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("euclidean algorithm chapter is available", async ({ page }) => {
  await page.goto("/chapters/euclidean-algorithm");

  await expect(page.getByRole("heading", { name: "유클리드 알고리즘", exact: true })).toBeVisible();
  await expect(page.getByText("나머지를 반복해서 gcd 문제를 더 작은 gcd 문제로 바꾸는 감각")).toBeVisible();
  await expect(page.getByRole("region", { name: "유클리드 알고리즘 추적" })).toBeVisible();
  await expect(page.getByRole("region", { name: "문제 풀기" }).last().getByText("0 / 10 응답")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("boolean algebra chapter is available", async ({ page }) => {
  await page.goto("/chapters/boolean-algebra");

  await expect(page.getByRole("heading", { name: "부울 대수", exact: true })).toBeVisible();
  await expect(page.getByText("복잡한 조건식을 같은 의미의 더 단순한 형태로 읽는 법")).toBeVisible();
  await expect(page.getByRole("region", { name: "부울 대수 실험" })).toBeVisible();
  await expect(page.getByRole("region", { name: "문제 풀기" }).last().getByText("0 / 10 응답")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("dag topological sort chapter is available", async ({ page }) => {
  await page.goto("/chapters/dag-topological-sort");

  await expect(page.getByRole("heading", { name: "DAG와 위상 정렬" })).toBeVisible();
  await expect(page.getByText("방향 그래프에서 사이클이 없을 때, 의존성을 깨지 않는 순서를 만드는 법")).toBeVisible();
  await expect(page.getByRole("region", { name: "위상 정렬 실험" })).toBeVisible();
  await expect(page.getByRole("region", { name: "문제 풀기" }).last().getByText("0 / 10 응답")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("shortest paths chapter is available", async ({ page }) => {
  await page.goto("/chapters/shortest-paths");

  await expect(page.getByRole("heading", { name: "최단 경로 개념" })).toBeVisible();
  await expect(page.getByText("그래프의 거리 배열을 갱신하면서 출발점에서 각 정점까지의 최소 비용을 읽는 법")).toBeVisible();
  await expect(page.getByRole("region", { name: "최단 경로 실험" })).toBeVisible();
  await expect(page.getByRole("region", { name: "문제 풀기" }).last().getByText("0 / 10 응답")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("linear algebra vector chapter is available", async ({ page }) => {
  await page.goto("/chapters/vectors");

  await expect(page.getByRole("heading", { name: "벡터", exact: true })).toBeVisible();
  await expect(page.getByText("벡터를 계산 공식보다 위치, 방향, 특징을 표현하는 기본 단위로 읽는 법")).toBeVisible();
  await expect(page.getByRole("region", { name: "벡터 보기" })).toBeVisible();
  await expect(page.getByRole("region", { name: "문제 풀기" }).last().getByText("0 / 10 응답")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("linear algebra eigenvector intro chapter is available", async ({ page }) => {
  await page.goto("/chapters/eigenvectors-intro");

  await expect(page.getByRole("heading", { name: "고유값과 고유벡터 맛보기" })).toBeVisible();
  await expect(page.getByText("변환해도 방향이 바뀌지 않는 벡터와 그 크기 변화 정도를 알아보는 감각")).toBeVisible();
  await expect(page.getByRole("region", { name: "고유벡터 맛보기" })).toBeVisible();
  await expect(page.getByRole("region", { name: "문제 풀기" }).last().getByText("0 / 10 응답")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("linear algebra level 2 chapters are public on the subject page", async ({ page }) => {
  await page.goto("/subjects/linear-algebra");

  await expect(page.getByRole("heading", { name: "선형대수" })).toBeVisible();
  await expect(page.getByText("Level 2. 선형공간과 변환")).toBeVisible();
  await expect(page.getByRole("link", { name: /선형결합과 span/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /고유값과 대각화/ })).toBeVisible();
});

test("linear algebra span chapter is available", async ({ page }) => {
  await page.goto("/chapters/linear-combination-span");

  await expect(page.getByRole("heading", { name: "선형결합과 span" })).toBeVisible();
  await expect(page.getByText("벡터들이 만들 수 있는 방향과 영역을 읽는 법")).toBeVisible();
  await expect(page.getByRole("region", { name: "span 판별" })).toBeVisible();
  await expect(page.getByRole("region", { name: "문제 풀기" }).last().getByText("0 / 10 응답")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("linear algebra diagonalization chapter is available", async ({ page }) => {
  await page.goto("/chapters/eigen-diagonalization");

  await expect(page.getByRole("heading", { name: "고유값과 대각화" })).toBeVisible();
  await expect(page.getByText(/복잡한 선형변환을 고유벡터 방향 기준으로 보면/)).toBeVisible();
  await expect(page.getByRole("region", { name: "대각화 맛보기" })).toBeVisible();
  await expect(page.getByRole("region", { name: "문제 풀기" }).last().getByText("0 / 10 응답")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("linear algebra level 3 chapters are public on the subject page", async ({ page }) => {
  await page.goto("/subjects/linear-algebra");

  await expect(page.getByRole("heading", { name: "선형대수" })).toBeVisible();
  await expect(page.getByText("Level 3. 컴공 응용")).toBeVisible();
  await expect(page.getByRole("link", { name: /좌표계와 변환 행렬/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /신경망의 선형 계층/ })).toBeVisible();
});

test("linear algebra coordinate systems chapter is available", async ({ page }) => {
  await page.goto("/chapters/coordinate-systems-transform-matrices");

  await expect(page.getByRole("heading", { name: "좌표계와 변환 행렬" })).toBeVisible();
  await expect(page.getByText(/행렬을 숫자 표가 아니라 좌표계를 바꾸고/)).toBeVisible();
  await expect(page.getByRole("region", { name: "좌표계 변환 실험" })).toBeVisible();
  await expect(page.getByRole("region", { name: "문제 풀기" }).last().getByText("0 / 10 응답")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("linear algebra neural network linear layer chapter is available", async ({ page }) => {
  await page.goto("/chapters/neural-network-linear-layers");

  await expect(page.getByRole("heading", { name: "신경망의 선형 계층" })).toBeVisible();
  await expect(page.getByText(/가중치 행렬을 입력 특징을 섞어/)).toBeVisible();
  await expect(page.getByRole("region", { name: "선형 계층 실험" })).toBeVisible();
  await expect(page.getByRole("region", { name: "문제 풀기" }).last().getByText("0 / 10 응답")).toBeVisible();

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
