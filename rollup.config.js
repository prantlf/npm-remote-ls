import cleanup from 'rollup-plugin-cleanup'

export default {
  input: 'lib/index.js',
  output: [
    { file: 'dist/index.cjs', format: 'cjs', sourcemap: true },
    { file: 'dist/index.mjs', format: 'es', sourcemap: true }
  ],
  external: [
    'async', 'cacheman', 'npm-package-arg', 'once', 'rc', 'request', 'semver'
  ],
  plugins: [cleanup()]
}
