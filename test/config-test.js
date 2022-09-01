var test = require('tap').test
var config = require('npm-remote-ls').config

require('chai').should()

test('config', function (t) {
  t.test('returns no configuration by default', function (t) {
    t.equal(
      config(),
      undefined
    )
    t.end()
  })

  t.test('sets configuration and keeps it', function (t) {
    var opts = {}
    t.equal(
      config(opts),
      opts
    )
    t.equal(
      config(),
      opts
    )
    t.end()
  })

  t.end()
})
