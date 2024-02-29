# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0](https://github.com/defenseunicorns/leapfrog-ui/compare/v0.3.0) (2024-02-23)

## What's Changed
* Feat: Migrate to UDS Deployment by @YrrepNoj in https://github.com/defenseunicorns/leapfrogai-ui/pull/107
* Feat: RAG Admin Route by @gphorvath in https://github.com/defenseunicorns/leapfrogai-ui/pull/102
* Feat: Chat with RAG by @gphorvath in https://github.com/defenseunicorns/leapfrogai-ui/pull/112
* Fix: Adds CSS to fix hovering scroll bar at the bottom of the page by @CollectiveUnicorn in https://github.com/defenseunicorns/leapfrogai-ui/pull/105
* Fix: Check if concurrentRequests var is undefined by @YrrepNoj in https://github.com/defenseunicorns/leapfrogai-ui/pull/106
* Fix: incorrect images, model and tags by @justinthelaw in https://github.com/defenseunicorns/leapfrogai-ui/pull/108
* Fix: branding and add back transcribe tab by @gphorvath in https://github.com/defenseunicorns/leapfrogai-ui/pull/111
* Fix: Update OSSF Scorecard Badge by @gphorvath in https://github.com/defenseunicorns/leapfrogai-ui/pull/127
* Fix: removed erroneous F from default route by @gphorvath in https://github.com/defenseunicorns/leapfrogai-ui/pull/129

**Full Changelog**: https://github.com/defenseunicorns/leapfrogai-ui/compare/v0.2.0...v0.3.0

## [0.2.0](https://github.com/defenseunicorns/leapfrog-ui/compare/v0.2.0...v0.3.0) (2024-01-31)

## What's Changed
* changed from crypto to uuidv4 so that http works by @gphorvath in https://github.com/defenseunicorns/leapfrog-ui/pull/35
* Change default theme by @gphorvath in https://github.com/defenseunicorns/leapfrog-ui/pull/38
* Formating changes for the UI by @gphorvath in https://github.com/defenseunicorns/leapfrog-ui/pull/41
* Bump flowbite-svelte from 0.44.15 to 0.44.21 by @dependabot in https://github.com/defenseunicorns/leapfrog-ui/pull/37
* dependency updates by @gphorvath in https://github.com/defenseunicorns/leapfrog-ui/pull/44
* Move divs of panels to be more uniformed and remove bottom border on … by @gphorvath in https://github.com/defenseunicorns/leapfrog-ui/pull/46
* Refactor UI into components by @gphorvath in https://github.com/defenseunicorns/leapfrog-ui/pull/47
* Reverts changes to istio route configs by @CollectiveUnicorn in https://github.com/defenseunicorns/leapfrog-ui/pull/51
* Persona refactor by @gphorvath in https://github.com/defenseunicorns/leapfrog-ui/pull/66
* Fixes uuid discrepancy for new chats and styling issue by @CollectiveUnicorn in https://github.com/defenseunicorns/leapfrog-ui/pull/74
* Fixes failure to create new conversations on deletion of old conversations by @CollectiveUnicorn in https://github.com/defenseunicorns/leapfrog-ui/pull/75
* Adds switch to last conversation upon delete by @CollectiveUnicorn in https://github.com/defenseunicorns/leapfrog-ui/pull/76
* add CODEOWNERS file by @YrrepNoj in https://github.com/defenseunicorns/leapfrog-ui/pull/67
* Create scorecard.yml by @gphorvath in https://github.com/defenseunicorns/leapfrog-ui/pull/77
* techdebt: issue template by @fingermustache in https://github.com/defenseunicorns/leapfrog-ui/pull/86
* Add Gato to codeowners by @gphorvath in https://github.com/defenseunicorns/leapfrog-ui/pull/94
* Chat container refactor by @gphorvath in https://github.com/defenseunicorns/leapfrog-ui/pull/84
* 69: Workflows for publishing release artifacts by @YrrepNoj in https://github.com/defenseunicorns/leapfrog-ui/pull/85
* Queue llm requests by @CollectiveUnicorn in https://github.com/defenseunicorns/leapfrog-ui/pull/95

## New Contributors
* @YrrepNoj made their first contribution in https://github.com/defenseunicorns/leapfrog-ui/pull/67
* @fingermustache made their first contribution in https://github.com/defenseunicorns/leapfrog-ui/pull/86

**Full Changelog**: https://github.com/defenseunicorns/leapfrog-ui/compare/v0.1.0...v0.2.0

## [0.1.0](https://github.com/defenseunicorns/leapfrog-ui/compare/v0.1.0...v0.2.0) (2023-12-15)

## What's Changed
* Bump postcss from 8.4.30 to 8.4.31 by @dependabot in https://github.com/defenseunicorns/leapfrog-ui/pull/1
* Bump zod from 3.22.2 to 3.22.4 by @dependabot in https://github.com/defenseunicorns/leapfrog-ui/pull/2
* [LFAI #200] Feature(Chats): Persist conversations across user sessions by @justinthelaw in https://github.com/defenseunicorns/leapfrog-ui/pull/4
* Fix theme by @gphorvath in https://github.com/defenseunicorns/leapfrog-ui/pull/7
* Changes loading indicator to be a status indicator instead of a spinner by @CollectiveUnicorn in https://github.com/defenseunicorns/leapfrog-ui/pull/8
* change streaming response from content to delta by @gerred in https://github.com/defenseunicorns/leapfrog-ui/pull/19
* 18 - Fixes model selection and switches to typescript by @CollectiveUnicorn in https://github.com/defenseunicorns/leapfrog-ui/pull/20
* 12 - Create zarf package by @CollectiveUnicorn in https://github.com/defenseunicorns/leapfrog-ui/pull/24
* Moves openai variables so that they load at runtime by @CollectiveUnicorn in https://github.com/defenseunicorns/leapfrog-ui/pull/25
* Improves spacing and formatting between conversations and buttons by @CollectiveUnicorn in https://github.com/defenseunicorns/leapfrog-ui/pull/29
* Adds route for redirect to prevent errors on apply by @CollectiveUnicorn in https://github.com/defenseunicorns/leapfrog-ui/pull/31
* Adds markdown and code formatting to chat by @CollectiveUnicorn in https://github.com/defenseunicorns/leapfrog-ui/pull/32
* Fix /chat/ k8s gateway routing by @justinthelaw in https://github.com/defenseunicorns/leapfrog-ui/pull/33

## New Contributors
* @dependabot made their first contribution in https://github.com/defenseunicorns/leapfrog-ui/pull/1
* @gphorvath made their first contribution in https://github.com/defenseunicorns/leapfrog-ui/pull/7
* @CollectiveUnicorn made their first contribution in https://github.com/defenseunicorns/leapfrog-ui/pull/8
* @gerred made their first contribution in https://github.com/defenseunicorns/leapfrog-ui/pull/19

**Full Changelog**: https://github.com/defenseunicorns/leapfrog-ui/commits/v0.1.0
