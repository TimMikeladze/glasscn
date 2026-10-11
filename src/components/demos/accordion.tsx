import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/glass/accordion"

const faq = [
  ["sync", "Does my journal sync?", "Entries sync end-to-end encrypted across every device signed in to your account."],
  ["export", "Can I export entries?", "Yes — as Markdown, PDF or a JSON archive from Settings › Data."],
  ["streak", "What counts toward a streak?", "Any entry with at least one sentence, written before midnight in your time zone."],
]

export default function AccordionDemo() {
  return (
    <div className="grid w-full max-w-md gap-8">
      <Accordion type="single" collapsible defaultValue="sync">
        {faq.map(([value, q, a]) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger>{q}</AccordionTrigger>
            <AccordionContent>{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Accordion type="multiple" variant="grouped">
        <AccordionItem value="reminders">
          <AccordionTrigger>Reminders</AccordionTrigger>
          <AccordionContent>Morning at 8:00, evening at 21:30.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="privacy">
          <AccordionTrigger>Privacy</AccordionTrigger>
          <AccordionContent>Face ID is required to open the journal.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
