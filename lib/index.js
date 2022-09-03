import { clearCache, RemoteLS } from './remote-ls'

export { clearCache, RemoteLS }
export { default as config } from './config'

export function ls(name, version, flatten, cb) {
  var ls = new RemoteLS()

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

  ls.ls(name, version, () => cb(flatten ? Object.keys(ls.flat) : ls.tree, ls.errors))
}
