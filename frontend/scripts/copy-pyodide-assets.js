import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(root, 'node_modules/pyodide')
const output = resolve(root, 'public/pyodide')
mkdirSync(output, { recursive: true })
for (const file of ['pyodide.js', 'pyodide.asm.js', 'pyodide.asm.wasm', 'pyodide-lock.json', 'python_stdlib.zip']) {
  copyFileSync(resolve(source, file), resolve(output, file))
}
copyFileSync(resolve(root, 'src/features/pyodide.worker.js'), resolve(root, 'public/pyodide.worker.js'))
