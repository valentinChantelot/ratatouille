# Ratatouille
>Yet another boilerplate repository.

![ratatouille banner](./assets/repo-banner.png)

## Prerequisites

- Node >= 24 (see `.nvmrc`)
- pnpm >= 9

## Stack

| Tool | Role |
|---|---|
| React 19 | UI |
| TypeScript 6 | Static typing |
| Vite | Dev server & bundler |
| Biome | Linter + formatter (replaces ESLint + Prettier) |
| TanStack Query | Data fetching & server cache |
| Vitest + Testing Library | Unit & component tests |
| commitlint | Commit message format validation |
| lint-staged | Runs Biome on staged files before each commit |

## Init

```bash
pnpm install
pnpm run init
```

`init` is a one-time script: it configures git locally, prompts for optional features below, then removes itself.

### Optional features

| Feature | Tool | What it adds |
|---|---|---|
| Commit CLI | czg | Interactive assistant for writing conventional commits |
| Changelog | git-cliff | Generates `CHANGELOG.md` from git history |

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start the Vite dev server |
| `pnpm build` | Type-check then generate production build |
| `pnpm preview` | Preview the production build |
| `pnpm lint` | Biome lint (read-only) |
| `pnpm check` | Biome lint + format with auto-fix |
| `pnpm format` | Biome format with auto-fix |
| `pnpm test` | Run Vitest tests |
| `pnpm commit` | Interactive commit assistant *(if czg installed)* |
| `pnpm changelog` | Generate full `CHANGELOG.md` *(if git-cliff installed)* |
| `pnpm changelog:unreleased` | Generate only unreleased commits *(if git-cliff installed)* |

## Git

### Branches

```
type_scope_short-description
```

Examples: `feat_auth_login-page`, `fix_api_timeout-error`, `chore_deps_update-vite`

### Commits — Conventional Commits

```
type(scope): short description

[optional body]

[BREAKING CHANGE: description of the breaking change]
```

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `perf` | Performance improvement |
| `refactor` | Rewrite without behavior change |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `chore` | Maintenance, tooling, dependencies |
| `build` | Build system or scripts |
| `ci` | CI/CD configuration |

Rules:
- Description in lowercase, no trailing period
- Scope is optional but recommended
- `BREAKING CHANGE:` in the footer

### Automatic hooks

| Hook | Trigger | Action |
|---|---|---|
| `pre-commit` | `git commit` | lint-staged → Biome check on staged files |
| `commit-msg` | `git commit` | commitlint → validates message format |
| `pre-merge-commit` | `git merge` | Checks that `CHANGELOG.md` is up to date *(if git-cliff installed)* |

### Git config applied by init

| Key | Value | Effect |
|---|---|---|
| `merge.ff` | `false` | No fast-forward — always creates a merge commit |
| `pull.rebase` | `true` | `git pull` rebases by default |
| `rebase.autoStash` | `true` | Auto-stash before rebase |
| `branch.autosetuprebase` | `always` | All branches track in rebase mode |

## Path alias

`@` points to `src/`.

```ts
import { Button } from "@/components/Button"
```

## Environment variables

Copy `.env.example` to `.env` and fill in the values before starting.
