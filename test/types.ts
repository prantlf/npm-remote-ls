import { RemoteLS, config, ls, Tree, Options } from '@prantlf/npm-remote-ls'

let _remoteLS: RemoteLS = new RemoteLS()

const _config: Options = config()
config({})
config({ logger: { debug: (_msg: string) => {}, error: (_msg: string) => {} } })
config({ registry: '' })
config({ development: false })
config({ optional: false })
config({ peer: true })
config({ license: true })
config({ verbose: true })

ls('', '', true, (_packages: Tree | string[]) => {})
ls('', '', (_packages: Tree | string[]) => {})
ls('', (_packages: Tree | string[]) => {})
ls('', (_packages: Tree | string[], _err: Error[]) => {})

const _promise: Promise<{ packages: Tree | string[], errors: Error[] }> | void = ls('')
