import rc from 'rc'

export default function getRegistry(scope) {
	const result = rc('npm', { registry: 'https://registry.npmjs.org/' })
	const url = scope && result[`${scope}:registry`] || result.config_registry || result.registry
  /* c8 ignore next */
	return url.endsWith('/') ? url : `${url}/`
}
