import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  trend?: number; // Optional percentage trend
  className?: string;
}

export default function AdminStatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: AdminStatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground tracking-tight">
          {title}
        </h3>
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      
      {/* Optional decorative background element */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none">
        <Icon className="h-24 w-24" />
      </div>
    </div>
  );
}
