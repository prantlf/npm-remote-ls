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

npm-remote-ls <pkg-name> [options]

Options:
      --help         Show help                                         [boolean]
  -n, --name         package name
  -v, --version      package version                         [default: "latest"]
  -e, --verbose      enable verbose logging           [boolean] [default: false]
  -d, --development  show development dependencies     [boolean] [default: true]
  -l, --license      show license information         [boolean] [default: false]
  -o, --optional     show optional dependencies        [boolean] [default: true]
  -p, --peer         show peer dependencies           [boolean] [default: false]
  -r, --registry     set an alternative registry url   [default: (registry-url)]
  -f, --flatten      return flat list of dependencies [boolean] [default: false]
  -j, --json         return dependencies as JSON      [boolean] [default: false]
```

## API

**Return dependency graph for `latest` version:**

```javascript
import { ls } from '@prantlf/npm-remote-ls'

const { packages } = await ls('grunt')
console.log(packages)
```

**Return dependency graph for specific version:**

```javascript
const { ls } = require('@prantlf/npm-remote-ls')

ls('grunt', '0.1.0').then(packages => console.log(packages))
```

**Return a flattened list of dependencies:**

```javascript
var ls = require('@prantlf/npm-remote-ls').ls

ls('grunt', '0.1.0', true, function (packages) {
  console.log(packages)
})
```

**Check errors with a callback:**

```javascript
const { ls } = require('@prantlf/npm-remote-ls')

ls('grunt', '10.0.0', true, (packages, errors) => {
  console.log(packages)  // Array of packages may not be complete
  console.log(errors)    // Array of Error instances
})
```

**Check errors with a promise:**

```javascript
import { ls } from '@prantlf/npm-remote-ls'

const { packages, errors } = await ls('grunt', '10.0.0', true)
console.log(packages)  // Array of packages may not be complete
console.log(errors)    // Array of Error instances
```

**Configure to only return production dependencies:**

```javascript
const { config, ls } = require('@prantlf/npm-remote-ls')

config({
  development: false,
  optional: false
})

ls('yargs', 'latest', true, function (obj) {
  console.log(obj)
})
```

**Configure to return peer dependencies:**

```javascript
var ls = require('@prantlf/npm-remote-ls').ls
var config = require('@prantlf/npm-remote-ls').config

config({
  peer: true
})

ls('grunt-contrib-coffee', 'latest', true, function (obj) {
  console.log(obj)
})
```

**Configuration options:**

| Name          | Type                   | Default   | Description                      |
| ------------- | ---------------------- | --------- | -------------------------------- |
| `logger`      | `{ log: msg => void }` | `console` | log errors and progress          |
| `registry`    | `string`               | `'https://registry.npmjs.org'` | NPM registry URL |
| `development` | `boolean`              | `true`    | include development dependencies |
| `optional`    | `boolean`              | `true`    | include optional dependencies    |
| `peer`        | `boolean`              | `false`   | include peer dependencies        |
| `license`     | `boolean`              | `false`   | include license information      |
| `verbose`     | `boolean`              | `false`   | log progress of package loading  |

## License

ISC
