"use client"

import * as React from "react"

import { Button } from "@/components/glass/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/glass/card"
import { Input } from "@/components/glass/input"
import { Label } from "@/components/glass/label"
import { Separator } from "@/components/glass/separator"

/** A sign-in card floating on the aurora. Wire `onSubmit` to your auth. */
export function Auth01({ onSubmit }: { onSubmit?: (data: { email: string; password: string }) => void }) {
  return (
    <Card intensity="strong" className="mx-auto w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in to pick up where you left off.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            const form = new FormData(e.currentTarget)
            onSubmit?.({ email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") })
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="auth-01-email">Email</Label>
            <Input id="auth-01-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="auth-01-password">Password</Label>
              <a href="#" className="text-xs text-primary hover:underline">
                Forgot?
              </a>
            </div>
            <Input id="auth-01-password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <Button type="submit" size="lg" className="mt-2 w-full">
            Sign in
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Separator className="flex-1" />
            or
            <Separator className="flex-1" />
          </div>
          <Button type="button" variant="glass" className="w-full">
            Continue with a passkey
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        New here?&nbsp;
        <a href="#" className="font-medium text-primary hover:underline">
          Create an account
        </a>
      </CardFooter>
    </Card>
  )
}
