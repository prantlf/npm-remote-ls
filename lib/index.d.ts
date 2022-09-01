export class RemoteLS {
  constructor(options?: {})
}

export function config(options?: {}): {}

declare type Callback = (deps: [] | {}) => void

export function ls(name: string, version?: string | boolean | Callback, flatten?: boolean | Callback, cb?: Callback): string
