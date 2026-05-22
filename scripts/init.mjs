#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));
const log = (msg) => process.stdout.write(`${msg}\n`);

async function main() {
  log("\nRatatouille init\n");

  const projectName = (await ask("Project name: ")).trim();

  applyGitConfig();

  const features = [];

  const wantsChangelog = await ask("Add changelog support? (git-cliff) [y/N] ");
  if (wantsChangelog.trim().toLowerCase() === "y") features.push("changelog");

  const wantsCommitCli = await ask("Add commit CLI? (czg) [y/N] ");
  if (wantsCommitCli.trim().toLowerCase() === "y") features.push("commit-cli");

  rl.close();
  log("");

  for (const feature of features) {
    const mod = await import(`./features/${feature}.mjs`);
    await mod.setup(ROOT);
  }

  updateReadme(ROOT, projectName, features);
  cleanup();

  const featuresSummary = features.length > 0 ? features.join(", ") : "none";
  const rows = [
    ["Project", projectName],
    ["Git config", "applied"],
    ["Features", featuresSummary],
    ["README", "updated"],
    ["Scripts", "removed"],
    ["Assets", "removed"],
  ];
  const colWidth = Math.max(...rows.map(([, v]) => v.length));
  const line = `├──────────────┬${"─".repeat(colWidth + 2)}┤`;
  const row = ([k, v]) => `│ ${k.padEnd(12)} │ ${v.padEnd(colWidth)} │`;
  const width = 16 + colWidth;
  const hasCzg = features.includes("commit-cli");
  const commitCmd = hasCzg ? "pnpm run commit" : "git commit";
  const tip = hasCzg
    ? "  Tip: use pnpm run commit to write conventional commits\n"
    : "";
  log(`
┌${"─".repeat(width)}┐
│${"  Init complete".padEnd(width)} │
${line}
${rows.map(row).join("\n")}
└──────────────┴${"─".repeat(colWidth + 2)}┘
  Ratatouille is now ${projectName} !
${tip}  Next: git add -A && ${commitCmd}
  You can start working 🎉
`);
}

function applyGitConfig() {
  const configs = [
    ["merge.ff", "false"],
    ["pull.rebase", "true"],
    ["rebase.autoStash", "true"],
    ["branch.autosetuprebase", "always"],
  ];
  for (const [key, value] of configs) {
    execSync(`git config ${key} ${value}`, { cwd: ROOT });
  }
  log("Git config applied.");
}

function updateReadme(root, name, features) {
  const readmePath = resolve(root, "README.md");
  let content = readFileSync(readmePath, "utf-8");
  content = content.replace(/^!\[.*\]\(\.\/assets\/.*\)\n?/m, "");
  content = content.replace(/^> .*\n?/m, "");
  content = content.replace(/^# .+$/m, `# ${name}`);
  content = content.replace(/## Init[\s\S]*?(?=## Commands)/, "");

  const stackRows = [];
  if (features.includes("changelog"))
    stackRows.push("| git-cliff | Changelog generation |");
  if (features.includes("commit-cli"))
    stackRows.push("| czg | Interactive commit assistant |");
  if (stackRows.length > 0) {
    content = content.replace(
      /(^\| lint-staged \|.*\|$)/m,
      `$1\n${stackRows.join("\n")}`,
    );
  }

  writeFileSync(readmePath, content);
  log("README updated.");
}

function cleanup() {
  const pkgPath = resolve(ROOT, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  pkg.scripts.init = undefined;
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  rmSync(resolve(ROOT, "scripts"), { recursive: true, force: true });
  rmSync(resolve(ROOT, "assets"), { recursive: true, force: true });
  log("Init scripts removed.");
}

main().catch((err) => {
  process.stderr.write(`${err.message}\n`);
  rl.close();
  process.exit(1);
});
