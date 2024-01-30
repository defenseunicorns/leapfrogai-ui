# 1. lint-and-format

Date: 2024-01-29

## Status

In Review

## Context

The UI for LFAI needs to be tested thoroughly. We need a series of robust tests so we can be more confident in our software updates to this repository to ensure pages and links render correctly.

---

### UI Testing

---

#### Playwright

Playwright is a testing framework that enables end-to-end testing for modern web apps. Playwright also tests UI.

##### Pros of Playwright

- Cross-browser: supports multiple browsers including Chromium, Firefox, and WebKit. This enables you to test your application on different browser engines, ensuring compatibility.
- Debugging: Playwright has an easy to use debugging console that steps through pages as test run
- Parallel Test Execution: Runs test concurrently and reduces overall test time. Also useful to ensure your testing paradigm isn't broken (tests could pass or fail depending on order)

#### Cons Playwright

- Resource intensive: CI time to install playwright and run test can be time intensive. This can partially be mitigated by running playwright in CI with a container.
- Potentially learning curve, although well documented and easy to understand.

---
