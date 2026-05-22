import { execSync } from "node:child_process";
import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const log = (msg) => process.stdout.write(`${msg}\n`);

export async function setup(root) {
  log("Setting up changelog (git-cliff)...");

  execSync("pnpm add -D git-cliff", { cwd: root, stdio: "inherit" });

  writeFileSync(resolve(root, "cliff.toml"), CLIFF_TOML);
  log("  cliff.toml created");

  if (!existsSync(resolve(root, "CHANGELOG.md"))) {
    writeFileSync(resolve(root, "CHANGELOG.md"), "# Changelog\n");
    log("  CHANGELOG.md created");
  }

  const hookPath = resolve(root, ".githooks/pre-merge-commit");
  writeFileSync(hookPath, PRE_MERGE_HOOK);
  chmodSync(hookPath, "755");
  log("  pre-merge-commit hook added");

  const pkgPath = resolve(root, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  pkg.scripts.changelog = "git-cliff -o CHANGELOG.md";
  pkg.scripts["changelog:unreleased"] =
    "git-cliff --unreleased -o CHANGELOG.md";
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  log("  scripts added: changelog, changelog:unreleased");
}

const CLIFF_TOML = `[changelog]
header = """
# Changelog\\n
"""
body = """
{% if version %}\\
## [{{ version | trim_start_matches(pat="v") }}] - {{ timestamp | date(format="%Y-%m-%d") }}
{% else %}\\
## [Unreleased]
{% endif %}\\
{% for group, commits in commits | group_by(attribute="group") %}
### {{ group | striptags | trim | upper_first }}
{% for commit in commits %}
- {% if commit.scope %}**{{ commit.scope }}:** {% endif %}{{ commit.message | upper_first }}
{% endfor %}
{% endfor %}\\n
"""
footer = ""
trim = true

[git]
conventional_commits = true
filter_unconventional = true
commit_parsers = [
  { message = "^feat", group = "Features" },
  { message = "^fix", group = "Bug Fixes" },
  { message = "^perf", group = "Performance" },
  { message = "^refactor", group = "Refactoring" },
  { message = "^docs", group = "Documentation" },
  { message = "^test", group = "Tests" },
  { message = "^chore", group = "Chores" },
  { message = "^ci", group = "CI/CD" },
  { message = "^build", group = "Build" },
]
tag_pattern = "v[0-9].*"
sort_commits = "oldest"
`;

const PRE_MERGE_HOOK = `#!/usr/bin/env bash
set -euo pipefail

if ! git diff --name-only "$(git merge-base HEAD MERGE_HEAD)" MERGE_HEAD | grep -q '^CHANGELOG\\.md$'; then
  echo "pre-merge-commit: CHANGELOG.md must be updated before merging." >&2
  echo "                  Run 'pnpm run changelog' to generate it." >&2
  exit 1
fi
`;
