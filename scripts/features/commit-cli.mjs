import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

export async function setup(root) {
  console.log('Setting up commit CLI (czg)...')

  execSync('pnpm add -D czg', { cwd: root, stdio: 'inherit' })

  const pkgPath = resolve(root, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  pkg.scripts.commit = 'czg'
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
  console.log('  script added: commit')
}
