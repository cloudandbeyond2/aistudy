import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminStatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    gradient?: string;
    iconColor?: string;
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({
    title,
    value,
    icon: Icon,
    description,
    trend,
    gradient = 'from-blue-500 via-blue-600 to-indigo-600',
    iconColor = 'text-blue-600'
}) => {
    return (
        <Card className="relative overflow-hidden border-border/50 hover:shadow-xl transition-all duration-300 group">
            {/* Animated gradient background */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
                gradient
            )} />

            {/* Decorative circle */}
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 blur-2xl" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={cn(
                    "p-2 rounded-lg bg-gradient-to-br from-background to-muted",
                    "ring-1 ring-border/50"
                )}>
                    <Icon className={cn("h-4 w-4", iconColor)} />
                </div>
            </CardHeader>

            <CardContent className="relative z-10">
                <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold tracking-tight">{value}</div>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                            trend.isPositive
                                ? "bg-green-500/10 text-green-600"
                                : "bg-red-500/10 text-red-600"
                        )}>
                            <span>{trend.isPositive ? "↑" : "↓"}</span>
                            <span>{Math.abs(trend.value)}%</span>
                        </div>
                    )}
                </div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
            </CardContent>
        </Card>
    );
};

export default AdminStatCard;
