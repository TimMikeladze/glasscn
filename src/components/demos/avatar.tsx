import { SproutIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/glass/avatar"

const dusk = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#f6a57c"/><stop offset="1" stop-color="#8b6fd8"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><circle cx="32" cy="26" r="11" fill="#fff" fill-opacity=".85"/><path d="M12 60c3-12 12-17 20-17s17 5 20 17" fill="#fff" fill-opacity=".85"/></svg>`
)}`

export default function AvatarDemo() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4">
        <Avatar size="sm">
          <AvatarFallback>SL</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src={dusk} alt="Sam Lee" />
          <AvatarFallback>SL</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback className="bg-primary/16 text-primary">
            <SproutIcon />
          </AvatarFallback>
        </Avatar>
      </div>
      <AvatarGroup>
        <Avatar>
          <AvatarImage src={dusk} alt="Sam Lee" />
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
    </div>
  )
}
