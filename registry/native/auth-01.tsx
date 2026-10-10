import * as React from "react"
import { View } from "react-native"

import { Button } from "@/components/glass/native/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/glass/native/card"
import { Input } from "@/components/glass/native/input"
import { Label } from "@/components/glass/native/label"
import { Separator } from "@/components/glass/native/separator"
import { GText } from "@/components/glass/native/ui"

/**
 * A sign-in card floating on the aurora. Wire `onSubmit` to your auth; the links
 * and the passkey button call `onForgot`, `onCreateAccount` and `onPasskey`.
 */
export function Auth01({
  onSubmit,
  onForgot,
  onCreateAccount,
  onPasskey,
}: {
  onSubmit?: (data: { email: string; password: string }) => void
  onForgot?: () => void
  onCreateAccount?: () => void
  onPasskey?: () => void
}) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [tried, setTried] = React.useState(false)
  const submit = () => {
    setTried(true)
    // The web form's `required`: don't submit an empty field.
    if (!email.trim() || !password) return
    onSubmit?.({ email, password })
  }
  return (
    <Card intensity="strong" style={{ width: "100%", maxWidth: 384, alignSelf: "center" }}>
      <CardHeader>
        <CardTitle size="lg" align="center">
          Welcome back
        </CardTitle>
        <CardDescription align="center">Sign in to pick up where you left off.</CardDescription>
      </CardHeader>
      <CardContent style={{ gap: 16 }}>
        <View style={{ gap: 8 }}>
          <Label nativeID="auth-01-email">Email</Label>
          <Input
            accessibilityLabelledBy="auth-01-email"
            accessibilityLabel="Email"
            placeholder="you@example.com"
            inputMode="email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            invalid={tried && !email.trim()}
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Label nativeID="auth-01-password">Password</Label>
            <GText size="xs" tone="primary" accessibilityRole="link" onPress={onForgot}>
              Forgot?
            </GText>
          </View>
          <Input
            accessibilityLabelledBy="auth-01-password"
            accessibilityLabel="Password"
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            invalid={tried && !password}
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={submit}
          />
        </View>
        <Button size="lg" style={{ marginTop: 8, width: "100%" }} onPress={submit}>
          Sign in
        </Button>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Separator style={{ flex: 1, width: undefined }} />
          <GText size="xs" tone="muted">
            or
          </GText>
          <Separator style={{ flex: 1, width: undefined }} />
        </View>
        <Button variant="glass" style={{ width: "100%" }} onPress={onPasskey}>
          Continue with a passkey
        </Button>
      </CardContent>
      <CardFooter style={{ justifyContent: "center", gap: 0 }}>
        <GText size="sm" tone="muted">
          New here?{" "}
          <GText size="sm" tone="primary" weight="500" accessibilityRole="link" onPress={onCreateAccount}>
            Create an account
          </GText>
        </GText>
      </CardFooter>
    </Card>
  )
}
