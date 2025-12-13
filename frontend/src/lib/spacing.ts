/**
 * Spacing Design Tokens
 * Mobile-first responsive spacing system
 * 
 * Usage Guidelines:
 * - Use these constants instead of arbitrary Tailwind classes
 * - Mobile: 4px base unit (sm spacing)
 * - Tablet: 6px base unit (md spacing)
 * - Desktop: 8px base unit (lg spacing)
 * 
 * Example:
 * <div className={SPACING.stack.md}>
 *   <Component />
 * </div>
 */

export const SPACING = {
  // Vertical spacing between stacked elements
  stack: {
    xs: "space-y-2 md:space-y-3",      // 8px → 12px
    sm: "space-y-3 md:space-y-4",      // 12px → 16px
    md: "space-y-4 md:space-y-6",      // 16px → 24px
    lg: "space-y-6 md:space-y-8",      // 24px → 32px
    xl: "space-y-8 md:space-y-12",     // 32px → 48px
  },

  // Horizontal spacing between inline elements
  inline: {
    xs: "gap-2 md:gap-3",              // 8px → 12px
    sm: "gap-3 md:gap-4",              // 12px → 16px
    md: "gap-4 md:gap-6",              // 16px → 24px
    lg: "gap-6 md:gap-8",              // 24px → 32px
  },

  // Section padding (vertical)
  section: {
    tight: "py-4 md:py-6 lg:py-8",     // 16px → 24px → 32px
    normal: "py-6 md:py-8 lg:py-12",   // 24px → 32px → 48px
    relaxed: "py-8 md:py-12 lg:py-16", // 32px → 48px → 64px
  },

  // Card/Container padding
  container: {
    sm: "p-3 md:p-4",                  // 12px → 16px
    md: "p-4 md:p-6",                  // 16px → 24px
    lg: "p-6 md:p-8",                  // 24px → 32px
  },
} as const;

/**
 * Typography Scale
 * Mobile-first responsive text sizing
 */
export const TEXT = {
  display: "text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight",
  h1: "text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight",
  h2: "text-xl md:text-2xl lg:text-3xl font-semibold leading-snug",
  h3: "text-lg md:text-xl lg:text-2xl font-semibold leading-snug",
  h4: "text-base md:text-lg font-semibold leading-snug",
  body: "text-sm md:text-base leading-relaxed",
  bodyLarge: "text-base md:text-lg leading-relaxed",
  small: "text-xs md:text-sm leading-normal",
  caption: "text-xs text-muted-foreground leading-tight",
} as const;

/**
 * Breakpoint tokens for consistency
 * Use these in your responsive logic
 */
export const BREAKPOINTS = {
  mobile: "0px",      // Default
  tablet: "768px",    // md:
  desktop: "1024px",  // lg:
} as const;

/**
 * Common layout patterns
 */
export const LAYOUT = {
  // Grid patterns
  grid: {
    cols2: "grid grid-cols-1 md:grid-cols-2",
    cols3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    cols4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    colsAuto: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  },
  
  // Flex patterns
  flex: {
    between: "flex items-center justify-between",
    center: "flex items-center justify-center",
    start: "flex items-start justify-between",
    column: "flex flex-col",
  },
} as const;