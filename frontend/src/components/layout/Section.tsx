import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  spacing?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * Section component for consistent vertical spacing
 * Use this to wrap major sections of your page
 * 
 * Usage:
 * <Section spacing="lg">
 *   <h2>Section Title</h2>
 *   <p>Content here</p>
 * </Section>
 */
export function Section({ 
  children, 
  spacing = "md", 
  className 
}: SectionProps) {
  const spacingClasses = {
    sm: "py-6",           // 24px - Tight spacing
    md: "py-8 md:py-12",  // 32px -> 48px - Standard spacing
    lg: "py-12 md:py-16", // 48px -> 64px - Generous spacing
    xl: "py-16 md:py-20", // 64px -> 80px - Maximum spacing
  };

  return (
    <section className={cn(spacingClasses[spacing], className)}>
      {children}
    </section>
  );
}