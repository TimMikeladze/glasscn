// Component tests (NAT-51): jest-expo + Testing Library over the registry's native items,
// read live from ../../registry/native like Metro does (or from components/glass/native in
// verify-native's installed copy, which sets GLASS_NATIVE_DIR).
const path = require("node:path")

const native = process.env.GLASS_NATIVE_DIR ? path.resolve(process.env.GLASS_NATIVE_DIR) : path.resolve(__dirname, "../../registry/native")

module.exports = {
  preset: "jest-expo/ios",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.test.tsx"],
  setupFiles: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/components/glass/native/(.*)$": `${native}/$1`,
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@expo/ui(/.*)?$": "<rootDir>/jest.expo-ui.js",
  },
  // registry/native resolves its imports from this app's node_modules
  resolver: "<rootDir>/jest.resolver.js",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@shopify/flash-list|lucide-react-native|react-native-svg|@tanstack/.*|standard-navigation)",
  ],
  testTimeout: 30000,
}
