#!/usr/bin/env node
import { createInterface } from 'node:readline'
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const rl = createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise((res) => rl.question(q, res))

async function main() {
  console.log('\nRatatouille init\n')

  const projectName = (await ask('Project name: ')).trim()

  applyGitConfig()

  const features = []

  const wantsChangelog = await ask('Add changelog support? (git-cliff) [y/N] ')
  if (wantsChangelog.trim().toLowerCase() === 'y') features.push('changelog')

  const wantsCommitCli = await ask('Add commit CLI? (czg) [y/N] ')
  if (wantsCommitCli.trim().toLowerCase() === 'y') features.push('commit-cli')

  rl.close()
  console.log('')

  for (const feature of features) {
    const mod = await import(`./features/${feature}.mjs`)
    await mod.setup(ROOT)
  }

  updateReadme(ROOT, projectName)
  cleanup()

  console.log('\nDone. Commit the result: git add -A && pnpm run commit\n')
}

function applyGitConfig() {
  const configs = [
    ['merge.ff', 'false'],
    ['pull.rebase', 'true'],
    ['rebase.autoStash', 'true'],
    ['branch.autosetuprebase', 'always'],
  ]
  for (const [key, value] of configs) {
    execSync(`git config ${key} ${value}`, { cwd: ROOT })
  }
  console.log('Git config applied.')
}

function updateReadme(root, name) {
  const readmePath = resolve(root, 'README.md')
  let content = readFileSync(readmePath, 'utf-8')
  content = content.replace(/^# .+$/m, `# ${name}`)
  content = content.replace(/## Init[\s\S]*?(?=## Commands)/, '')
  writeFileSync(readmePath, content)
  console.log('README updated.')
}

function cleanup() {
  const pkgPath = resolve(ROOT, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  delete pkg.scripts.init
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
  rmSync(resolve(ROOT, 'scripts'), { recursive: true, force: true })
  rmSync(resolve(ROOT, 'assets'), { recursive: true, force: true })
  console.log('Init scripts removed.')
}

main().catch((err) => {
  console.error(err.message)
  rl.close()
  process.exit(1)
})
