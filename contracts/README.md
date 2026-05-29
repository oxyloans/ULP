# API Contracts

This folder is the source of truth for web-to-mobile API/domain contracts.

## Structure
- `contract-version.json`: version pin consumed by mobile app.
- `schemas/*.json`: domain-level request/response contracts.
- `changelog/*.md`: contract change logs.

## Rules
1. Breaking contract changes must bump **major** contract version.
2. Non-breaking additions bump **minor/patch** based on impact.
3. Every contract change must add/update changelog entry.
4. Web PR must include `Mobile Impact` section.

## Consumer
The mobile repository (`oxy-portfolio-mobile`) consumes these files via release artifact, package registry, or sync bot.
