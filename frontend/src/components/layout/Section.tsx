import { cn } from "@/lib/utils";
import { SPACING } from "@/lib/spacing";

interface SectionProps {
  children: React.ReactNode;
  spacing?: "tight" | "normal" | "relaxed";
  className?: string;
}

/**
 * Section - Consistent vertical spacing for page sections
 * Mobile-first responsive spacing
 * 
 * Spacing options:
 * - tight: py-4 md:py-6 lg:py-8
 * - normal: py-6 md:py-8 lg:py-12 (default)
 * - relaxed: py-8 md:py-12 lg:py-16
 * 
 * Usage:
 * <Section spacing="normal">
 *   <H2>Section Title</H2>
 *   <Body>Content here</Body>
 * </Section>
 */
export function Section({ 
  children, 
  spacing = "normal", 
  className 
}: SectionProps) {
  return (
    <section className={cn(SPACING.section[spacing], className)}>
      {children}
    </section>
  );
}