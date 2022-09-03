var test = require('tap').test
var nock = require('nock')
var ls = require('@prantlf/npm-remote-ls').ls

require('chai').should()

test('ls', function (t) {
  t.test('returns the latest version by default', function (t) {
    var request = nock('https://registry.npmjs.org')
        .get('/request')
        .reply(200, {
          name: 'request',
          versions: {
            '0.0.1': {
              dependencies: {
                lodash: '0.0.2'
              }
            }
          }
        })
    var lodash = nock('https://registry.npmjs.org')
        .get('/lodash')
        .reply(200, {
          name: 'lodash',
          versions: {
            '0.0.2': {
              dependencies: {}
            }
          }
        })

    ls('request', function (res) {
      res.should.deep.equal({ 'request@0.0.1': { 'lodash@0.0.2': {} } })
      request.done()
      lodash.done()
      t.end()
    })
  })

  t.test('returns dependency tree by default', function (t) {
    // uses cached mocks
    ls('request', '0.0.1', function (res) {
      res.should.deep.equal({ 'request@0.0.1': { 'lodash@0.0.2': {} } })
      t.end()
    })
  })

  t.test('returns flattened dependencies', function (t) {
    // uses cached mocks
    ls('request', '0.0.1', true, function (res) {
      res.should.deep.equal([ 'request@0.0.1', 'lodash@0.0.2' ])
      t.end()
    })
  })

  t.test('supports Promise as a result', function (t) {
    // uses cached mocks
    ls('request', '*').then(function (res) {
      res.should.deep.equal({ 'request@0.0.1': { 'lodash@0.0.2': {} } })
      t.end()
    })
  })

  t.end()
})
