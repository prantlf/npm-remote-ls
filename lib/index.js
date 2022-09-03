export { default as RemoteLS } from './remote-ls'

export { default as config } from './config'

export function ls(name, version, flatten, cb) {
  var ls = new exports.RemoteLS()

  if (typeof version === 'function') {
    cb = version
    version = 'latest'
  }

  if (typeof flatten === 'function') {
    cb = flatten
    flatten = false
  }

  if (!cb) {
    return ls.ls(name, version).then(() => ({
      packages: flatten ? Object.keys(ls.flat) : ls.tree,
      errors: ls.errors
    }))
  }

  ls.ls(name, version, function () {
    cb(flatten ? Object.keys(ls.flat) : ls.tree, ls.errors)
  })
}
