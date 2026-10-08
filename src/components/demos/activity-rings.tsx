import { ActivityRings } from "@/components/glass/activity-rings"

export default function ActivityRingsDemo() {
  return (
    <div className="flex items-center gap-8">
      <ActivityRings
        rings={[
          { value: 0.72, label: "Chain" },
          { value: 0.43, label: "This week" },
          { value: 1.18, label: "Kept" },
        ]}
      />
      <ActivityRings size={88} stroke={10} gap={3} rings={[{ value: 0.9 }, { value: 0.6 }]} />
    </div>
  )
}
