import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/glass/tabs"

export default function TabsDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <Tabs defaultValue="week">
        <TabsList>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>
        <TabsContent value="week" className="text-muted-foreground">5 of 7 nights written.</TabsContent>
        <TabsContent value="month" className="text-muted-foreground">23 of 31 nights written.</TabsContent>
        <TabsContent value="year" className="text-muted-foreground">311 nights this year.</TabsContent>
      </Tabs>
      <Tabs defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
