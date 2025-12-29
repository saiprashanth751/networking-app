import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  className?: string;
}

/**
 * Container component for consistent page width and padding
 * Used on every page to ensure proper content width
 * 
 * Usage:
 * <Container size="lg">Your content</Container>
 */
export function Container({ 
  children, 
  size = "lg", 
  className 
}: ContainerProps) {
  const sizeClasses = {
    sm: "max-w-3xl",     // 768px - For narrow content like forms
    md: "max-w-5xl",     // 1024px - For medium content like profiles
    lg: "max-w-7xl",     // 1280px - For wide content like dashboards
    full: "max-w-full",  // Full width
  };

  return (
    <div
      className={cn(
        "mx-auto w-full",
        "px-4 sm:px-6 lg:px-8", // Responsive padding
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}