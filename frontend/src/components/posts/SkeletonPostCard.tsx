export function SkeletonPostCard() {
    return (
        <div className="bg-card border border-border rounded-2xl p-6 animate-pulse">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
                {/* Avatar skeleton */}
                <div className="w-10 h-10 rounded-full bg-neutral-800" />

                <div className="flex-1">
                    {/* Name skeleton */}
                    <div className="h-4 bg-neutral-800 rounded w-32 mb-2" />
                    {/* Time skeleton */}
                    <div className="h-3 bg-neutral-800 rounded w-20" />
                </div>

                {/* Menu button skeleton */}
                <div className="w-8 h-8 bg-neutral-800 rounded-full" />
            </div>

            {/* Content */}
            <div className="space-y-2 mb-4">
                <div className="h-4 bg-neutral-800 rounded w-full" />
                <div className="h-4 bg-neutral-800 rounded w-5/6" />
                <div className="h-4 bg-neutral-800 rounded w-4/6" />
            </div>

            {/* Image skeleton (optional - 60% of posts have images) */}
            {Math.random() > 0.4 && (
                <div className="h-64 bg-neutral-800 rounded-xl mb-4" />
            )}

            {/* Category chips skeleton */}
            <div className="flex gap-2 mb-4">
                <div className="h-6 w-20 bg-neutral-800 rounded-full" />
                <div className="h-6 w-24 bg-neutral-800 rounded-full" />
            </div>

            {/* Actions skeleton */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-6">
                    {/* Comment */}
                    <div className="flex items-center gap-1">
                        <div className="w-8 h-8 bg-neutral-800 rounded-full" />
                        <div className="w-6 h-3 bg-neutral-800 rounded" />
                    </div>
                    {/* Share */}
                    <div className="flex items-center gap-1">
                        <div className="w-8 h-8 bg-neutral-800 rounded-full" />
                        <div className="w-6 h-3 bg-neutral-800 rounded" />
                    </div>
                    {/* Like */}
                    <div className="flex items-center gap-1">
                        <div className="w-8 h-8 bg-neutral-800 rounded-full" />
                        <div className="w-6 h-3 bg-neutral-800 rounded" />
                    </div>
                </div>
                {/* Bookmark */}
                <div className="w-8 h-8 bg-neutral-800 rounded-full" />
            </div>
        </div>
    );
}

/**
 * Renders multiple skeleton post cards
 */
export function SkeletonPostFeed({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonPostCard key={i} />
            ))}
        </div>
    );
}
