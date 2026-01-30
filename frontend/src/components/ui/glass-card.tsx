import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className,
    hover = true
}) => {
    return (
        <Card className={cn(
            "relative overflow-hidden",
            "bg-background/60 backdrop-blur-md",
            "border border-border/50",
            "shadow-lg",
            hover && "hover:shadow-xl hover:border-primary/20 transition-all duration-300",
            className
        )}>
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </Card>
    );
};

export default GlassCard;
