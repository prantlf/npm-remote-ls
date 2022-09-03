#!/usr/bin/env node

var { getRegistry, ls } = require('../dist/index.cjs')

var yargs = require('yargs')
    .usage('$0 <pkg-name> [options]')
    .version(false)
    .options('n', {
      alias: 'name',
      description: 'package name'
    })
    .options('v', {
      alias: 'version',
      description: 'package version',
      default: 'latest'
    })
    .options('e', {
      alias: 'verbose',
      description: 'enable verbose logging',
      default: false,
      boolean: true
    })
    .options('d', {
      alias: 'development',
      description: 'show development dependencies',
      default: true,
      boolean: true
    })
    .options('l', {
      alias: 'license',
      description: 'show license information',
      default: false,
      boolean: true
    })
    .options('o', {
      alias: 'optional',
      description: 'show optional dependencies',
      default: true,
      boolean: true
    })
    .options('p', {
      alias: 'peer',
      description: 'show peer dependencies',
      default: false,
      boolean: true
    })
    .options('r', {
      alias: 'registry',
      description: 'set an alternative registry url',
      default: getRegistry()
    })
    .options('f', {
      alias: 'flatten',
      description: 'return flat list of dependencies',
      default: false,
      boolean: true
    })
    .options('j', {
      alias: 'json',
      description: 'return dependencies as JSON',
      default: false,
      boolean: true
    })
var argv = yargs.argv
var treeify = require('treeify')
var spinner = require('char-spinner')
var npa = require('npm-package-arg')

require('../dist/index.cjs').config({
  verbose: argv.verbose,
  development: argv.development,
  license: argv.license,
  optional: argv.optional,
  peer: argv.peer,
  registry: argv.registry
})

var name = argv.name || argv._[0] || ''

if (argv.help || !name) {
  yargs.showHelp()
} else {
  spinner()
  var parsed = npa(name)
  ls(parsed.name, parsed.rawSpec || argv.version, argv.flatten, obj => {
    if (argv.json) console.log(JSON.stringify(obj))
    else if (Array.isArray(obj)) console.log(obj.join('\n'))
    else console.log(treeify.asTree(obj))
  })
}
