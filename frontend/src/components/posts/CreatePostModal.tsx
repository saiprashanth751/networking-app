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
import { CreatePostInput } from '@/types/types';
import { toast } from 'react-toastify';
import { mediaService } from '@/api/media';

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

        try {
            // Upload media files first if any
            let mediaIds: string[] = [];
            if (images.length > 0) {
                toast.info('Uploading images...');

                mediaIds = await Promise.all(
                    images.map(async (file) => {
                        const formData = new FormData();
                        formData.append('file', file);
                        const response = await mediaService.uploadMedia(formData);
                        return response.media.id;
                    })
                );
            }

            // Create post with proper backend format
            const postData: CreatePostInput = {
                title: title.trim() || null,
                content: content,  // Lexical JSON
                categoryIds: selectedCategories,
                tags: [],  // Backend extracts from content automatically
                mediaIds: mediaIds,
            };

            await createPostMutation.mutateAsync(postData);

            // Success toast handled by mutation hook
            // Reset form
            resetForm();
            onClose();
        } catch (error: any) {
            console.error('Failed to create post:', error);
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black border border-neutral-800">
                <DialogHeader>
                    <div className="flex items-center justify-between pr-8">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
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
                        <Label htmlFor="title" className="text-sm font-medium text-neutral-400">
                            Title <span className="text-neutral-600">(Optional)</span>
                        </Label>
                        <Input
                            id="title"
                            placeholder="Give your post a title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                            className="bg-neutral-900 border-neutral-800 focus:border-blue-500 text-base"
                        />
                        {title && (
                            <p className="text-xs text-neutral-500 text-right">
                                {title.length}/100
                            </p>
                        )}
                    </div>

                    {/* Content Editor - Main Focus */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-neutral-400">
                            Content <span className="text-blue-500">*</span>
                        </Label>
                        <div className="text-xs text-neutral-500 mb-2">
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
                        <Label className="text-sm font-medium text-neutral-400">
                            Images <span className="text-neutral-600">(Optional, max 5)</span>
                        </Label>
                        <ImageUploadPlugin onImagesChange={setImages} maxImages={5} />
                    </div>

                    {/* Categories */}
                    {categoriesLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-neutral-400">
                                    Categories <span className="text-neutral-600">(Select up to 2)</span>
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
                                className="border-neutral-700 hover:bg-neutral-900"
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
            </DialogContent>
        </Dialog>
    );
}
