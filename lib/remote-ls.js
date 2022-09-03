import config from './config'
import _ from 'lodash'
import async from 'async'
import semver from 'semver'
import request from 'request'
import once from 'once'
import npa from 'npm-package-arg'
import getRegistry from 'registry-url'
import Cacheman from 'cacheman'

var cache = new Cacheman('package', {
  ttl: 1000
})

// perform a recursive walk of a remote
// npm package and determine its dependency
// tree.
function RemoteLS (opts) {
  _.extend(this, {
    logger: console,
    development: true, // include dev dependencies.
    optional: true, // include optional dependencies.
    peer: false, // include peer dependencies.
    license: false, // include license information.
    verbose: false,
    registry: getRegistry(), // URL of registry to ls.
    queue: async.queue((task, done) => {
      this._loadPackageJson(task, done)
    }, 8),
    tree: {},
    flat: {},
    errors: []
  }, config(), opts)

  this.queue.pause()

  this.queue.error = (err, task) => {
    const { name, parent, version } = task
    err.module = { name, parent, version }
    this.errors.push(err)
  }
}

RemoteLS.prototype._request = function (packageName, scope, name, task, callback) {
  var registryUrl = scope ? getRegistry(scope) : this.registry
  var packageUrl = registryUrl.replace(/\/$/, '') + '/' + packageName

  cache.get(packageName, (error, value) => {
    if (error || typeof value === 'undefined') {
      request.get(packageUrl, { json: true }, (err, res, obj) => {
        if (err || (res.statusCode < 200 || res.statusCode >= 400)) {
          /* c8 ignore next */
          var message = res ? 'status = ' + res.statusCode : 'error = ' + err.message
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
  var name = task.name
  var packateInfos = npa(name)

  // account for scoped packages like @foo/bar
  var couchPackageName = name && packateInfos.escapedName
  var scope = name && packateInfos.scope

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
        var license = obj.license && obj.license.type || obj.license
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
  var version = this._guessVersion(task.version, packageJson)
  var mandatoryDependencies = packageJson.versions[version].dependencies
  // Remove the optionalDependencies from the list of optional + regular
  // dependencies coming from the registry
  var optionalDependencies = packageJson.versions[version].optionalDependencies
  if (optionalDependencies) {
    for (var optionalDep in optionalDependencies) {
      delete mandatoryDependencies[optionalDep]
    }
  }

  var dependencies = _.extend(
    {},
    mandatoryDependencies,
    this.optional ? packageJson.versions[version].optionalDependencies : {},
    this.peer ? packageJson.versions[version].peerDependencies : {},
    // show development dependencies if we're at the root, and deevelopment flag is true.
    (task.parent === this.tree && this.development) ? packageJson.versions[version].devDependencies : {}
  )

  var license = packageJson.versions[version].license
  if (license && license.type) license = license.type
  var fullName = packageJson.name + '@' + version + (license ? ' - ' + license : '')
  var parent = task.parent[fullName] = {}

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

  var availableVersions = Object.keys(packageJson.versions)
  var version = semver.maxSatisfying(availableVersions, versionString, true)

  // check for prerelease-only versions
  if (!version && versionString === '*' && availableVersions.every(av =>
      new semver.SemVer(av, true).prerelease.length)) {
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

  this.queue.drain = () => {
    callback(this.tree)
  }

  this.queue.resume()

  return promise
}

export default RemoteLS
