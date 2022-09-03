# [3.0.0](https://github.com/prantlf/npm-remote-ls/compare/v2.0.0...v3.0.0) (2022-09-03)


### Bug Fixes

* Do not render flat list as an array ([2851d5a](https://github.com/prantlf/npm-remote-ls/commit/2851d5a6a2b472f516406fbfd8316cd6da97aa02))
* Drop dependency on registry-url ([5bdbdb9](https://github.com/prantlf/npm-remote-ls/commit/5bdbdb9e481c8a2cfbd85746cf991f109de49146))
* Drop the dependency on lodash ([e36c636](https://github.com/prantlf/npm-remote-ls/commit/e36c636411321c94c82455bb8ff77fb542fe1904))
* Log to standard error ([cde16d4](https://github.com/prantlf/npm-remote-ls/commit/cde16d495dcc2f46a6118a0bc2672e50f45db465))
* Replace yargs with a hand-written command-line parser ([f34620f](https://github.com/prantlf/npm-remote-ls/commit/f34620f91e98db3699d161bd9f8d1018005c16a8))
* Upgrade async to the most recent version ([055e995](https://github.com/prantlf/npm-remote-ls/commit/055e995817e3674b3eec04436bcf02686a86f3a2))


### Features

* Add command-line argument strict for failing with an exit code ([986addc](https://github.com/prantlf/npm-remote-ls/commit/986addca54117bae812a1dc0daecc1f298bc8ae0))
* Allow disabling logging on standard error on the command line ([f430f55](https://github.com/prantlf/npm-remote-ls/commit/f430f5502e7c199605a346e7918e2f3787e90943))
* Allow printing the dependncy list as JSON ([befd5cc](https://github.com/prantlf/npm-remote-ls/commit/befd5cc1570a7073b837f6168bdbd66025b7ade9))
* Let the errors from package loading be inspected ([d1befaa](https://github.com/prantlf/npm-remote-ls/commit/d1befaa0b01ce2a2f16291cef2eeb0ab824a3aa7))
* Support promises as an alternative to callbacks ([4ac5588](https://github.com/prantlf/npm-remote-ls/commit/4ac55889ccb435094051dd8587e7d043e9dd3f1f))


### BREAKING CHANGES

* Expect errors and debug message on standard error instead of on standard output.
* Provide package name and version as parameters, not flags. Flags should work like they did before, although some unexpected difference might be caused by the replacement of yargs.
* The promised content is not the same as the first callback argument. It is an object with properties `packages` and `errors`. These properties correspond with the first and second arguments of the callback.
* The packages in the flat list are delimited by line breaks.
If you parsed the output as an array, you wil need to simplify your code and
just read it line by line.

# [2.0.0](https://github.com/prantlf/npm-remote-ls/compare/v1.3.2...v2.0.0) (2022-09-02)


### Bug Fixes

* Support license as both string and object ([aa070e1](https://github.com/prantlf/npm-remote-ls/commit/aa070e1cc1c9cfbe4a727847f19a3d577c519105))
* Upgrade NPM dependencies ([89646a6](https://github.com/prantlf/npm-remote-ls/commit/89646a602a4e888dabf386487593f1affcf99901))


### Chores

* Fork the original project ([b99eea3](https://github.com/prantlf/npm-remote-ls/commit/b99eea344773b2c3d7b97e9d6df6a970888e5d1a))


### Features

* Export an ES module and TypeScript types ([6b261b9](https://github.com/prantlf/npm-remote-ls/commit/6b261b941e7112cd5e2c772c5ddf7c7c1a040dea))
* list peer dependencies, defaults off ([#29](https://github.com/prantlf/npm-remote-ls/issues/29)) ([bc233b6](https://github.com/prantlf/npm-remote-ls/commit/bc233b6e15364c3868362030d5b00aa43cc48696))


### BREAKING CHANGES

* The package was renamed from npm-remote-ls to @prantlf/npm-remote-ls.
* The minimum version of Node.js is 12.22. It wasn't clear in earlier releases, what the minimum version was.


<a name="1.3.2"></a>
# [1.3.2](https://github.com/npm/npm-remote-ls/compare/v1.3.1...v1.3.2) (2016-06-24)


### Bug Fixes

* match * with dist-tags.latest for prerelease-only versions ([#26](https://github.com/npm/npm-remote-ls/issues/26)) ([9478a97](https://github.com/npm/npm-remote-ls/commit/9478a97))


<a name="1.3.1"></a>
# [1.3.1](https://github.com/npm/npm-remote-ls/compare/v1.3.0...v1.3.1) (2016-06-15)


### Bug Fixes

* support scoped packages via npm-package-arg ([#25](https://github.com/npm/npm-remote-ls/issues/25)) ([fdda84b](https://github.com/npm/npm-remote-ls/commit/fdda84b))


<a name="1.3.0"></a>
# [1.3.0](https://github.com/npm/npm-remote-ls/compare/v1.2.0...v1.3.0) (2016-04-13)


### Bug Fixes

* fix bug with default registry URL found while adding documentation to address [#10](https://github.com/npm/npm-remote-ls/issues/10) ([556d40f](https://github.com/npm/npm-remote-ls/commit/556d40f)), closes [#10](https://github.com/npm/npm-remote-ls/issues/10)
* switch to appropriate repository URL in package.json ([502841f](https://github.com/npm/npm-remote-ls/commit/502841f))

### Features

* **update:** update to newer versions of all the things ([#20](https://github.com/npm/npm-remote-ls/issues/20)) ([c9be768](https://github.com/npm/npm-remote-ls/commit/c9be768))
