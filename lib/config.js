var config = null

export default function (opts) {
  if (!opts && config) {
    return config
  } else {
    config = opts
    return config
  }
}
