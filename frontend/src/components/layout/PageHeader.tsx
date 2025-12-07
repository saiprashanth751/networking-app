import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backTo?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * PageHeader component for consistent page titles
 * Shows at the top of every page with optional back button and actions
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
    <div className={cn("space-y-4", className)}>
      {/* Back Button */}
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      )}

      {/* Header Content */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-lg text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Action Buttons */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />
    </div>
  );
}