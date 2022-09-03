# @prantlf/npm-remote-ls

[![Latest version](https://img.shields.io/npm/v/@prantlf/npm-remote-ls)
 ![Dependency status](https://img.shields.io/librariesio/release/npm/@prantlf/npm-remote-ls)
](https://www.npmjs.com/package/@prantlf/npm-remote-ls)
[![Code coverage](https://codecov.io/gh/prantlf/npm-remote-ls/branch/master/graph/badge.svg)](https://codecov.io/gh/prantlf/npm-remote-ls)

Examine a package's dependency graph before you install it.

This is a fork of the original project ([npm/npm-remote-ls](https://github.com/npm/npm-remote-ls)) with the following enhancements:

* Export an ES module for modern projects
* Expose TypeScript types for TypeScript projects
* Return results by a callback or by a promise
* Let the errors from package loading be inspected
* Depend on recent NPM packlages without security issues
* Add option to show licence information (by Michael Hutcherson)
* Show complete flattened list (by Roberto Aceves)
* Add caching for network requests (by Jonathan Fielding)
* Support scoped NPM packages (by Tommaso Allevi)
* Prevent optional dependencies from being mixed into mandatory depednencies (by Daniel Lobato Garcia)

## Installation

```bash
npm install @prantlf/npm-remote-ls -g
```

## Usage

### Listing Package Dependencies

```
npm-remote-ls sha@1.2.4

└─ sha@1.2.4
   ├─ readable-stream@1.0.27-1
   │  ├─ isarray@0.0.1
   │  ├─ string_decoder@0.10.25
   │  ├─ inherits@2.0.1
   │  └─ core-util-is@1.0.1
   └─ graceful-fs@3.0.2
```

### Help!

There are various command line flags you can toggle for `npm-remote-ls`, for details run:

```
npm-remote-ls --help

Examine a package's dependency graph before you install it.

Usage: npm-remote-ls [options] <name> [<version>]

Parameters:
  name     package name    (mandatory)
  version  package version (default: "latest")

Options:
  -r, --registry     set an alternative registry url (default: as configured)
  -d, --development  show development dependencies   (default: true)
  -o, --optional     show optional dependencies      (default: true)
  -p, --peer         show peer dependencies          (default: false)
  -l, --license      show license information        (default: false)
  -f, --flatten      print flat list of dependencies (default: false)
  -j, --json         print dependencies as JSON      (default: false)
  -e, --verbose      enable verbose logging          (default: false)
  -i, --silent       suppress all logging            (default: false)
  -s, --strict       use non-zero exit code if fails (default: false)
  -V, --version      print version number
  -h, --help         print usage instructions

Examples:
  npm-remote-ls grunt
  npm-remote-ls grunt 0.1.0
  npm-remote-ls grunt@0.1.0
  npm-remote-ls -f grunt 0.1.0
```

## API

**Return dependency graph for `latest` version (with await):**

```javascript
import { ls } from '@prantlf/npm-remote-ls'

const { packages } = await ls('grunt')
console.log(packages)
```

**Return dependency graph for specific version (with promise):**

```javascript
const { ls } = require('@prantlf/npm-remote-ls')

ls('grunt', '0.1.0').then(packages => console.log(packages))
```

**Return a flattened list of dependencies (with callback):**

```javascript
const { ls } = require('@prantlf/npm-remote-ls')

ls('grunt', '0.1.0', true, function (packages) {
  console.log(packages)
})
```

**Check errors with a promise:**

```javascript
import { ls } from '@prantlf/npm-remote-ls'

const { packages, errors } = await ls('grunt', '10.0.0', true)
console.log(packages)  // Array of packages may not be complete
console.log(errors)    // Array of Error instances
```

**Check errors with a callback:**

```javascript
const { ls } = require('@prantlf/npm-remote-ls')

ls('grunt', '10.0.0', true, (packages, errors) => {
  console.log(packages)  // Array of packages may not be complete
  console.log(errors)    // Array of Error instances
})
```

**Configure to only return production dependencies:**

```javascript
const { config, ls } = require('@prantlf/npm-remote-ls')

config({
  development: false,
  optional: false
})

ls('yargs', 'latest', true, function (packages) {
  console.log(packages)
})
```

**Configure to return peer dependencies:**

```javascript
const { config, ls } = require('@prantlf/npm-remote-ls')

config({
  peer: true
})

ls('grunt-contrib-coffee', 'latest', true, function (packages) {
  console.log(packages)
})
```

**Configuration options:**

| Name          | Type                   | Default   | Description                        |
| ------------- | ---------------------- | --------- | ---------------------------------- |
| `logger`      | `{ log: msg => void }` | `console` | log errors and progress            |
| `registry`    | `string`               | `'https://registry.npmjs.org'` | NPM registry URL |
| `development` | `boolean`              | `true`    | include development dependencies   |
| `optional`    | `boolean`              | `true`    | include optional dependencies      |
| `peer`        | `boolean`              | `false`   | include peer dependencies          |
| `license`     | `boolean`              | `false`   | include license information        |
| `verbose`     | `boolean`              | `false`   | log progress of package loading    |
| `silent`      | `boolean`              | `false`   | suppress error and verbose logging |
| `strict`      | `boolean`              | `false`   | use non-zero exit code in case of failure |

## License

ISC
