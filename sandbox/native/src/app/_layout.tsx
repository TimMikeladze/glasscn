import { Stack } from "expo-router"
import { Platform } from "react-native"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { KeyboardProvider } from "react-native-keyboard-controller"

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
        <Stack.Screen name="tabs-layout" options={{ title: "Tabs layout" }} />
      </Stack>
      {/* toasts are an overlay at the root, above every screen */}
      <Toaster />
    </>
  )
}

export default function RootLayout() {
  return (
    // gesture-handler and keyboard-controller roots: every glasscn native app needs both
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SandboxThemeProvider>
          <Nav />
        </SandboxThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  )
}
