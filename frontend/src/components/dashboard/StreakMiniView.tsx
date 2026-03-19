// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useMemo } from "react";
import { Flame, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityDay = {
  date: string; // "YYYY-MM-DD"
  count: number; // number of actions that day
};

interface Props {
  activity: ActivityDay[];
  currentStreak: number;
  longestStreak: number;
  className?: string;
}

export function StreakMiniView({
  activity,
  currentStreak,
  longestStreak,
  className,
}: Props) {

  const today = new Date();

  // 👉 last 120 days (4 months)
  const startDate = new Date();
  startDate.setDate(today.getDate() - 119);

  // 🔥 map activity
  const dateMap = useMemo(() => {
    const map = new Map<string, number>();
    activity.forEach((d) => map.set(d.date, d.count));
    return map;
  }, [activity]);

  // 🔥 build all days
  const days: { date: Date; count: number }[] = [];

  for (let i = 0; i < 120; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    const key = d.toISOString().split("T")[0];

    days.push({
      date: d,
      count: dateMap.get(key) || 0,
    });
  }

  // 🎨 color levels
  const getColor = (count: number) => {
    if (count === 0) return "bg-muted/40";
    if (count === 1) return "bg-primary/30";
    if (count <= 3) return "bg-primary/60";
    return "bg-primary";
  };

  return (
    <div className={cn("space-y-4", className)}>

      {/* 🔥 Streak Numbers */}
      <div className="grid grid-cols-2 gap-4">

        {/* current */}
        <div className="rounded-xl p-4 border bg-orange-50 text-center">
          <div className="flex items-center justify-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <p className="text-xl font-bold">{currentStreak}</p>
          </div>
          <p className="text-xs text-gray-500">Current streak</p>
        </div>

        {/* longest */}
        <div className="rounded-xl p-4 border bg-purple-50 text-center">
          <p className="text-xl font-bold">{longestStreak}</p>
          <p className="text-xs text-gray-500">Longest streak</p>
        </div>

      </div>

      {/* 📅 Calendar */}
      <div className="rounded-xl border p-4 bg-white">

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            Activity
          </h3>

          <span className="text-xs text-gray-400">
            Last 4 months
          </span>
        </div>

        {/* weekdays */}
        <div className="grid grid-cols-7 gap-1 text-[10px] text-center text-gray-400">
          {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* heatmap */}
        <div className="grid grid-cols-7 gap-1 mt-1">
          {days.map(({ date, count }, i) => (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-sm transition hover:scale-110",
                getColor(count),
                date.toDateString() === today.toDateString() &&
                  "ring-2 ring-primary"
              )}
              title={`${date.toDateString()} → ${count} actions`}
            />
          ))}
        </div>

        {/* legend */}
        <div className="flex justify-between mt-3 text-xs text-gray-500">

          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-muted/40 rounded-sm" />
            0
          </div>

          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary/30 rounded-sm" />
            1
          </div>

          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary/60 rounded-sm" />
            2–3
          </div>

          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary rounded-sm" />
            4+
          </div>

        </div>

      </div>
    </div>
  );
}