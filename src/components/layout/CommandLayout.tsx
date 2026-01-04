import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CommandLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Fixed 3-panel layout for the Command Center
 * 
 * Structure:
 * - Top Bar: 80px fixed height (spans full width)
 * - Left Sidebar: 280px fixed width (scrollable)
 * - Center Map: Flexible width, minimum ~1200px (primary view)
 * - Right Panel: 440px fixed width (scrollable, action zone)
 * 
 * Why Fixed Grid:
 * - Operators build muscle memory (always know where things are)
 * - No disorienting layout shifts during state changes
 * - Parallel information processing (see multiple things simultaneously)
 * - Easy training (same layout for all scenarios)
 */
export function CommandLayout({ children, className }: CommandLayoutProps) {
  return (
    <div className={cn("command-layout bg-background", className)}>
      {children}
    </div>
  );
}

interface TopBarSlotProps {
  children: ReactNode;
  className?: string;
}

export function TopBarSlot({ children, className }: TopBarSlotProps) {
  return (
    <header className={cn(
      "command-topbar bg-background border-b border-primary/20",
      "flex items-center px-4",
      className
    )}>
      {children}
    </header>
  );
}

interface LeftSidebarSlotProps {
  children: ReactNode;
  className?: string;
}

export function LeftSidebarSlot({ children, className }: LeftSidebarSlotProps) {
  return (
    <aside className={cn(
      "command-sidebar bg-sidebar border-r border-primary/20",
      "p-3 space-y-3",
      className
    )}>
      {children}
    </aside>
  );
}

interface CenterMapSlotProps {
  children: ReactNode;
  className?: string;
}

export function CenterMapSlot({ children, className }: CenterMapSlotProps) {
  return (
    <main className={cn(
      "command-map bg-background",
      "p-3",
      className
    )}>
      {children}
    </main>
  );
}

interface RightPanelSlotProps {
  children: ReactNode;
  className?: string;
}

export function RightPanelSlot({ children, className }: RightPanelSlotProps) {
  return (
    <aside className={cn(
      "command-panel bg-card border-l border-primary/20",
      "p-3 space-y-3",
      className
    )}>
      {children}
    </aside>
  );
}