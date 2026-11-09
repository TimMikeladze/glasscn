import * as React from "react"
import { Stack } from "expo-router"

import { ActionSheet, ActionSheetAction, ActionSheetCancel, ActionSheetContent, ActionSheetDescription, ActionSheetHeader, ActionSheetTitle, ActionSheetTrigger } from "@/components/glass/native/action-sheet"
import { Button } from "@/components/glass/native/button"
import { Body, Screen, Section } from "@/sandbox/ui"

export default function ActionSheetContracts() {
  const [actions, setActions] = React.useState(0)
  const [changes, setChanges] = React.useState<boolean[]>([])
  const [sourcePresses, setSourcePresses] = React.useState(0)
  return <Screen picker={false}>
    <Stack.Screen options={{ title: "Action sheet contracts" }} />
    <Section title="System source presentation" note="Plain uncontrolled actions use SwiftUI ConfirmationDialog. The system decides the layout and Cancel visibility.">
      <ActionSheet onOpenChange={(open) => setChanges((values) => [...values, open])}>
        <ActionSheetTrigger asChild onPress={() => setSourcePresses((value) => value + 1)}><Button variant="glass" accessibilityLabel="Entry options">Entry options</Button></ActionSheetTrigger>
        <ActionSheetContent>
          <ActionSheetHeader><ActionSheetTitle>Night 311</ActionSheetTitle><ActionSheetDescription>Choose what to do with this entry.</ActionSheetDescription></ActionSheetHeader>
          <ActionSheetAction onAction={() => setActions((value) => value + 1)}>Archive entry</ActionSheetAction>
          <ActionSheetAction variant="destructive" disabled>Delete entry</ActionSheetAction>
          <ActionSheetCancel />
        </ActionSheetContent>
      </ActionSheet>
      <Body>Actions: {actions} · source presses: {sourcePresses}</Body>
      <Body>Open changes: {changes.map(String).join(", ") || "none"}</Body>
      <Button variant="secondary" accessibilityLabel="Following action">Following action</Button>
    </Section>
  </Screen>
}
