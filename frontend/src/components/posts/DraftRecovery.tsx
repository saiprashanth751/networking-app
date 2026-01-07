import { useEffect, useState } from 'react';
import { Save, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';
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
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

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
    autoSaveInterval = 5000, // 5 seconds (faster feedback)
}: DraftRecoveryProps) {
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showDraftsModal, setShowDraftsModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const queryClient = useQueryClient();
    const saveDraftMutation = useSaveDraft();
    const { data: draftsData } = useUserDrafts();
    const deleteDraftMutation = useDeleteDraft();

    // Safely extract drafts array
    const drafts = draftsData?.drafts || [];
    const currentDraft = drafts[0]; // Single draft mode - only show first one

    // Auto-save logic
    useEffect(() => {
        if (!content) return;

        const timer = setTimeout(() => {
            handleAutoSave();
        }, autoSaveInterval);

        return () => clearTimeout(timer);
    }, [content, title, categoryIds, tags, autoSaveInterval]);

    const handleAutoSave = async () => {
        setIsSaving(true);
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
        } finally {
            setIsSaving(false);
        }
    };

    const handleRestoreDraft = (draft: any) => {
        if (onRestore) {
            onRestore(draft);
            setShowDraftsModal(false);
        }
    };

    const handleDeleteDraft = async (draftId: string) => {
        if (!confirm('Delete this draft? This cannot be undone.')) {
            return;
        }

        try {
            // Optimistic update - remove from UI immediately
            queryClient.setQueryData(['drafts'], (old: any) => {
                if (!old?.drafts) return old;
                return {
                    ...old,
                    drafts: old.drafts.filter((d: any) => d.id !== draftId)
                };
            });

            await deleteDraftMutation.mutateAsync(draftId);
            toast.success('Draft deleted');
            setShowDraftsModal(false);
        } catch (error) {
            // Revert on error
            queryClient.invalidateQueries({ queryKey: ['drafts'] });
            toast.error('Failed to delete draft');
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
        if (seconds < 10) return 'Saved just now';
        if (seconds < 60) return `Saved ${seconds}s ago`;
        if (seconds < 3600) return `Saved ${Math.floor(seconds / 60)}m ago`;
        return `Saved ${Math.floor(seconds / 3600)}h ago`;
    };

    return (
        <>
            {/* Auto-save Indicator */}
            <div className="flex items-center gap-2">
                <div className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded-md transition-all text-xs',
                    isSaving && 'bg-amber-500/10 text-amber-500',
                    lastSaved && !isSaving && 'bg-green-500/10 text-green-500'
                )}>
                    {isSaving ? (
                        <>
                            <Save className="h-3 w-3 animate-pulse" />
                            <span className="font-medium">Saving...</span>
                        </>
                    ) : lastSaved ? (
                        <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="font-medium">{getTimeSinceLastSave()}</span>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="h-3 w-3 text-neutral-500" />
                            <span className="text-neutral-500">Not saved</span>
                        </>
                    )}
                </div>

                {currentDraft && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDraftsModal(true)}
                        className="h-7 px-2 text-xs text-blue-500 hover:text-blue-400"
                    >
                        View draft
                    </Button>
                )}
            </div>

            {/* Draft Modal - Single Draft */}
            <Dialog open={showDraftsModal} onOpenChange={setShowDraftsModal}>
                <DialogContent className="max-w-lg bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>Your Draft</DialogTitle>
                        <DialogDescription>
                            Restore your previous draft or delete it
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4">
                        {!currentDraft ? (
                            <p className="text-center text-neutral-500 py-8">
                                No draft found
                            </p>
                        ) : (
                            <div className="p-4 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors bg-neutral-900/50">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        {currentDraft.title && (
                                            <h4 className="font-semibold line-clamp-1">{currentDraft.title}</h4>
                                        )}
                                        <p className="text-sm text-neutral-400 line-clamp-2">
                                            {currentDraft.contentText || 'No content'}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                                            <span>
                                                {new Date(currentDraft.updatedAt).toLocaleString()}
                                            </span>
                                            {currentDraft.categoryIds && currentDraft.categoryIds.length > 0 && (
                                                <span>
                                                    {currentDraft.categoryIds.length} {currentDraft.categoryIds.length === 1 ? 'category' : 'categories'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleRestoreDraft(currentDraft)}
                                            className="bg-blue-500 hover:bg-blue-600"
                                        >
                                            Restore
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDeleteDraft(currentDraft.id)}
                                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
