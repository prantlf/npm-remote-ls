interface Logger {
  debug: (msg: string) => void
  error: (msg: string) => void
}

interface Options {
  logger?: Logger /* console */
  registry?: string               /* 'https://registry.npmjs.org' */
  development?: boolean           /* true */
  optional?: boolean              /* true */
  peer?: boolean                  /* false */
  license?: boolean               /* false */
  verbose?: boolean               /* false */
}

export class RemoteLS {
  constructor(options?: Options)
}

export function config(options?: Options): Options

declare type Tree = { [pkg: string]: Tree }

declare type Callback = (packages: Tree | string[], errors: Error[]) => void

export function ls(name: string, version?: string | boolean | Callback, flatten?: boolean | Callback, cb?: Callback): Promise<{ packages: Tree | string[], errors: Error[] }> | void

export function clearCache(): void
