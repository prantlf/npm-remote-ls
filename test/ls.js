const test = require('tehanu')(__filename)
const nock = require('nock')
const { deepStrictEqual, strictEqual } = require('assert')
const { ls } = require('@prantlf/npm-remote-ls')

test('returns the latest version by default', () => {
  const request = nock('https://registry.npmjs.org')
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
  const lodash = nock('https://registry.npmjs.org')
    .get('/lodash')
    .reply(200, {
      name: 'lodash',
      versions: {
        '0.0.2': {
          dependencies: {}
        }
      }
    })

  return new Promise(resolve => {
    ls('request', packages => {
      deepStrictEqual(packages, { 'request@0.0.1': { 'lodash@0.0.2': {} } })
      request.done()
      lodash.done()
      resolve()
    })
  })
})

test('returns dependency tree by default', () => {
  // uses cached mocks
  return new Promise(resolve => {
    ls('request', '0.0.1', res => {
      deepStrictEqual(res, { 'request@0.0.1': { 'lodash@0.0.2': {} } })
      resolve()
    })
  })
})

test('returns flattened dependencies', () => {
  // uses cached mocks
  return new Promise(resolve => {
    ls('request', '0.0.1', true, res => {
      deepStrictEqual(res, [ 'request@0.0.1', 'lodash@0.0.2' ])
      resolve()
    })
  })
})

test('supports Promise as a succeeding tree result', async () => {
  // uses cached mocks
  const res = await ls('request', '*')
  deepStrictEqual(res, {
    packages: { 'request@0.0.1': { 'lodash@0.0.2': {} } },
    errors: []
  })
})

test('supports Promise as a succeeding flattened result', async () => {
  // uses cached mocks
  const res = await ls('request', '*', true)
  deepStrictEqual(res, {
    packages: ['request@0.0.1', 'lodash@0.0.2'],
    errors: []
  })
})

test('supports Promise as a failing result', async () => {
  // uses cached mocks
  const res = await ls('request', '0.0.2')
  strictEqual(typeof res, 'object')
  deepStrictEqual(res.packages, {})
  strictEqual(typeof res.errors, 'object')
  strictEqual(res.errors.length, 1)
  strictEqual(typeof res.errors[0], 'object')
  strictEqual(res.errors[0].message, 'could not find a satisfactory version for string 0.0.2')
  deepStrictEqual(res.errors[0].module, { name: 'request', parent: {}, version: '0.0.2' })
})
