import { Stack, useLocalSearchParams } from "expo-router"

import { DEMOS } from "@/sandbox/demos"
import { Body, Screen } from "@/sandbox/ui"

/** One ported component, by registry name: /c/button, /c/data-table … */
export default function ComponentScreen() {
  const { name } = useLocalSearchParams<{ name: string }>()
  const demo = DEMOS[name as keyof typeof DEMOS]
  return (
    <Screen>
      <Stack.Screen options={{ title: demo?.title ?? name }} />
      {demo ? demo.render() : <Body>No native demo for {name}.</Body>}
    </Screen>
  )
}
