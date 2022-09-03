export default function (result, ...objects) {
  for (const obj of objects) {
    for (const key in obj) {
      const source = obj[key];
      if (source !== undefined) result[key] = source;
    }
  }
  return result;
}
