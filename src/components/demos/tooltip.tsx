import { SettingsIcon } from "lucide-react"

import { Button } from "@/components/glass/button"
import { Kbd } from "@/components/glass/kbd"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/glass/tooltip"

export default function TooltipDemo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="glass" size="icon" aria-label="Settings">
            <SettingsIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Settings <Kbd>,</Kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
