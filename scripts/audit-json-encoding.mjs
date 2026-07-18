import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const ignoredDirs = new Set(['.git', 'node_modules', 'dist'])
const suspiciousPattern = /(?:Ð.|Ñ.|Ã.|Â.|â.|ð.|ï.)|[-]/gu

function listJsonFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...listJsonFiles(fullPath))
    else if (entry.isFile() && entry.name.endsWith('.json')) files.push(fullPath)
  }
  return files
}

const hits = []
for (const file of listJsonFiles(root)) {
  const raw = fs.readFileSync(file, 'utf8')
  const matches = [...raw.matchAll(suspiciousPattern)].slice(0, 8).map((match) => match[0])
  if (matches.length) {
    hits.push({ file: path.relative(root, file), matches })
  }
}

if (hits.length) {
  console.log(JSON.stringify({ status: 'suspicious', hits }, null, 2))
  process.exit(1)
}

console.log('Encoding audit passed: no mojibake markers found in JSON files.')
