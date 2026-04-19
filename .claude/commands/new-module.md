---
description: Scaffold a new feature module (tasks, habits, notes, etc.)
---
Create src/modules/$ARGUMENTS/ with:
- components/.gitkeep
- hooks/.gitkeep
- store/[name]Store.ts     ← Zustand with persist + devtools + immer
- db/[name].dexie.ts       ← useLiveQuery hooks
- schema/[name].schema.ts  ← Zod schemas matching ECOSYSTEM.md
- types/[name].types.ts    ← z.infer<> exports
- CLAUDE.md                ← module context (10 lines)
- index.ts                 ← barrel exports

Then: git add . && git commit -m "chore($ARGUMENTS): scaffold module" && git push
