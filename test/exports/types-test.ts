import { RemoteLS, config, ls, Tree } from '@prantlf/npm-remote-ls'

let _remoteLS: RemoteLS = new RemoteLS()

const _config: {} = config()
config({})
config({ logger: { log: (_msg: string) => {} } })
config({ registry: '' })
config({ development: false })
config({ optional: false })
config({ peer: true })
config({ license: true })
config({ verbose: true })

ls('', '', true, (_obj: {}) => {})
ls('', '', (_obj: {}) => {})
ls('', (_obj: {}) => {})
ls('', (_obj: {}, _err: Error[]) => {})

const _promise: Promise<{ packages: Tree | string[], errors: Error[] }> | void = ls('')
