---
description: Typecheck → stage → conventional commit → push
---
1. npm run typecheck — abort if errors
2. git diff --stat
3. Write conventional commit: type(scope): message <72 chars
4. git add . && git commit -m "[message]" && git push
5. Print commit hash.
