# 1. lint-and-format

Date: 2024-01-29

## Status

In Review

## Context

The UI for LFAI needs to be formatted and then checked for that formatting (lint) automatically. This enables every developer to have common formatting across all js/ts files. This also reducing diffs in PR due to just formatting and not code changes. This needs to be integrated into CI.

---

### Formatting

---

#### ESLint

ESLint is a common js/ts formatting and development tool.

#### Prettier

While ESLint is a power full tool prettier is a commonly used opinionated code formatter. This will support a wide range of languages and integrates well with ESLint.

##### Pros of ESLint and Prettier

- Currently used across multiple Defense Unicorns svelte apps (company website)
- Ease the pain of developers through automation and integration to CI
- Widely used across the web development community

#### Cons of ESLint and Prettier

- Because these are development dependencies they will only run when a developer used it in their environment. Formatting is not done if updates to the codebase are done through GitHubs UI. A developer will need to `git checkout` branches created and edited in GitHub UI and run `npm run format`

---
