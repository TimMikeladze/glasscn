import * as React from "react"
import { View } from "react-native"
import { ArrowRight, MoreHorizontal, Pen, Plus, Sprout, Trash2 } from "lucide-react-native"

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/glass/native/avatar"
import { Badge } from "@/components/glass/native/badge"
import { Button } from "@/components/glass/native/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/glass/native/card"
import { Input } from "@/components/glass/native/input"
import { Kbd, KbdGroup } from "@/components/glass/native/kbd"
import { Label } from "@/components/glass/native/label"
import { Prose } from "@/components/glass/native/prose"
import { Separator } from "@/components/glass/native/separator"
import { Textarea } from "@/components/glass/native/textarea"
import { ThemeScope } from "@/components/glass/native/theme-scope"
import { Blockquote, Display, Heading, InlineCode, List, Text, TextLink } from "@/components/glass/native/typography"
import { Body, Section } from "@/sandbox/ui"
import type { Demo } from "@/sandbox/demos/types"

const row = { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 } as const
const PHOTO = "https://picsum.photos/seed/glasscn/128"

const MARKDOWN = `## The method

Most days are forgettable. So each night, name what **mattered** and decide how it changes _tomorrow_. [Read more](https://example.com).

> Keep the gains small. Let them compound.

### Each night

1. What was the most significant thing that happened today?
2. How will it change what you do tomorrow?

- Stored as \`carryId\`
- One question at a time

\`\`\`
const promise = entries[yesterday].answers[carryId]
\`\`\``

function Sample({ title }: { title: string }) {
  return (
    <Card size="sm" style={{ width: 240 }}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Same component, its own theme.</CardDescription>
      </CardHeader>
      <CardContent style={row}>
        <Button size="sm">
          <Pen /> Write
        </Button>
        <Badge variant="tinted">On</Badge>
      </CardContent>
    </Card>
  )
}

function Fields() {
  const [name, setName] = React.useState("")
  const [note, setNote] = React.useState("")
  return (
    <>
      <Section title="Input">
        <Label nativeID="name-label">Name</Label>
        <Input aria-labelledby="name-label" placeholder="Your name" value={name} onChangeText={setName} />
        <Input placeholder="Invalid" invalid defaultValue="not-an-email" />
        <Input placeholder="Disabled" disabled />
        <Input placeholder="Password" secureTextEntry />
      </Section>
      <Section title="Textarea" note="Grows with its text">
        <Textarea placeholder="What mattered today?" value={note} onChangeText={setNote} />
        <Textarea placeholder="Capped at 160" maxHeight={160} />
        <Textarea placeholder="Invalid" invalid />
        <Textarea placeholder="Disabled" disabled />
      </Section>
    </>
  )
}

export const demos: Record<string, Demo> = {
  typography: {
    title: "Typography",
    render: () => (
      <>
        <Section title="Headings">
          <Heading level={1}>Small gains, every night.</Heading>
          <Heading level={2}>Level 2</Heading>
          <Heading level={3}>Level 3</Heading>
          <Heading level={4}>Level 4</Heading>
          <Heading level={5}>Level 5</Heading>
          <Heading level={6}>Level 6</Heading>
          <Heading level={2} size="display">
            Display size
          </Heading>
        </Section>
        <Section title="Text variants">
          <Text variant="overline">Day 401 of 1,826</Text>
          <Text variant="lead">Name what mattered today and decide how it changes tomorrow.</Text>
          <Text variant="large">Large</Text>
          <Text>Body</Text>
          <Text variant="small">Small</Text>
          <Text variant="muted">Muted</Text>
          <Text variant="caption">Caption</Text>
        </Section>
        <Section title="Display">
          <View style={[row, { alignItems: "flex-end" }]}>
            <Display size="sm">40</Display>
            <Display size="md">401</Display>
            <Display>401</Display>
            <Display size="xl">7</Display>
          </View>
        </Section>
        <Section title="Quote, code, lists, links">
          <Blockquote>“Breathe twice before engaging.”</Blockquote>
          <Text>
            Carry one answer with <InlineCode>carryId</InlineCode> — read the <TextLink href="https://example.com">method</TextLink>.
          </Text>
          <List>
            {"One question at a time"}
            {"Carry one answer"}
          </List>
          <List ordered>
            {"Name it"}
            {"Decide"}
            {"Sleep"}
          </List>
        </Section>
      </>
    ),
  },
  prose: {
    title: "Prose",
    render: () => (
      <>
        <Section title="Markdown string">
          <Prose>{MARKDOWN}</Prose>
        </Section>
        <Section title="Children">
          <Prose>
            <Heading level={3}>Composed</Heading>
            <Body>Non-string children render as-is, spaced.</Body>
          </Prose>
        </Section>
      </>
    ),
  },
  card: {
    title: "Card",
    render: () => (
      <>
        <Section title="Default">
          <Card>
            <CardHeader>
              <CardTitle>Tonight’s reflection</CardTitle>
              <CardDescription>Two questions, a few minutes.</CardDescription>
              <CardAction>
                <Button variant="ghost" size="icon-sm" accessibilityLabel="More">
                  <MoreHorizontal />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>What was the most significant thing that happened today?</CardContent>
            <CardFooter>
              <Button style={{ flex: 1, alignSelf: "auto" }}>Begin</Button>
            </CardFooter>
          </Card>
        </Section>
        <Section title="size sm · intensity · tint · elevation">
          <Card size="sm" intensity="strong">
            <CardHeader>
              <CardTitle>Strong</CardTitle>
            </CardHeader>
          </Card>
          <Card size="sm" intensity="subtle" elevation="flat">
            <CardHeader>
              <CardTitle>Subtle, flat</CardTitle>
            </CardHeader>
          </Card>
          <Card size="sm" tint="primary">
            <CardHeader>
              <CardTitle>Primary tint</CardTitle>
            </CardHeader>
          </Card>
          <Card size="sm" tint="destructive">
            <CardHeader>
              <CardTitle>Destructive tint</CardTitle>
            </CardHeader>
          </Card>
        </Section>
      </>
    ),
  },
  "theme-scope": {
    title: "Theme scope",
    render: () => (
      <Section title="Nested themes">
        <View style={row}>
          <ThemeScope palette="ocean">
            <Sample title="Ocean" />
          </ThemeScope>
          <ThemeScope palette="rose" scheme="light">
            <Sample title="Rose · light" />
          </ThemeScope>
          <ThemeScope palette="sage" scheme="dark">
            <Sample title="Sage · dark" />
          </ThemeScope>
        </View>
      </Section>
    ),
  },
  button: {
    title: "Button",
    render: () => (
      <>
        <Section title="Variants">
          <View style={row}>
            <Button>
              <Pen /> Write tonight
            </Button>
            <Button variant="glass">Glass</Button>
            <Button variant="tinted">Tinted</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">
              <Trash2 /> Delete
            </Button>
            <Button variant="link">
              Learn more <ArrowRight />
            </Button>
          </View>
        </Section>
        <Section title="Sizes">
          <View style={row}>
            <Button size="xs">xs</Button>
            <Button size="sm">sm</Button>
            <Button>default</Button>
            <Button size="lg">lg</Button>
          </View>
          <View style={row}>
            <Button size="icon-xs" accessibilityLabel="Add">
              <Plus />
            </Button>
            <Button size="icon-sm" variant="tinted" accessibilityLabel="Add">
              <Plus />
            </Button>
            <Button size="icon" variant="glass" accessibilityLabel="Add">
              <Plus />
            </Button>
            <Button size="icon-lg" variant="secondary" accessibilityLabel="Add">
              <Plus />
            </Button>
          </View>
        </Section>
        <Section title="Shape · disabled">
          <View style={row}>
            <Button shape="rounded" variant="glass">
              Rounded
            </Button>
            <Button shape="rounded">Rounded</Button>
            <Button disabled>Disabled</Button>
            <Button disabled variant="outline">
              Disabled
            </Button>
          </View>
        </Section>
      </>
    ),
  },
  badge: {
    title: "Badge",
    render: () => (
      <Section title="Variants">
        <View style={row}>
          <Badge>Default</Badge>
          <Badge variant="tinted">Tinted</Badge>
          <Badge variant="glass">Glass</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">
            <Trash2 /> Destructive
          </Badge>
        </View>
      </Section>
    ),
  },
  input: { title: "Input", render: () => <Fields /> },
  textarea: { title: "Textarea", render: () => <Fields /> },
  label: {
    title: "Label",
    render: () => (
      <Section title="Label">
        <Label>Plain</Label>
        <Label>
          <Sprout size={14} /> With icon
        </Label>
        <Label disabled>Disabled</Label>
      </Section>
    ),
  },
  kbd: {
    title: "Kbd",
    render: () => (
      <Section title="Keys">
        <View style={row}>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>P</Kbd>
          </KbdGroup>
          <Kbd>Esc</Kbd>
        </View>
      </Section>
    ),
  },
  separator: {
    title: "Separator",
    render: () => (
      <Section title="Horizontal and vertical">
        <Body>Above</Body>
        <Separator />
        <Body>Below</Body>
        <View style={[row, { height: 24 }]}>
          <Body>Today</Body>
          <Separator orientation="vertical" decorative={false} />
          <Body>Journal</Body>
          <Separator orientation="vertical" />
          <Body>Insights</Body>
        </View>
      </Section>
    ),
  },
  avatar: {
    title: "Avatar",
    render: () => (
      <>
        <Section title="Sizes and fallbacks">
          <View style={row}>
            <Avatar size="sm">
              <AvatarFallback>SL</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src={PHOTO} alt="Sam Lee" />
              <AvatarFallback>SL</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>
                <Sprout />
              </AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarImage src="https://invalid.example/broken.png" alt="Broken" />
              <AvatarFallback>ER</AvatarFallback>
            </Avatar>
          </View>
        </Section>
        <Section title="Group">
          <AvatarGroup>
            <Avatar>
              <AvatarImage src={PHOTO} alt="Sam Lee" />
              <AvatarFallback>SL</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>MK</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>JR</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+4</AvatarGroupCount>
          </AvatarGroup>
          <AvatarGroup>
            <Avatar size="lg">
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>CD</AvatarFallback>
            </Avatar>
            <AvatarGroupCount size="lg">+9</AvatarGroupCount>
          </AvatarGroup>
        </Section>
      </>
    ),
  },
}
