const test = require('tehanu')(__filename)
const { ok } = require('assert')
const { RemoteLS } = require('@prantlf/npm-remote-ls')

test('accepts old logger', () => {
  const ls = new RemoteLS({
    logger: { log: () => {} }
  })
  ok(ls.logger)
  ok(ls.logger.debug)
  ok(ls.logger.error)
})
