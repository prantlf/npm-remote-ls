import cleanup from 'rollup-plugin-cleanup'

export default {
  input: 'lib/index.js',
  output: [
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.mjs',
      format: 'es',
      sourcemap: true
    }
  ],
  external: [
    'lodash', 'async', 'semver', 'request', 'once', 'npm-package-arg',
    'cacheman', 'registry-url'
  ],
  plugins: [cleanup()]
}
