import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    gradient?: string;
    className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon: Icon,
    description,
    trend,
    gradient = 'from-blue-500 to-indigo-600',
    className
}) => {
    return (
        <Card className={cn(
            "relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 group",
            className
        )}>
            {/* Gradient Background */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity",
                gradient
            )} />

            <CardContent className="p-6 relative">
                <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                            {trend && (
                                <span className={cn(
                                    "text-xs font-medium flex items-center gap-1",
                                    trend.isPositive ? "text-green-600" : "text-red-600"
                                )}>
                                    {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                                </span>
                            )}
                        </div>
                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                    </div>

                    {/* Icon with gradient background */}
                    <div className={cn(
                        "p-3 rounded-lg bg-gradient-to-br",
                        gradient
                    )}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default StatsCard;
