const test = require('tehanu')(__filename)
const { strictEqual, throws } = require('assert')
const { readFileSync } = require('fs')
const { RemoteLS } = require('@prantlf/npm-remote-ls')

const loadPackage = name => JSON.parse(readFileSync(`test/fixtures/${name}.json`, 'utf8'))
const angularCore = loadPackage('angular-core')
const nopt = loadPackage('nopt')

test('should handle an exact version being provided', () => {
  const versionString = '1.0.0'
  const ls = new RemoteLS()

  strictEqual(ls._guessVersion(versionString, nopt), '1.0.0')
})

test('should handle a complex version being provided', () => {
  const versionString = '*'
  const ls = new RemoteLS()

  strictEqual(ls._guessVersion(versionString, nopt), '3.0.1')
})

test('should raise an exception if version cannot be found', () => {
  const versionString = '9.0.0'
  const ls = new RemoteLS()

  throws(() => ls._guessVersion(versionString, nopt),
    /could not find a satisfactory version/)
})

test('should raise an exception if version cannot be found', () => {
  const versionString = '9.0.0'
  const ls = new RemoteLS()

  throws(() =>ls._guessVersion(versionString, nopt),
    /could not find a satisfactory version/)
})

test('should handle "latest" being provided as version', () => {
  const versionString = 'latest'
  const ls = new RemoteLS()

  strictEqual(ls._guessVersion(versionString, nopt), '3.0.1')
})

test('should return dist-tags.latest when * wanted and package has only prerelease versions', () => {
  const versionString = '*'
  const ls = new RemoteLS()

  strictEqual(ls._guessVersion(versionString, angularCore), '2.0.0-rc.3')
})
