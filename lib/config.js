let config = null

export default function (opts) {
  if (opts || !config) config = opts
  return config
}
