import { useEffect, useState } from 'react';
import { Save, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUserDrafts } from '@/hooks/queries/draft';
import { useSaveDraft, useDeleteDraft } from '@/hooks/mutations/engagement';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface DraftRecoveryProps {
    content: any;
    title?: string;
    categoryIds?: string[];
    tags?: string[];
    onRestore?: (draft: any) => void;
    autoSaveInterval?: number; // milliseconds
}

export function DraftRecovery({
    content,
    title,
    categoryIds = [],
    tags = [],
    onRestore,
    autoSaveInterval = 10000, // 10 seconds
}: DraftRecoveryProps) {
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showDraftsModal, setShowDraftsModal] = useState(false);

    const saveDraftMutation = useSaveDraft();
    const { data: drafts = [] } = useUserDrafts();
    const deleteDraftMutation = useDeleteDraft();

    // Auto-save logic
    useEffect(() => {
        if (!content) return;

        const timer = setTimeout(() => {
            handleAutoSave();
        }, autoSaveInterval);

        return () => clearTimeout(timer);
    }, [content, title, categoryIds, tags, autoSaveInterval]);

    const handleAutoSave = async () => {
        try {
            // Extract plain text from content
            const contentText = extractTextFromContent(content);

            await saveDraftMutation.mutateAsync({
                title: title || null,
                content,
                contentText,
                categoryIds,
                tags,
            });

            setLastSaved(new Date());
        } catch (error) {
            console.error('Failed to save draft:', error);
        }
    };

    const handleRestoreDraft = (draft: any) => {
        if (onRestore) {
            onRestore(draft);
            setShowDraftsModal(false);
        }
    };

    const handleDeleteDraft = async (draftId: string) => {
        if (confirm('Delete this draft?')) {
            await deleteDraftMutation.mutateAsync(draftId);
        }
    };

    const extractTextFromContent = (content: any): string => {
        try {
            if (!content || !content.root || !content.root.children) return '';
            const extractFromNode = (node: any): string => {
                if (node.text) return node.text;
                if (node.children) return node.children.map(extractFromNode).join(' ');
                return '';
            };
            return content.root.children.map(extractFromNode).join('\n');
        } catch (error) {
            return '';
        }
    };

    const getTimeSinceLastSave = () => {
        if (!lastSaved) return 'Not saved';

        const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
        if (seconds < 60) return 'Saved just now';
        if (seconds < 3600) return `Saved ${Math.floor(seconds / 60)}m ago`;
        return `Saved ${Math.floor(seconds / 3600)}h ago`;
    };

    return (
        <>
            {/* Auto-save Indicator */}
            <div className="flex items-center gap-2 text-xs text-neutral-500">
                <div className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded-md transition-all',
                    saveDraftMutation.isPending && 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
                    lastSaved && !saveDraftMutation.isPending && 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                )}>
                    <Save className={cn(
                        'h-3 w-3',
                        saveDraftMutation.isPending && 'animate-pulse'
                    )} />
                    <span className="font-medium">
                        {saveDraftMutation.isPending ? 'Saving...' : getTimeSinceLastSave()}
                    </span>
                </div>

                {drafts.length > 0 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDraftsModal(true)}
                        className="h-6 px-2 text-xs"
                    >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {drafts.length} draft{drafts.length > 1 ? 's' : ''}
                    </Button>
                )}
            </div>

            {/* Drafts Modal */}
            <Dialog open={showDraftsModal} onOpenChange={setShowDraftsModal}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Your Drafts</DialogTitle>
                        <DialogDescription>
                            Restore a previous draft or delete it
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 mt-4">
                        {drafts.length === 0 ? (
                            <p className="text-center text-neutral-500 py-8">
                                No drafts found
                            </p>
                        ) : (
                            drafts.map((draft: any) => (
                                <div
                                    key={draft.id}
                                    className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            {draft.title && (
                                                <h4 className="font-semibold line-clamp-1">{draft.title}</h4>
                                            )}
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                                                {draft.contentText || 'No content'}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-neutral-500">
                                                <span>
                                                    {new Date(draft.lastSaved).toLocaleString()}
                                                </span>
                                                {draft.tags && draft.tags.length > 0 && (
                                                    <span>
                                                        {draft.tags.length} tag{draft.tags.length > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleRestoreDraft(draft)}
                                            >
                                                Restore
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDeleteDraft(draft.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
