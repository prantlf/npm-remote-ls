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

// perform a recursive walk of a remote
// npm package and determine its dependency
// tree.
export function RemoteLS (opts) {
  merge(this, {
    logger: console,
    development: true, // include dev dependencies.
    optional: true, // include optional dependencies.
    peer: false, // include peer dependencies.
    license: false, // include license information.
    verbose: false,
    registry: getRegistry(), // URL of registry to ls.
    queue: queue((task, done) => this._loadPackageJson(task, done), 8),
    tree: {},
    flat: {},
    errors: []
  }, config(), opts)

  this.queue.pause()

  this.queue.error((err, task) => {
    const { name, parent, version } = task
    err.module = { name, parent, version }
    this.errors.push(err)
  })
}

RemoteLS.prototype._request = function (packageName, scope, name, task, callback) {
  const registryUrl = scope ? getRegistry(scope) : this.registry
  const packageUrl = registryUrl.replace(/\/$/, '') + '/' + packageName

  cache.get(packageName, (error, value) => {
    if (error || typeof value === 'undefined') {
      get(packageUrl, { json: true }, (err, res, obj) => {
        if (err || (res.statusCode < 200 || res.statusCode >= 400)) {
          /* c8 ignore next */
          const message = res ? 'status = ' + res.statusCode : 'error = ' + err.message
          this.logger.log(
            'could not load ' + name + '@' + task.version + ' ' + message
          )

          callback(true, res, obj)
        } else {
          cache.set(packageName, obj)
          callback(false, obj)
        }
      })
    } else {
      callback(false, value)
    }
  })
}

RemoteLS.prototype._loadPackageJson = function (task, done) {
  const name = task.name
  const packateInfos = npa(name)

  // account for scoped packages like @foo/bar
  const couchPackageName = name && packateInfos.escapedName
  const scope = name && packateInfos.scope

  // wrap done so it's only called once
  // if done throws in _walkDependencies, it will be called again in catch below
  // we want to avoid "Callback was already called." from async
  done = once(done)

  this._request(couchPackageName, scope, name, task, (err, obj) => {
    if (err) {
      return done()
    }

    try {
      if (this.verbose) {
        /* c8 ignore next 2 */
        let license = obj.license && obj.license.type || obj.license
        license = license ? ' - ' + license : ''
        console.log('loading:', name + '@' + task.version + license)
      }
      this._walkDependencies(task, obj, done)
    } catch (e) {
      this.logger.log(e.message)
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
  const fullName = packageJson.name + '@' + version + (license ? ' - ' + license : '')
  const parent = task.parent[fullName] = {}

  /* c8 ignore next */
  if (this.flat[fullName]) return done()
  else this.flat[fullName] = true

  for (const name in dependencies) {
    this.queue.push({
      name: name,
      version: dependencies[name],
      parent: parent
    })
  }

  done()
}

RemoteLS.prototype._guessVersion = function (versionString, packageJson) {
  if (versionString === 'latest') versionString = '*'

  const availableVersions = Object.keys(packageJson.versions)
  const version = maxSatisfying(availableVersions, versionString, true)

  // check for prerelease-only versions
  if (!version && versionString === '*' && availableVersions.every(av =>
      new SemVer(av, true).prerelease.length)) {
    // just use latest then
    version = packageJson['dist-tags'] && packageJson['dist-tags'].latest
  }

  if (!version) throw Error('could not find a satisfactory version for string ' + versionString)
  else return version
}

RemoteLS.prototype.ls = function (name, version, callback) {
  this.errors = []
  this.queue.push({
    name: name,
    version: version,
    parent: this.tree
  })

  let promise
  if (!callback) promise = new Promise(resolve => callback = resolve)

  this.queue.drain(() => callback(this.tree))

  this.queue.resume()

  return promise
}
