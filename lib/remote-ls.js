import config from './config'
import getRegistry from './get-registry'
import merge from './merge'
import { queue } from 'async'
import semver from 'semver'
import request from 'request'
import once from 'once'
import npa from 'npm-package-arg'
import Cacheman from 'cacheman'

const { get } = request
const { maxSatisfying, SemVer } = semver
const cache = new Cacheman('package', { ttl: 1000 })

export function clearCache() {
  return cache.clear()
}

const defaultLog = msg => process.stderr.write(`${msg}\n`)

// perform a recursive walk of a remote
// npm package and determine its dependency
// tree.
export function RemoteLS (opts) {
  merge(this, {
    development: true,
    optional: true,
    peer: false,
    license: false,
    verbose: false,
    queue: queue((task, done) => this._loadPackageJson(task, done), 8),
    tree: {},
    flat: {},
    errors: []
  }, config(), opts)

  if (!this.registry) this.registry = getRegistry()
  if (!this.logger) {
    const log = this.silent ? () => {} : defaultLog
    this.logger = { debug: log, error: log }
  } else {
    if (!this.logger.debug) this.logger.debug = this.logger.log
    if (!this.logger.error) this.logger.error = this.logger.log
  }

  this.queue.pause()

  this.queue.error((err, task) => {
    const { name, parent, version } = task
    err.module = { name, parent, version }
    this.errors.push(err)
    this.logger.error(err.message)
  })
}

RemoteLS.prototype._request = function (packageName, scope, name, task, callback) {
  const registryUrl = scope ? getRegistry(scope) : this.registry
  const packageUrl = `${registryUrl.replace(/\/$/, '')}/${packageName}`

  cache.get(packageName, (error, value) => {
    if (error || typeof value === 'undefined') {
      get(packageUrl, { json: true }, (err, res, pkg) => {
        /* c8 ignore next 2 */
        if (err) {
          callback(err)
        } else if (res.statusCode < 200 || res.statusCode >= 400) {
          callback(new Error(`could not load ${name}@${task.version} - status ${res.statusCode}`))
        } else {
          cache.set(packageName, pkg)
          callback(null, pkg)
        }
      })
    } else {
      callback(null, value)
    }
  })
}

RemoteLS.prototype._loadPackageJson = function (task, done) {
  const { name } = task
  const packateInfos = npa(name)

  // account for scoped packages like @foo/bar
  const couchPackageName = name && packateInfos.escapedName
  const scope = name && packateInfos.scope

  // wrap done so it's only called once
  // if done throws in _walkDependencies, it will be called again in catch below
  // we want to avoid "Callback was already called." from async
  done = once(done)

  this._request(couchPackageName, scope, name, task, (err, pkg) => {
    if (err) return done(err)

    try {
      if (this.verbose) {
        /* c8 ignore next 2 */
        const license = this.license && pkg.license ?
          ` - ${pkg.license && pkg.license.type || pkg.license}` : ''
        this.logger.debug(`loading: ${name}@${task.version}${license}`)
      }
      this._walkDependencies(task, pkg, done)
    } catch (e) {
      done(e)
    }
  })
}

RemoteLS.prototype._walkDependencies = function (task, packageJson, done) {
  const version = this._guessVersion(task.version, packageJson)
  const mandatoryDependencies = packageJson.versions[version].dependencies
  // Remove the optionalDependencies from the list of optional + regular
  // dependencies coming from the registry
  const optionalDependencies = packageJson.versions[version].optionalDependencies
  if (optionalDependencies) {
    for (const optionalDep in optionalDependencies) {
      delete mandatoryDependencies[optionalDep]
    }
  }

  const dependencies = merge(
    {},
    mandatoryDependencies,
    this.optional ? packageJson.versions[version].optionalDependencies : {},
    this.peer ? packageJson.versions[version].peerDependencies : {},
    // show development dependencies if we're at the root, and deevelopment flag is true.
    (task.parent === this.tree && this.development) ? packageJson.versions[version].devDependencies : {}
  )

  let license = packageJson.versions[version].license
  if (license && license.type) license = license.type
  const fullName = `${packageJson.name}@${version}${license ? ' - ' + license : ''}`
  const parent = task.parent[fullName] = {}

  /* c8 ignore next */
  if (this.flat[fullName]) return done()
  else this.flat[fullName] = true

  for (const name in dependencies) {
    this.queue.push({ name, version: dependencies[name], parent })
  }

  done()
}

RemoteLS.prototype._guessVersion = function (versionString, packageJson) {
  if (versionString === 'latest') versionString = '*'

  const availableVersions = Object.keys(packageJson.versions)
  let version = maxSatisfying(availableVersions, versionString, true)

  // check for prerelease-only versions
  if (!version && versionString === '*' && availableVersions.every(av =>
      new SemVer(av, true).prerelease.length)) {
    // just use latest then
    version = packageJson['dist-tags'] && packageJson['dist-tags'].latest
  }

  if (!version) throw Error(`could not find a satisfactory version for string ${versionString}`)
  else return version
}

RemoteLS.prototype.ls = function (name, version, callback) {
  this.errors = []
  this.queue.push({ name, version, parent: this.tree })

  let promise
  if (!callback) promise = new Promise(resolve => callback = resolve)

  this.queue.drain(() => callback(this.tree))

  this.queue.resume()

  return promise
}
