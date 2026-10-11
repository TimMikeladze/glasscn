import * as React from "react"
import { ScrollView, type ScrollViewProps } from "react-native"

/** A scroll container with the platform's thin indicators (iOS already draws capsule thumbs). */
function ScrollArea({ edges, children, ...props }: ScrollViewProps & { edges?: boolean }) {
  void edges
  return (
    <ScrollView indicatorStyle="default" {...props}>
      {children}
    </ScrollView>
  )
}

/** Native scroll indicators are built in; kept for API parity. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ScrollBar(props: { orientation?: "vertical" | "horizontal" }) {
  return null
}

export { ScrollArea, ScrollBar }
