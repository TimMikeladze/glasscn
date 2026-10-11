"use client"

import { BookOpenIcon, CalendarIcon, MoonIcon, StarIcon, TagIcon } from "lucide-react"

import {
  BackgroundExtension,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/glass/sidebar"

export default function SidebarDemo() {
  return (
    <SidebarProvider className="h-[28rem] min-h-0 w-full max-w-3xl overflow-hidden rounded-surface">
      <Sidebar position="absolute" aria-label="Library">
        <SidebarHeader>
          <span className="type-glass-heading text-base">Nightly</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Library</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <MoonIcon />
                  <span>Tonight</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <BookOpenIcon />
                  <span>Entries</span>
                  <SidebarMenuBadge>401</SidebarMenuBadge>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton href="#">This month</SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton href="#">Archived</SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <StarIcon />
                  <span>Favourites</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Browse</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <CalendarIcon />
                  <span>Calendar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <TagIcon />
                  <span>Tags</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="overflow-y-auto">
        <BackgroundExtension>
          <div className="h-48 bg-[linear-gradient(135deg,var(--aurora-1),var(--aurora-2),var(--aurora-3))]" />
        </BackgroundExtension>
        <div className="grid gap-2 p-4">
          <SidebarTrigger />
          <h2 className="type-glass-heading text-xl">Tonight</h2>
          <p className="text-sm text-muted-foreground">The picture runs on under the sidebar, mirrored and blurred. Press ⌘B to collapse.</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
