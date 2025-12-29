import { cn } from "@/lib/utils";
import { Container } from "./Container";

interface PageLayoutProps {
  children: React.ReactNode;
  containerSize?: "sm" | "md" | "lg" | "full";
  className?: string;
  showAppBar?: boolean;
  /** Vertical spacing - maps to mobile/tablet/desktop */
  spacing?: "tight" | "normal" | "relaxed";
}

/**
 * PageLayout - Master layout wrapper for all pages
 * Handles consistent spacing, background, and AppBar integration
 * 
 * Mobile-first responsive spacing:
 * - tight: py-4 md:py-6 lg:py-8
 * - normal: py-6 md:py-8 lg:py-12 (default)
 * - relaxed: py-8 md:py-12 lg:py-16
 * 
 * Usage:
 * <PageLayout containerSize="lg" spacing="normal">
 *   <PageHeader title="Dashboard" />
 *   <Section>Your content</Section>
 * </PageLayout>
 */
export function PageLayout({
  children,
  containerSize = "lg",
  className,
  showAppBar = true,
  spacing = "normal",
}: PageLayoutProps) {
  // Mobile-first spacing scale
  const spacingClasses = {
    tight: "py-4 md:py-6 lg:py-8",
    normal: "py-6 md:py-8 lg:py-12",
    relaxed: "py-8 md:py-12 lg:py-16",
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-background",
        showAppBar && "pt-16", // Space for fixed AppBar
        className
      )}
    >
      <Container size={containerSize} className={spacingClasses[spacing]}>
        {children}
      </Container>
    </div>
  );
}