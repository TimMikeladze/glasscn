"use client"

import * as React from "react"

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/glass/field"
import { Input } from "@/components/glass/input"
import { Switch } from "@/components/glass/switch"
import { Textarea } from "@/components/glass/textarea"

export default function FieldDemo() {
  const [title, setTitle] = React.useState("")
  const tooShort = title.length > 0 && title.length < 3
  return (
    <FieldSet className="w-full max-w-md">
      <FieldLegend>New entry</FieldLegend>
      <FieldGroup>
        <Field data-invalid={tooShort || undefined}>
          <FieldLabel>Title</FieldLabel>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A quiet Sunday" />
          {tooShort ? <FieldError>Use at least 3 characters.</FieldError> : <FieldDescription>Shown in your timeline.</FieldDescription>}
        </Field>
        <Field>
          <FieldLabel>Note</FieldLabel>
          <Textarea placeholder="What happened today?" maxRows={6} />
        </Field>
        <Field orientation="horizontal">
          <FieldLabel>Private</FieldLabel>
          <Switch defaultChecked />
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}
