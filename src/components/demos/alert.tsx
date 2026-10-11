import { CircleAlertIcon, CircleCheckIcon, InfoIcon } from "lucide-react"

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/glass/alert"
import { Button } from "@/components/glass/button"

export default function AlertDemo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Alert variant="info">
        <InfoIcon />
        <AlertTitle>Daylight saving ends soon</AlertTitle>
        <AlertDescription>Your evening reminder will move with the clocks.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <CircleCheckIcon />
        <AlertTitle>30-day streak</AlertTitle>
        <AlertDescription>You’ve written every day this month.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>Sync paused</AlertTitle>
        <AlertDescription>We couldn’t reach iCloud.</AlertDescription>
        <AlertAction>
          <Button size="xs" variant="secondary">
            Retry
          </Button>
        </AlertAction>
      </Alert>
    </div>
  )
}
