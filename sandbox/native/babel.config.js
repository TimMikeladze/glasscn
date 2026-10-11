// Expo's default — spelled out so jest also transforms ../../registry/native with it.
module.exports = (api) => {
  api.cache(true)
  return { presets: ["babel-preset-expo"] }
}
