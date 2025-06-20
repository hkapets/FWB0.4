import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <div
      className={cn("animate-in fade-in duration-500 ease-out", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

interface SlideInProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
}

export function SlideIn({
  children,
  className,
  direction = "up",
  delay = 0,
}: SlideInProps) {
  const directionClasses = {
    up: "slide-in-from-bottom-4",
    down: "slide-in-from-top-4",
    left: "slide-in-from-right-4",
    right: "slide-in-from-left-4",
  };

  return (
    <div
      className={cn(
        "animate-in duration-500 ease-out",
        directionClasses[direction],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

interface ScaleInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScaleIn({ children, className, delay = 0 }: ScaleInProps) {
  return (
    <div
      className={cn("animate-in zoom-in duration-500 ease-out", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

interface StaggeredListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function StaggeredList({
  children,
  className,
  staggerDelay = 100,
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
          style={{ animationDelay: `${index * staggerDelay}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

interface PulseGlowProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

export function PulseGlow({
  children,
  className,
  color = "yellow",
}: PulseGlowProps) {
  const colorClasses = {
    yellow: "animate-pulse-glow-yellow",
    blue: "animate-pulse-glow-blue",
    green: "animate-pulse-glow-green",
    purple: "animate-pulse-glow-purple",
    red: "animate-pulse-glow-red",
  };

  return (
    <div
      className={cn(
        colorClasses[color as keyof typeof colorClasses],
        className
      )}
    >
      {children}
    </div>
  );
}

interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  intensity?: "sm" | "md" | "lg";
}

export function HoverLift({
  children,
  className,
  intensity = "md",
}: HoverLiftProps) {
  const intensityClasses = {
    sm: "hover:scale-[1.02] hover:-translate-y-1",
    md: "hover:scale-[1.05] hover:-translate-y-2",
    lg: "hover:scale-[1.1] hover:-translate-y-3",
  };

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out",
        intensityClasses[intensity],
        className
      )}
    >
      {children}
    </div>
  );
}
