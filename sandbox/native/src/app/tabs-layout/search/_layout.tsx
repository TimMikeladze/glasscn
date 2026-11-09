import { Stack } from "expo-router"

// The search tab owns a navigation stack so its screen can carry a system search bar: on iOS 26 a
// `role="search"` tab shows that field at the bottom, in place of the tab bar, as Music and Photos do.
// The bar itself stays transparent and untitled; the sandbox's own header already names the screen.
export default function SearchStack() {
  return <Stack screenOptions={{ headerTransparent: true, headerShadowVisible: false, title: "" }} />
}
