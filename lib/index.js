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

  ls.ls(name, version, function () {
    if (flatten) cb(Object.keys(ls.flat))
    else cb(ls.tree)
  })
}
