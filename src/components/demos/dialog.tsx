import { Button } from "@/components/glass/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/glass/dialog"
import { Input } from "@/components/glass/input"
import { Label } from "@/components/glass/label"

export default function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="glass">Rename journal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename journal</DialogTitle>
          <DialogDescription>The new name shows on every device and in shared links.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="journal-name">Name</Label>
          <Input id="journal-name" defaultValue="Morning pages" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
