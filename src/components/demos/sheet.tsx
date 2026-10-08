import { Button } from "@/components/glass/button"
import { Input } from "@/components/glass/input"
import { Label } from "@/components/glass/label"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/glass/sheet"

export default function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="glass">Open sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New area</SheetTitle>
          <SheetDescription>Something you’re getting better at.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-2 px-5">
          <Label htmlFor="sheet-area">Name</Label>
          <Input id="sheet-area" placeholder="Jiu-jitsu" />
        </div>
        <SheetFooter>
          <Button>Add area</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
