#!/usr/bin/env node

function showHelp() {
  console.log(`Examine a package's dependency graph before you install it.

Usage: npm-remote-ls [options] <name> [<version>]

Parameters:
  name     package name or name@version (mandatory)
  version  package version              (default: "latest")

Options:
  -r, --registry     set an alternative registry url (default: as configured)
  -d, --development  show development dependencies   (default: true)
  -o, --optional     show optional dependencies      (default: true)
  -p, --peer         show peer dependencies          (default: false)
  -l, --license      show license information        (default: false)
  -f, --flatten      print flat list of dependencies (default: false)
  -j, --json         print dependencies as JSON      (default: false)
  -e, --verbose      enable verbose logging          (default: false)
  -V, --version      print version number
  -h, --help         print usage instructions

Several short flags can be condensed behind a "-". Uppercase short flags
or long flags prefixed by "no-" are negative.

Examples:
  npm-remote-ls grunt
  npm-remote-ls grunt 0.1.0
  npm-remote-ls grunt@0.1.0
  npm-remote-ls -f grunt 0.1.0
  npm-remote-ls grunt -DOj`)
  process.exit(0)
}

function showVersion() {
  const pkg = require('path').join(__dirname, '../package.json')
  console.log(JSON.parse(require('fs').readFileSync(pkg, 'utf8')).version)
  process.exit(0)
}

const params = []
let development = true
let optional = true
let registry, peer, license, flatten, json, verbose

const { argv } = process
for (let i = 2, l = argv.length; i < l; ++i) {
  const match = /^(-[a-zA-Z])([a-zA-Z]+)$/.exec(argv[i])
  if (match) {
    argv[i] = match[1]
    const flags = match[2].split('').map(flag => `-${flag}`)
    argv.splice(i, 0, ...flags)
    const { length } = flags
    i += length
    l += length
  }
}
for (let i = 2, l = argv.length; i < l; ++i) {
  const arg = argv[i]
  const match = /^(?:-|--)(?:(no)-)?([a-zA-Z][-a-zA-Z]*)$/.exec(arg)
  if (match) {
    const opt = match[2]
    const flag = () => (match[1] !== 'no') === (opt[0] >= 'a')
    switch (opt) {
      case 'r': case 'registry':
        versionSeparator = argv[++i]
        continue
      case 'd': case 'D': case 'development':
        development = flag()
        continue
      case 'o': case 'O': case 'optional':
        optional = flag()
        continue
      case 'p': case 'P': case 'peer':
        peer = flag()
        continue
      case 'l': case 'L': case 'license':
        license = flag()
        continue
      case 'f': case 'F': case 'flatten':
        flatten = flag()
        continue
      case 'j': case 'J': case 'json':
        json = flag()
        continue
      case 'e': case 'E': case 'verbose':
        verbose = flag()
        continue
      case 'V': case 'version':
        showVersion()
        continue
      case 'h': case 'help':
        showHelp()
    }
    console.error(`unknown option: "${match[0]}"`)
    process.exit(1)
  }
  params.push(arg)
}

let [name, version] = params
if (!name) showHelp()
if (!version) version = 'latest'

const { config, ls } = require('../dist/index.cjs')
const { asTree } = require('treeify')
const spinner = require('char-spinner')
const npa = require('npm-package-arg')

config({ registry, verbose, development, optional, peer, license })

spinner()
const parsed = npa(name)
ls(name, parsed.rawSpec || version, flatten, packages => {
  console.log(json ? JSON.stringify(packages) :
    Array.isArray(packages) ? packages.join('\n') :
    asTree(packages))
})
