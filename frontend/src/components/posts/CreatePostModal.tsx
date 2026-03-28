import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LexicalEditor } from '../editor/LexicalEditor';
import { ImageUploadPlugin } from '../editor/ImageUploadPlugin';
import { CategorySelector } from './CategorySelector';
import { DraftRecovery } from './DraftRecovery';
import { useCategories } from '@/hooks/queries/category';
import { useCreatePost } from '@/hooks/mutations/post';
// import { CreatePostInput } from '@/types/types';
import { toast } from 'react-toastify';
import { mediaService } from '@/api/media'
import { postService } from '@/api/post';

interface CreatePostModalProps {
    open: boolean;
    onClose: () => void;
}

export function CreatePostModal({ open, onClose }: CreatePostModalProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState<any>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [images, setImages] = useState<File[]>([]);

    const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
    const categories = categoriesData?.categories || [];
    const createPostMutation = useCreatePost();

    const handleSubmit = async () => {
        if (!content) {
            toast.error('Please add content to your post');
            return;
        }

        let draftPostId: string | null = null;

        try {
            // ===== Production Workflow Step 1: Create Draft =====
            toast.info('Creating draft...');

            const draftResponse = await postService.createDraft({
                title: title.trim() || null,
                content: content,
                categoryIds: selectedCategories,
            });

            draftPostId = draftResponse.post.id;
            console.log('✅ Draft created:', draftPostId);

            // ===== Production Workflow Step 2: Upload Media (if any) =====
            if (images.length > 0) {
                toast.info(`Uploading ${images.length} image(s)...`);

                await Promise.all(
                    images.map(async (file) => {
                        const formData = new FormData();
                        formData.append('file', file);
                        await mediaService.uploadMedia(draftPostId!, formData);
                    })
                );

                console.log('✅ All images uploaded');
            }

            // ===== Production Workflow Step 3: Publish Post =====
            toast.info('Publishing post...');

            await postService.publishPost(draftPostId);

            console.log('✅ Post published successfully');
            toast.success('Post created successfully!');

            // Success - reset form and close
            resetForm();
            onClose();

        } catch (error: any) {
            console.error('❌ Failed to create post:', error);

            // Cleanup: Delete draft post if it was created
            if (draftPostId) {
                try {
                    console.log('🧹 Cleaning up draft post:', draftPostId);
                    await postService.deletePost(draftPostId);
                } catch (cleanupError) {
                    console.error('Failed to cleanup draft:', cleanupError);
                }
            }

            toast.error(error.response?.data?.message || 'Failed to create post. Please try again.');
        }
    };

    const resetForm = () => {
        setTitle('');
        setContent(null);
        setSelectedCategories([]);
        setImages([]);
    };

    const handleRestoreDraft = (draft: any) => {
        setTitle(draft.title || '');
        setContent(draft.content);
        setSelectedCategories(draft.categoryIds || []);
        toast.info('Draft restored! Continue editing...');
    };

    const handleCategoryChange = (newCategories: string[]) => {
        if (newCategories.length > 2) {
            toast.warning('You can only select up to 2 categories');
            return;
        }
        setSelectedCategories(newCategories);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] bg-card border-border">
                <div className="overflow-y-auto max-h-[calc(90vh-2rem)] scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-background">
                    <DialogHeader>
                        <div className="flex items-center justify-between pr-8">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                                <Sparkles className="h-5 w-5 text-blue-500" />
                                Create Post
                            </DialogTitle>

                            {/* Draft Auto-save Indicator */}
                            {content && (
                                <DraftRecovery
                                    content={content}
                                    title={title}
                                    categoryIds={selectedCategories}
                                    tags={[]}
                                    onRestore={handleRestoreDraft}
                                />
                            )}
                        </div>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                        {/* Title (Optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-medium text-neutral-300">
                                Title <span className="text-neutral-500">(Optional)</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="Give your post a title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={100}
                                className="bg-background border-border focus:border-blue-500 text-base text-foreground"
                            />
                            {title && (
                                <p className="text-xs text-neutral-500 text-right">
                                    {title.length}/100
                                </p>
                            )}
                        </div>

                        {/* Content Editor - Main Focus */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-neutral-300">
                                Content <span className="text-blue-500">*</span>
                            </Label>
                            <div className="text-xs text-neutral-400 mb-2">
                                💡 Use #hashtags for topics • Paste links directly • Style your text
                            </div>
                            <LexicalEditor
                                onChange={setContent}
                                initialContent={content}
                                placeholder="What's on your mind? Share your thoughts, add links, use #hashtags..."
                            />
                        </div>

                        {/* Images */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-neutral-300">
                                Images <span className="text-neutral-500">(Optional, max 5)</span>
                            </Label>
                            <ImageUploadPlugin onImagesChange={setImages} maxImages={5} />
                        </div>

                        {/* Categories */}
                        {categoriesLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-sm text-neutral-500 py-4">
                                No categories available. Please contact administrator.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium text-neutral-300">
                                        Categories <span className="text-neutral-500">(Select up to 2)</span>
                                    </Label>
                                    {selectedCategories.length > 0 && (
                                        <span className="text-xs text-neutral-500">
                                            {selectedCategories.length}/2 selected
                                        </span>
                                    )}
                                </div>
                                <CategorySelector
                                    categories={categories}
                                    selectedCategories={selectedCategories}
                                    onChange={handleCategoryChange}
                                    maxSelection={2}
                                />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                            <p className="text-xs text-neutral-500">
                                💡 Your post will be visible to everyone
                            </p>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={createPostMutation.isPending}
                                    className="bg-background border-border hover:bg-muted text-foreground"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={createPostMutation.isPending || !content}
                                    className="bg-blue-500 hover:bg-blue-600 min-w-[100px]"
                                >
                                    {createPostMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Post
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
