const test = require('tehanu')(__filename)
const { fail, notStrictEqual, strictEqual } = require('assert')
const { readFileSync } = require('fs')
const { clearCache, RemoteLS } = require('@prantlf/npm-remote-ls')

const loadPackage = name => JSON.parse(readFileSync(`test/fixtures/${name}.json`, 'utf8'))
const abbrev = loadPackage('abbrev')
const angularCore = loadPackage('angular-core')
const bacom = loadPackage('bacom')
const nopt = loadPackage('nopt')

test.before(() => clearCache())

test('should push appropriate dependencies to queue', () => {
  return new Promise(resolve => {
    const ls = new RemoteLS({
      queue: {
        pause: () => {},
        push: pkg => {
          strictEqual(pkg.name, 'abbrev')
          strictEqual(pkg.version, '1')
          resolve()
        },
        error: () => {}
      }
    })

    ls._walkDependencies({
      name: 'nopt',
      version: '1.0.6',
      parent: {}
    }, nopt, () => {})
  })
})

test('should push devDependencies to queue', () => {
  return new Promise(resolve => {
    const ls = new RemoteLS({
      queue: {
        pause: () => {},
        push: pkg => {
          strictEqual(pkg.name, 'tap')
          strictEqual(pkg.version, '1.0.0')
          resolve()
        },
        error: () => {}
      }
    })

    ls._walkDependencies({
      name: 'nopt',
      version: '1.0.8',
      parent: ls.tree
    }, nopt, () => {})
  })
})

test('should not raise an exception if package has no dependencies', () => {
  const ls = new RemoteLS()

  ls._walkDependencies({
    name: 'abbrev',
    version: '*',
    parent: {}
  }, abbrev, () => {})
})

test('should not walk dependency if dependency has already been observed', () => {
  return new Promise(resolve => {
    const ls = new RemoteLS({
      flat: {
        'nopt@1.0.0': true
      },
      queue: {
        pause: () => {},
        push: () => {
          fail('should not walk dependency')
          resolve()
        },
        error: () => {}
      }
    })

    ls._walkDependencies({
      name: 'nopt',
      version: '1.0.0',
      parent: {}
    }, nopt, () => {})

    resolve()
  })
})

test('should push peerDependencies to queue', () => {
  return new Promise(resolve => {
    const ls = new RemoteLS({
      peer: true,
      queue: {
        pause: () => {},
        push: pkg => {
          strictEqual(pkg.name, 'rxjs')
          strictEqual(pkg.version, '5.0.0-beta.6')
          resolve()
        },
        error: () => {}
      }
    })

    ls._walkDependencies({
      name: 'angular',
      version: '2.0.0-rc.3',
      parent: ls.tree
    }, angularCore, () => {})
  })
})

test('should not push optionalDependencies to queue', () => {
  return new Promise(resolve => {
    const ls = new RemoteLS({
      dev: false,
      optional: false,
      queue: {
        pause: () => {},
        push: pkg => {
          notStrictEqual(pkg.name, 'benchmark')
          resolve()
        },
        error: () => {}
      }
    })

    ls._walkDependencies({
      name: 'bacom',
      version: '0.6.0',
      parent: ls.tree
    }, bacom, () => {})
  })
})

test('should include license information', () => {
  const ls = new RemoteLS({
    license: true,
    queue: {
      pause: () => {},
      push: () => {},
      error: () => {}
    }
  })

  ls._walkDependencies({
    name: 'abbrev',
    version: '*',
    parent: ls.tree
  }, abbrev, () => {})

  strictEqual(Object.keys(ls.flat).filter(key => key.includes('MIT')).length, 1)
})