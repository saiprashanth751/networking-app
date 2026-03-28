// Feed & Filter Types
export type SortOption = 'recent' | 'popular' | 'trending';
export type ContentType = 'all' | 'posts' | 'projects' | 'jobs';
export type ReportReason = 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE' | 'MISINFORMATION' | 'OTHER';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

export interface FeedFilters {
    categorySlugs?: string[];
    tagSlugs?: string[];
    followingOnly?: boolean;
    type?: ContentType;
    sort?: SortOption;
}

export interface FilterPreset {
    id: string;
    name: string;
    description?: string;
    filters: FeedFilters;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PostReport {
    id: string;
    postId: string;
    reason: ReportReason;
    description?: string;
    status: ReportStatus;
    createdAt: string;
    post?: {
        title?: string;
        user: {
            id: string;
            firstName: string;
            lastName?: string;
        };
    };
}
