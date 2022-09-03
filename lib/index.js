import { clearCache, RemoteLS } from './remote-ls'

export { clearCache, RemoteLS }
export { default as config } from './config'

export function ls(name, version, flatten, cb) {
  const ls = new RemoteLS()

  if (typeof version === 'function') {
    cb = version
    version = 'latest'
  }

  if (typeof flatten === 'function') {
    cb = flatten
    flatten = false
  }

  const packages = () => flatten ? Object.keys(ls.flat) : ls.tree

  if (!cb) {
    return ls.ls(name, version).then(() => ({
      packages: packages(),
      errors: ls.errors
    }))
  }

  ls.ls(name, version, () => cb(packages(), ls.errors))
}
