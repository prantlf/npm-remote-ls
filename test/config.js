const test = require('tehanu')(__filename)
const { strictEqual } = require('assert')
const { config } = require('@prantlf/npm-remote-ls')

test('returns no configuration by default', () => {
  strictEqual(config(), undefined)
})

test('sets configuration and keeps it', () => {
  const opts = {}
  strictEqual(config(opts), opts)
  strictEqual(config(), opts)
})
