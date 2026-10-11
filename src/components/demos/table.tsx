import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/glass/table"

const week = [
  { day: "Monday", ritual: "Morning pages", minutes: 20, streak: 41 },
  { day: "Tuesday", ritual: "Evening reflection", minutes: 12, streak: 42 },
  { day: "Wednesday", ritual: "Morning pages", minutes: 25, streak: 43 },
  { day: "Thursday", ritual: "Gratitude list", minutes: 8, streak: 44 },
  { day: "Friday", ritual: "Evening reflection", minutes: 15, streak: 45 },
]

export default function TableDemo() {
  const total = week.reduce((sum, d) => sum + d.minutes, 0)
  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>This week</CardTitle>
        <CardDescription>Five entries, one unbroken chain.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Minutes spent writing, by day.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Day</TableHead>
              <TableHead>Ritual</TableHead>
              <TableHead numeric>Minutes</TableHead>
              <TableHead numeric>Streak</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {week.map((d) => (
              <TableRow key={d.day}>
                <TableCell className="font-medium">{d.day}</TableCell>
                <TableCell className="text-muted-foreground">{d.ritual}</TableCell>
                <TableCell numeric>{d.minutes}</TableCell>
                <TableCell numeric>{d.streak} days</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell numeric>{total}</TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}
