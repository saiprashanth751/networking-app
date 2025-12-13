import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { H1, Body } from "@/components/ui/typography";
import { SPACING } from "@/lib/spacing";

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backTo?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * PageHeader - Consistent page header with mobile-first design
 * 
 * Features:
 * - Responsive typography (H1 scales with viewport)
 * - Optional back navigation
 * - Action buttons (right-aligned)
 * - Mobile-optimized layout
 * 
 * Usage:
 * <PageHeader 
 *   title="Dashboard" 
 *   description="Welcome back!"
 *   showBackButton
 *   actions={<Button>New Post</Button>}
 * />
 */
export function PageHeader({
  title,
  description,
  showBackButton = false,
  backTo,
  actions,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={cn(SPACING.stack.md, className)}>
      {/* Back Button - Mobile optimized */}
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2 -ml-2 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden md:inline">Back</span>
        </Button>
      )}

      {/* Header Content - Responsive flex layout */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className={SPACING.stack.sm}>
          <H1>{title}</H1>
          {description && (
            <Body className="text-muted-foreground">
              {description}
            </Body>
          )}
        </div>

        {/* Action Buttons - Stack on mobile, inline on desktop */}
        {actions && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />
    </div>
  );
}