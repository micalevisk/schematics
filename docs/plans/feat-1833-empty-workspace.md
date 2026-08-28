# Empty workspace (`--no-create-application`) — implementation plan

Issue: https://github.com/nestjs/schematics/issues/1833
Branch: `feat/issue-1833`

## Goal

Let users scaffold a monorepo workspace directly, without first generating a
standard-mode application that `nest g app` then has to convert and relocate:

```bash
nest new my-workspace --no-create-application
cd my-workspace
nest g app api
nest g app worker
```

Mirrors `ng new --no-create-application`. Two user-visible wins:

1. No "generate it wrong, then rewrite it" step.
2. The workspace name is decoupled from the first application's name (today
   `sub-app.factory.ts#getAppNameFromPackageJson()` forces them to match).

## Current behaviour (verified on `master`, v12.x)

- `src/lib/application/schema.json` has no such option; every `nest new`
  produces `src/`, `test/`, and a `nest-cli.json` with `sourceRoot: "src"` and
  no `monorepo` key.
- Monorepo mode is reachable *only* by conversion, in
  `src/lib/sub-app/sub-app.factory.ts:47`: when `isMonorepo(tree)` is false it
  merges `generateWorkspace()` and then `moveDefaultAppToApps()` physically
  moves `src/` and `test/` into `apps/<pkg-name>/`.
- The conversion also rewrites the root tsconfig into solution style
  (`updateTsConfig`, `:143`), flips `compilerOptions.builder` to `rspack` and
  rewrites `root`/`sourceRoot`/`tsConfigPath` (`updateMainAppOptions`, `:391`),
  and rewrites `format` / `start:prod` / `test:e2e` scripts plus jest roots
  (`updatePackageJson`, `:205`).

Important: **the sub-app side already tolerates an empty monorepo.**
`isMonorepo()` returns true as soon as `nest-cli.json` has `"monorepo": true`,
so the conversion branch is skipped; `updateMainAppOptions()` returns early for
the same reason; and `addAppsToCliOptions()` creates `projects` if missing and
appends. So this feature is almost entirely about *generation*, not about new
sub-app logic. That should be asserted by a test rather than assumed.

## Design decisions

### Option name and surface

Add to `src/lib/application/schema.json`:

```json
"createApplication": {
  "type": "boolean",
  "default": true,
  "description": "Create a new application in the workspace. Use --no-create-application for an empty monorepo workspace."
}
```

Angular-compatible spelling: the CLI turns `--no-create-application` into
`createApplication: false` automatically, so no CLI-side change is needed for
the flag itself.

Interaction with existing prompts: when `createApplication` is `false` the
`type` (esm/cjs) prompt still matters — it decides the workspace's module
system and test runner — so keep it. `spec` / `specFileSuffix` / `observe`
become no-ops for the workspace itself but are still meaningful defaults
inherited by later `nest g app`; leave them alone, do not error on them.

### What an empty workspace contains

For `ts-esm` (the default) at workspace root:

```
my-workspace/
  .gitignore
  .prettierrc
  README.md
  nest-cli.json
  oxlint.json
  package.json
  tsconfig.json
```

No `src/`, no `test/`, no `tsconfig.build.json`, no `vitest.config.ts` /
`vitest.config.e2e.ts` (those are per-app in monorepo mode and get written by
`nest g app`).

`nest-cli.json`:

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "monorepo": true,
  "projects": {},
  "compilerOptions": {
    "deleteOutDir": true,
    "builder": "rspack"
  }
}
```

Deliberately **no top-level `root` / `sourceRoot` / `entryFile`** — there is no
default project. `builder: "rspack"` matches what `updateMainAppOptions()`
writes during conversion, so a converted workspace and a natively-empty one end
up identical.

`tsconfig.json` — solution style from the start, matching the post-conversion
shape produced by `updateTsConfig()`:

```json
{
  "compilerOptions": { ... same as the app template, minus outDir/incremental? see note ... },
  "files": [],
  "references": []
}
```

Note to resolve during implementation: `updateTsConfig()` only deletes
`baseUrl`, `include`, `exclude` and adds `files`/`references`; it leaves
`outDir`/`incremental` in place. Keep the same set of `compilerOptions` as the
app template so the two paths converge exactly — verify by diffing a converted
workspace against a natively-empty one (see Phase 5).

`package.json` — workspace-shaped, not app-shaped. Drop `start`, `start:dev`,
`start:debug`, `start:prod`, `test`, `test:watch`, `test:cov`, `test:debug`,
`test:e2e` (all of which assume a single root app), keep `build`, `format`,
`lint`, `deploy`. Keep the runtime deps (`@nestjs/common`, `@nestjs/core`,
`@nestjs/platform-express`, `reflect-metadata`, `rxjs`) and devDeps so that
`nest g app` produces something runnable without a second `npm i`.

`format` / `lint` globs must target `apps/`+`libs/` rather than `src/`+`test/`,
matching what `updateNpmScripts()` rewrites them to during conversion.

### Where the templates live

`generate()` in `application.factory.ts:87` picks
`./files/{ts-esm|ts|js}`. Add a sibling tree:

```
src/lib/application/workspace/ts-esm/...
src/lib/application/workspace/ts/...
src/lib/application/workspace/js/...
```

`workspace/` (not a fourth `files/` variant) so the existing build globs pick
it up unchanged — `copy:lib`, `clean` and `lint` in `package.json` all already
special-case `{files,workspace}`. Confirm that before relying on it.

`js` variant: workspace root gets `.babelrc`, `jsconfig.json`, `nodemon.json`,
`package.json`, `nest-cli.json`, `README.md`, `.gitignore`, `.prettierrc`;
no `index.js`, no `src/`.

## Phases

Each phase ends green: `npm run lint && npm run typecheck && npm test`.

### Phase 1 — schema + types

- `src/lib/application/schema.json`: add `createApplication` (default `true`).
- `src/lib/application/application.schema.d.ts`: add
  `createApplication?: boolean`.
- In `transform()` (`application.factory.ts:38`), default it:
  `target.createApplication = target.createApplication ?? true;` — same reason
  as the existing `observe` line: the factory can be invoked directly, bypassing
  schema defaults.

No behaviour change yet; `main()` still always uses `files/`.

### Phase 2 — workspace templates

Add `src/lib/application/workspace/{ts-esm,ts,js}/` per the layout above.
Start from the corresponding `files/` template and strip, so ejs variables
(`<%= name %>`, `<%= version %>`, `<%= strict %>`, `<% if (observe) %>`, …)
keep working identically.

Verify the built package actually ships them:

```bash
npm run build && ls dist/lib/application/workspace/ts-esm
```

### Phase 3 — factory branch

In `generate()`, choose the source tree:

```ts
const rootDir = options.createApplication === false ? './workspace' : './files';
```

and skip the spec `filter()` when there are no spec files to filter. Keep
`move(path)` and the `formatFiles()` chaining unchanged.

### Phase 4 — tests (`application.factory.test.ts`)

New `describe('when createApplication is false')` covering, for each of
`ts-esm` / `cjs` / `js`:

- exact `tree.files` list (no `src/`, no `test/`) — follow the existing
  `expect(files.sort()).toEqual([...].sort())` style;
- `nest-cli.json` has `monorepo: true`, `projects: {}`, and **no** `root` /
  `sourceRoot` / `entryFile` keys;
- `tsconfig.json` has `files: []`, `references: []`, and no `baseUrl` /
  `include` / `exclude`;
- `package.json` has no `start*` / `test*` scripts and `format` targets
  `apps/`+`libs/`.

### Phase 5 — end-to-end: empty workspace + `nest g app`

The load-bearing test. In `sub-app.factory.test.ts`, run `application` with
`createApplication: false`, then run `sub-app` on the resulting tree, and assert:

- no conversion side effects fire (nothing is moved; `moveDefaultAppToApps` is
  skipped — note it is already a no-op under `NODE_ENV=test`, so assert on the
  *file list* and on `nest-cli.json`, not on the function);
- `nest-cli.json` gains exactly one entry under `projects` and still has no
  top-level `root`/`sourceRoot`;
- the generated `apps/<name>/` tree is byte-identical to what the conversion
  path produces for the same app name;
- root `tsconfig.json` gains `./apps/<name>/tsconfig.app.json` in `references`
  and nothing else.

Then a **convergence check**: `nest new w && nest g app a` vs
`nest new w --no-create-application && nest g app a` should differ only in the
absence of the first app. Do this once, manually, with a real `@nestjs/cli`
link, and record any intentional divergence in this file.

### Phase 6 — CLI-side follow-ups (out of scope here, file separately)

`@nestjs/cli` needs to behave sanely in a zero-project workspace:

- `nest build` / `nest start` with no default project and empty `projects` —
  today they resolve the "default" project from `nest-cli.json`'s top-level
  `root`/`sourceRoot`, which an empty workspace does not have. Expected outcome
  is a clear error ("no project specified and the workspace has no default
  project"), not a crash. Verify and open an issue on `nestjs/cli` if it
  crashes.
- Confirm the CLI actually forwards `--no-create-application` to the schematic
  (it passes unknown flags through, but this needs checking against
  `nest new`'s own option parsing, which whitelists some flags).

This plan intentionally does not change `@nestjs/cli`; the schematic must be
correct on its own and the CLI gaps tracked separately.

## Risks / open questions

- **Template drift.** A fourth+fifth+sixth template tree means the ESM/CJS/JS
  matrix now has six roots to keep in sync. Mitigation: generate the workspace
  templates by stripping the app templates, and add a test that asserts the
  shared files (`.prettierrc`, `oxlint.json`, `.gitignore`) are identical
  between `files/<x>` and `workspace/<x>`.
- **Two paths to one shape.** If the empty-workspace output and the converted
  output diverge, users hit subtle differences depending on how they got there.
  Phase 5's convergence check is the guard; if divergence is unavoidable,
  prefer changing the *conversion* to match the new canonical shape.
- **Docs.** `docs.nestjs.com/cli/monorepo` explicitly documents the
  start-in-standard-mode flow. A docs PR against `nestjs/docs.nestjs.com`
  should land with this.
- **Scope creep.** Do not attempt to decouple `libs/` or change
  `DEFAULT_APPS_PATH` handling in this change.

---

## Implementation notes / deviations from the plan as drafted

Recorded during implementation (Phase 5 asks for intentional divergence to be
written down here).

### 1. Root test-runner configs and `test*` scripts are KEPT

The draft said to drop `vitest.config.ts` / `vitest.config.e2e.ts` and every
`test*` script because "those are per-app in monorepo mode and get written by
`nest g app`". **That is not true of this repo:**

- `src/lib/sub-app/files/ts/` contains only `src/`, `test/app.e2e-spec.ts`,
  `test/jest-e2e.json` and `tsconfig.app.json` — it generates no vitest or jest
  root config.
- `files/ts-esm/vitest.config.ts` already uses `root: './'` with
  `include: ['**/*.spec.ts']`, and `vitest.config.e2e.ts` the same with
  `**/*.e2e-spec.ts`. Both are workspace-scoped and keep working verbatim after
  conversion.
- `files/ts/jest.config.ts` already has
  `collectCoverageFrom: ['src/**', 'libs/**', 'apps/**']` and `rootDir: '.'` —
  explicitly monorepo-aware.

Dropping them would leave `nest g app api` generating `api.controller.spec.ts`
files with no runner, and would make the empty path diverge from the converted
path — exactly what the Phase 5 convergence check is meant to prevent.

So the workspace templates keep the root runner config and the workspace-scoped
scripts (`test`, `test:watch`, `test:cov`, `test:debug`, and `test:e2e` for
`ts-esm`).

### 2. `test:e2e` IS dropped for `ts` and `js`

Under jest the e2e config genuinely *is* per-app: `test/jest-e2e.json` is
emitted by the sub-app schematic into `apps/<name>/test/`, and there is no
root-level equivalent. A root `test:e2e` in an empty workspace would point at a
`./test/jest-e2e.json` that does not exist. `ts-esm` keeps `test:e2e` because
its e2e config lives at the workspace root and is workspace-scoped.

### 3. Other dropped scripts

`start`, `start:dev`, `start:debug`, `start:prod` are dropped from all three
variants: each resolves the default project, which an empty workspace has none
of. `build` and `deploy` are kept per the draft.

### 4. `js` extras

`index.js` and `nodemon.json` are dropped — `index.js` is the root app entry
point and `nodemon.json` only serves the removed `start:dev`.
`jest.config.js` is kept but re-rooted from `rootDir: 'src'` to `rootDir: '.'`
with `coverageDirectory: './coverage'`, mirroring what `updateJestOptions()`
does during conversion.

### 5. `lint` glob

`updateNpmScripts()` rewrites `format` but not `lint` during conversion, so the
converted workspace keeps `oxlint src/ test/`. The empty workspace ships
`oxlint apps/ libs/` instead, since `src/`/`test/` never exist there. This is a
deliberate (small) divergence in the empty workspace's favour.

### 6. Phase 5 found two real bugs on the sub-app side (fixed here)

The draft assumed "the sub-app side already tolerates an empty monorepo".
It does not. `updateTsConfig()` and `updatePackageJson()` run *outside* the
`isMonorepo()` branch in `main()`, so their conversion-only rewrites fired in an
empty workspace. Running `application --no-create-application` + `sub-app`
produced:

```jsonc
// tsconfig.json -- reference to a directory that never existed
"references": [
  { "path": "./apps/my-workspace/tsconfig.app.json" },  // phantom
  { "path": "./apps/api/tsconfig.app.json" }
]
```

```jsonc
// package.json -- updateNpmScripts' `.replace('test', ...)` hit the "test"
// inside "vitest"
"test:e2e": "vimy-workspace/test run --config ./vitest.config.e2e.ts"
```

Both are now gated on `isMonorepo()`:

- `updateTsConfig()` still normalises to solution style (idempotent, harmless)
  but only appends the "original app" reference when actually converting.
- `updateNpmScripts()` only runs when converting. `updateJestOptions()` is
  left ungated — it is additive and idempotent.

This also corrects the pre-existing test *"should add project reference when
adding sub-app to existing monorepo"*, which asserted the phantom
`./apps/nestjs-schematics/tsconfig.app.json` reference. (`nestjs-schematics`
leaked in from `getAppNameFromPackageJson()` reading this repo's own
`package.json` — the same leak produces `apps/<workspace-name>` in real use.)

### 7. Convergence check (Phase 5) — result

Asserted as a unit test rather than manually with a linked `@nestjs/cli`
(`'should produce the same apps/<name> tree as the conversion path'`): the
`apps/api/` tree generated from an empty workspace is byte-identical, file list
and contents, to the one generated by the conversion path. The remaining
difference between the two workspace roots is exactly the absence of the first
application (`src/`, `test/`, `tsconfig.build.json`) plus the `start*` scripts
and the `lint` glob noted in §3 and §5.

Phase 6 (CLI-side `nest build` / `nest start` behaviour in a zero-project
workspace) remains out of scope and untouched, as the draft specified.
