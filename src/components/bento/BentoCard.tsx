import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  priority?: "high" | "medium" | "low";
  collapsed?: boolean;
  glowing?: boolean;
  pulsing?: "cyan" | "amber" | "red";
  title?: string;
  icon?: ReactNode;
  headerAction?: ReactNode;
  noPadding?: boolean;
}

export const BentoCard = ({
  children,
  className,
  priority = "medium",
  collapsed = false,
  glowing = false,
  pulsing,
  title,
  icon,
  headerAction,
  noPadding = false,
}: BentoCardProps) => {
  const priorityStyles = {
    high: "border-primary/40",
    medium: "border-primary/20",
    low: "border-primary/10",
  };

  const pulsingStyles = {
    cyan: "animate-pulse-border",
    amber: "animate-pulse-border-amber",
    red: "animate-pulse-border-red",
  };

  return (
    <div
      className={cn(
        "relative bg-card rounded-lg border transition-all duration-300 overflow-hidden",
        priorityStyles[priority],
        glowing && "glow-cyan",
        pulsing && pulsingStyles[pulsing],
        collapsed && "opacity-60",
        className
      )}
    >
      {(title || icon || headerAction) && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-primary/10">
          <div className="flex items-center gap-2">
            {icon && <span className="text-primary">{icon}</span>}
            {title && (
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {title}
              </h3>
            )}
          </div>
          {headerAction}
        </div>
      )}
      <div className={cn(!noPadding && "p-3")}>{children}</div>
    </div>
  );
};
