import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import config from '../../tailwind.config.js'

const root = join(import.meta.dirname, '../..')
const themeCss = readFileSync(join(root, 'src/styles/theme.css'), 'utf8')

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(jsx?|css)$/.test(name) ? [path] : []
  })
}

describe('paleta', () => {
  it('cada color del sistema que sale de una variable tiene su valor en theme.css', () => {
    const used = Object.values(config.theme.extend.colors.gym)
      .map((value) => /var\((--[\w-]+)\)/.exec(value)?.[1])
      .filter(Boolean)
    expect(used.length).toBeGreaterThan(0)
    for (const variable of used) expect(themeCss).toMatch(new RegExp(`${variable}:\\s*\\d+ \\d+ \\d+;`))
  })

  it('el color de acción no se usa para errores ni para borrar', () => {
    const offenders = sourceFiles(join(root, 'src')).filter((file) =>
      /(error|danger)[^\n]{0,80}(text|border)-gym-accent\b/.test(readFileSync(file, 'utf8')),
    )
    expect(offenders).toEqual([])
  })
})
