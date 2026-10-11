"use client"

import { Button } from "@/components/glass/button"
import { Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/glass/drawer"

export default function DrawerDemo() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="glass">Today’s prompt</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>What surprised you today?</DrawerTitle>
          <DrawerDescription>Drag the grabber up for more room, or down to dismiss.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <p className="text-sm text-muted-foreground">Small things count: a conversation, a smell, a song you hadn’t heard in years.</p>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Start writing</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
