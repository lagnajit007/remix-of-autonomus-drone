import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { OperationalState } from "@/types/command-center";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
  operationalState: OperationalState;
}

export const BentoGrid = ({ children, className, operationalState }: BentoGridProps) => {
  // Dynamic grid configurations based on operational state
  const gridConfig = {
    green: "bento-grid-calm",
    amber: "bento-grid-alert",
    red: "bento-grid-critical",
  };

  return (
    <div
      className={cn(
        "h-full w-full p-3 gap-3 transition-all duration-500",
        gridConfig[operationalState],
        className
      )}
    >
      {children}
    </div>
  );
};

// Grid area wrapper component for semantic placement
interface BentoAreaProps {
  children: ReactNode;
  area: "telemetry" | "map" | "alerts" | "mission" | "comms" | "feed" | "command";
  className?: string;
}

export const BentoArea = ({ children, area, className }: BentoAreaProps) => {
  return (
    <div className={cn(`bento-area-${area}`, "min-h-0 min-w-0", className)}>
      {children}
    </div>
  );
};
