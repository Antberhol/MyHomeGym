import { readFile } from 'node:fs/promises'
import path from 'node:path'
function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function flattenKeys(value, prefix = '') {
  if (!isPlainObject(value)) {
    return prefix ? [prefix] : []
  }

  const keys = []
  for (const [key, child] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key
    if (isPlainObject(child)) {
      keys.push(...flattenKeys(child, next))
    } else {
      keys.push(next)
    }
  }

  return keys
}

function diffKeys(source, target) {
  const missing = []
  for (const key of source) {
    if (!target.has(key)) missing.push(key)
  }
  return missing.sort()
}

async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

async function main() {
  const root = process.cwd()
  const esPath = path.join(root, 'src', 'locales', 'es.json')
  const enPath = path.join(root, 'src', 'locales', 'en.json')

  const [es, en] = await Promise.all([readJson(esPath), readJson(enPath)])

  const esKeys = new Set(flattenKeys(es))
  const enKeys = new Set(flattenKeys(en))

  const missingInEn = diffKeys(esKeys, enKeys)
  const missingInEs = diffKeys(enKeys, esKeys)

  if (missingInEn.length === 0 && missingInEs.length === 0) {
     
    console.log(`i18n OK: ${esKeys.size} keys match between es.json and en.json`)
    return
  }

   
  console.error('i18n key mismatch detected.')

  if (missingInEn.length > 0) {
     
    console.error(`\nMissing in en.json (${missingInEn.length}):`)
    for (const key of missingInEn) {
       
      console.error(`- ${key}`)
    }
  }

  if (missingInEs.length > 0) {
     
    console.error(`\nMissing in es.json (${missingInEs.length}):`)
    for (const key of missingInEs) {
       
      console.error(`- ${key}`)
    }
  }

  process.exitCode = 1
}

void main()
