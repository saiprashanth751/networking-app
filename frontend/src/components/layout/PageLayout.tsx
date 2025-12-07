import { cn } from "@/lib/utils";
import { Container } from "./Container";

interface PageLayoutProps {
  children: React.ReactNode;
  containerSize?: "sm" | "md" | "lg" | "full";
  className?: string;
  showAppBar?: boolean;
}

/**
 * PageLayout - Master layout wrapper for all pages
 * Handles consistent spacing, background, and AppBar integration
 * 
 * Usage:
 * <PageLayout containerSize="lg">
 *   <PageHeader title="Dashboard" />
 *   <Section>Your content</Section>
 * </PageLayout>
 */
export function PageLayout({
  children,
  containerSize = "lg",
  className,
  showAppBar = true,
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background",
        showAppBar && "pt-16", // Space for fixed AppBar
        className
      )}
    >
      <Container size={containerSize} className="py-6 md:py-8">
        {children}
      </Container>
    </div>
  );
}