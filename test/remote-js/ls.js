const test = require('tehanu')(__filename)
const nock = require('nock')
const { deepStrictEqual, match, ok, strictEqual } = require('assert')
const { clearCache, RemoteLS } = require('@prantlf/npm-remote-ls')

test.before(() => clearCache())

test('handles a 404 and prints an appropriate message', () => {
  return new Promise(resolve => {
    const request = nock('https://skimdb.npmjs.com')
        .get('/registry/request')
        .reply(404)
    const ls = new RemoteLS({
      registry: 'https://skimdb.npmjs.com/registry/',
      logger: {
        log: msg => {
          match(msg, /status = 404/)
        }
      }
    })

    ls.ls('request', '*', () => {
      request.done()
      resolve()
    })
  })
})

test('defaults to appropriate registry URL', () => {
  return new Promise(resolve => {
    const request = nock('https://registry.npmjs.org')
        .get('/request')
        .reply(404)
    const ls = new RemoteLS({
      logger: {
        log: msg => {
          match(msg, /status = 404/)
        }
      }
    })

    ls.ls('request', '*', () => {
      request.done()
      resolve()
    })
  })
})

test('happy path works as expected', () => {
  return new Promise(resolve => {
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
    const ls = new RemoteLS()

    ls.ls('request', '*', function (res) {
      deepStrictEqual(res, { 'request@0.0.1': { 'lodash@0.0.2': {} } })
      request.done()
      lodash.done()
      resolve()
    })
  })
})

test('performs verbose logging', () => {
  return new Promise(resolve => {
    // uses cached mocks
    const ls = new RemoteLS({ verbose: true })

    ls.ls('request', '*', function (res) {
      deepStrictEqual(res, { 'request@0.0.1': { 'lodash@0.0.2': {} } })
      deepStrictEqual(ls.errors, [])
      resolve()
    })
  })
})

test('fails silently for invalid version', () => {
  return new Promise(resolve => {
    // uses cached mocks
    const ls = new RemoteLS({ verbose: true })

    ls.ls('request', '0.0.2', function (res) {
      deepStrictEqual(res, {})
      strictEqual(ls.errors.length, 1)
      strictEqual(typeof ls.errors[0], 'object')
      strictEqual(ls.errors[0].message, 'could not find a satisfactory version for string 0.0.2')
      deepStrictEqual(ls.errors[0].module, { name: 'request', parent: {}, version: '0.0.2' })
      resolve()
    })
  })
})

test('supports scoped packages', () => {
  return new Promise(resolve => {
    const storybook = nock('https://registry.npmjs.org')
      .get('/@kadira%2fstorybook')
      .reply(200, {
        name: '@kadira/storybook',
        versions: {
          '1.30.0': {
            dependencies: { '@kadira/storybook-core': '1.27.0' }
          }
        }
      })
    const storybook404 = nock('https://registry.npmjs.org')
      .get('/@kadira/storybook')
      .reply(404, {
        error: 'Not found'
      })
    const core = nock('https://registry.npmjs.org')
      .get('/@kadira%2fstorybook-core')
      .reply(200, {
        name: '@kadira/storybook-core',
        versions: {
          '1.27.0': { dependencies: {} }
        }
      })
    const core404 = nock('https://registry.npmjs.org')
      .get('/@kadira/storybook-core')
      .reply(404, {
        error: 'Not found'
      })
    const ls = new RemoteLS()

    ls.ls('@kadira/storybook', '*', function (res) {
      deepStrictEqual(res, { '@kadira/storybook@1.30.0': { '@kadira/storybook-core@1.27.0': {} } })
      storybook.done()
      core.done()
      ok(!storybook404.isDone())
      ok(!core404.isDone())
      resolve()
    })
  })
})

test('supports Promise with a succeeding result', async () => {
  // uses cached mocks
  const ls = new RemoteLS()

  const res = await ls.ls('request', '*')
  deepStrictEqual(res, { 'request@0.0.1': { 'lodash@0.0.2': {} } })
  strictEqual(ls.errors.length, 0)
})

test('supports Promise as a failing result', async () => {
  // uses cached mocks
  const ls = new RemoteLS()

  const res = await ls.ls('request', '0.0.2')
  deepStrictEqual(res, {})
  strictEqual(ls.errors.length, 1)
  strictEqual(typeof ls.errors[0], 'object')
  strictEqual(ls.errors[0].message, 'could not find a satisfactory version for string 0.0.2')
  deepStrictEqual(ls.errors[0].module, { name: 'request', parent: {}, version: '0.0.2' })
})
