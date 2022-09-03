import { RemoteLS, clearCache, config, getRegistry, ls } from '@prantlf/npm-remote-ls'
import { strictEqual } from 'assert'
import tehanu from 'tehanu'

const test = tehanu(import.meta.url)

test('exports all functions', () => {
  strictEqual(typeof RemoteLS, 'function')
  strictEqual(typeof clearCache, 'function')
  strictEqual(typeof config, 'function')
  strictEqual(typeof getRegistry, 'function')
  strictEqual(typeof ls, 'function')
})
