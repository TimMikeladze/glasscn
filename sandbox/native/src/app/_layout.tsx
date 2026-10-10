import { Stack } from "expo-router"
import { Platform } from "react-native"
import { StatusBar } from "expo-status-bar"

import { Toaster } from "@/components/glass/native/toaster"
import { useGlassTheme } from "@/components/glass/native/tokens"
import { SandboxThemeProvider } from "@/sandbox/theme"

function Nav() {
  const t = useGlassTheme()
  return (
    <>
      <StatusBar style={t.scheme === "dark" ? "light" : "dark"} />
      {/* default push transition: a slide, never a fade — Liquid Glass must not sit under a fading ancestor */}
      <Stack
        screenOptions={{
          // iOS scrolls content under the transparent header (contentInsetAdjustmentBehavior); elsewhere the header sits above
          headerTransparent: Platform.OS === "ios",
          headerStyle: Platform.OS === "ios" ? undefined : { backgroundColor: t.auroraBase },
          headerTintColor: t.primary,
          headerTitleStyle: { color: t.foreground },
          headerLargeTitleStyle: { color: t.foreground },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: t.auroraBase },
        }}
      >
        <Stack.Screen name="index" options={{ title: "glasscn native", headerLargeTitle: true }} />
        <Stack.Screen name="tokens" options={{ title: "Tokens" }} />
        <Stack.Screen name="glass" options={{ title: "Glass" }} />
        <Stack.Screen name="aurora" options={{ title: "Aurora" }} />
        <Stack.Screen name="press" options={{ title: "Press" }} />
        <Stack.Screen name="c/[name]" options={{ title: "Component" }} />
      </Stack>
      {/* toasts are an overlay at the root, above every screen */}
      <Toaster />
    </>
  )
}

export default function RootLayout() {
  return (
    <SandboxThemeProvider>
      <Nav />
    </SandboxThemeProvider>
  )
}
