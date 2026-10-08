import { Button } from "@/components/glass/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/glass/dialog"

export default function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="glass">Start over</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Erase every night?</DialogTitle>
          <DialogDescription>311 nights and all settings will be removed from this device. This can’t be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="glass">Cancel</Button>
          </DialogClose>
          <Button variant="destructive">Erase everything</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
