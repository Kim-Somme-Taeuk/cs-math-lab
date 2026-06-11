# Codex Harness

Use this document when modifying code, lesson content, routes, UI, or interactive learning widgets in cs-math-lab.

This file extends the core rules in `AGENTS.md`. Do not treat it as permission to make broad refactors.

## Verification Priority

Before finishing a task, run the strongest available verification path.

Prefer this order:

1. `npm run verify`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run build`
5. `npm run validate:content`, if available
6. `npm run validate:math`, if available
7. `npm run test:e2e`, if available

If a command does not exist, report it clearly. Do not invent successful results.

## Content Validation

When changing lesson data, chapter data, roadmap data, navigation data, or route-related content, check:

- IDs are unique.
- Routes/slugs are unique.
- Subject, level, chapter, and section references are valid.
- Lessons and sections are not empty.
- Navigation entries point to existing content.
- Previous/next links point to existing chapters.
- Prerequisite references point to existing lessons or chapters.
- No orphaned content exists outside the navigation flow unless intentionally unused.

## Math Validation

When changing mathematical notation, formulas, examples, or exercises, check:

- Inline math delimiters are balanced.
- Block math delimiters are balanced.
- Math blocks are not empty.
- LaTeX escaping is not obviously broken.
- Rendered formulas do not expose raw broken syntax to the user.
- JSX string escaping does not break backslashes or braces.

## UX Smoke Checks

When changing UI, layout, routing, navigation, or interactive components, check:

- Homepage loads.
- Roadmap pages load.
- Changed subject pages load.
- Changed chapter pages load.
- Desktop layout is usable.
- Mobile layout is usable.
- No visible `undefined`, `NaN`, or `[object Object]`.
- No obvious 404 or broken route.
- No obvious console error caused by the change.

## Interactive Learning Widgets

When changing or adding interactive widgets, verify:

- Controls are usable.
- Interaction changes visible output.
- Explanations update after input.
- Initial state is meaningful.
- Invalid or edge-case input does not crash the page.
- Mobile interaction remains usable.
- The widget teaches the concept; it is not decorative.

## Learning Content Quality

For changed lessons, check:

- The definition is clear.
- The intuition is explained.
- At least one concrete example exists.
- CS relevance is explicit.
- Exercises match the level.
- Difficulty progression is reasonable.
- The chapter does not assume unstated prerequisites.

## Reporting

In the final response, mention:

- Which verification commands were run.
- Which checks passed.
- Which checks were skipped and why.
- Any remaining risks.
