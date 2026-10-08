import { Blockquote, Display, Heading, InlineCode, List, Text, TextLink } from "@/components/glass/typography"

export default function TypographyDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-5">
      <Text variant="overline">Day 401 of 1,826</Text>
      <Heading level={1}>Small gains, every night.</Heading>
      <Text variant="lead">Name what mattered today and decide how it changes tomorrow. Keep the gains small and let them compound.</Text>
      <div className="flex items-end gap-6">
        <Display>401</Display>
        <Text variant="muted" className="pb-2">
          nights written · <span className="numeric-glass">22.0%</span> of the way
        </Text>
      </div>
      <Heading level={3}>Tonight’s promise</Heading>
      <Blockquote>“Breathe twice before engaging.”</Blockquote>
      <List>
        <li>One question at a time</li>
        <li>
          Carry one answer with <InlineCode>carryId</InlineCode>
        </li>
        <li>
          Read the <TextLink href="#">method</TextLink>
        </li>
      </List>
      <Text variant="caption">Set in your theme’s type — try a type preset in the studio.</Text>
    </div>
  )
}
