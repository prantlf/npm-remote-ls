import { RemoteLS, config, ls } from 'npm-remote-ls'

let _remoteLS: RemoteLS = new RemoteLS()

const _config: {} = config()
config({})

ls('', '', true, obj => {
  const o: {} = obj
})
ls('', '', obj => {
  const o: {} = obj
})
ls('', obj => {
  const o: {} = obj
})
