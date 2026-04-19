---
name: git-workflow
description: Git workflow for StayFlow.
  Triggers: "commit", "push", "PR", "branch", "merge", "git".
---

# Git Workflow

## Commit Sequence
npm run typecheck     ← must pass
git add .
git commit -m "type(scope): message <72 chars"
git push origin develop
# then update COORDINATION.md

## Types × Scopes
feat(dashboard|finance|tasks|habits|notes|pwa|db|auth|ui|ci): new feature
fix|refactor|test|docs|chore|perf — same scopes

## Branches
develop → daily commits (all work goes here)
main    → PRs from develop only (production releases)

## PR
gh pr create --base main --head develop \
  --title "feat: description" \
  --body "$(cat .github/PR_TEMPLATE.md)"
