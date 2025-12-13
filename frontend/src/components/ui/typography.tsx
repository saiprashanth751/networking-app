import { cn } from "@/lib/utils";
import { TEXT } from "@/lib/spacing";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
}

/**
 * Display - Largest text, for hero sections and major headlines
 * Mobile: 3xl → Tablet: 4xl → Desktop: 5xl
 */
export function Display({ children, className, as = "h1" }: TypographyProps) {
  const Component = as;
  return (
    <Component className={cn(TEXT.display, className)}>
      {children}
    </Component>
  );
}

/**
 * H1 - Page titles and primary headings
 * Mobile: 2xl → Tablet: 3xl → Desktop: 4xl
 */
export function H1({ children, className, as = "h1" }: TypographyProps) {
  const Component = as;
  return (
    <Component className={cn(TEXT.h1, className)}>
      {children}
    </Component>
  );
}

/**
 * H2 - Section headings
 * Mobile: xl → Tablet: 2xl → Desktop: 3xl
 */
export function H2({ children, className, as = "h2" }: TypographyProps) {
  const Component = as;
  return (
    <Component className={cn(TEXT.h2, className)}>
      {children}
    </Component>
  );
}

/**
 * H3 - Subsection headings
 * Mobile: lg → Tablet: xl → Desktop: 2xl
 */
export function H3({ children, className, as = "h3" }: TypographyProps) {
  const Component = as;
  return (
    <Component className={cn(TEXT.h3, className)}>
      {children}
    </Component>
  );
}

/**
 * H4 - Card titles and smaller headings
 * Mobile: base → Tablet: lg
 */
export function H4({ children, className, as = "h4" }: TypographyProps) {
  const Component = as;
  return (
    <Component className={cn(TEXT.h4, className)}>
      {children}
    </Component>
  );
}

/**
 * Body - Standard body text
 * Mobile: sm → Tablet: base
 */
export function Body({ children, className, as = "p" }: TypographyProps) {
  const Component = as;
  return (
    <Component className={cn(TEXT.body, className)}>
      {children}
    </Component>
  );
}

/**
 * BodyLarge - Emphasized body text
 * Mobile: base → Tablet: lg
 */
export function BodyLarge({ children, className, as = "p" }: TypographyProps) {
  const Component = as;
  return (
    <Component className={cn(TEXT.bodyLarge, className)}>
      {children}
    </Component>
  );
}

/**
 * Small - Secondary text
 * Mobile: xs → Tablet: sm
 */
export function Small({ children, className, as = "span" }: TypographyProps) {
  const Component = as;
  return (
    <Component className={cn(TEXT.small, className)}>
      {children}
    </Component>
  );
}

/**
 * Caption - Smallest text, for labels and metadata
 * Mobile: xs (no scaling)
 */
export function Caption({ children, className, as = "span" }: TypographyProps) {
  const Component = as;
  return (
    <Component className={cn(TEXT.caption, className)}>
      {children}
    </Component>
  );
}