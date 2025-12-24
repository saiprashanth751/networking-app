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
import { LinkPreviewPlugin } from '../editor/LinkPreviewPlugin';
import { extractHashtags } from '../editor/HashtagPlugin';
import { CategorySelector } from './CategorySelector';
import { TagInput } from './TagInput';
import { DraftRecovery } from './DraftRecovery';
import { useCategories } from '@/hooks/queries/category';
import { useCreatePost } from '@/hooks/mutations/post';
import { CreatePostInput } from '@/types/types';
import { toast } from 'react-toastify';

interface CreatePostModalProps {
    open: boolean;
    onClose: () => void;
}

export function CreatePostModal({ open, onClose }: CreatePostModalProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState<any>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [linkPreview, setLinkPreview] = useState('');

    const { data: categories = [], isLoading: categoriesLoading } = useCategories();
    const createPostMutation = useCreatePost();

    const handleSubmit = async () => {
        if (!content) {
            toast.error('Please add content to your post');
            return;
        }

        try {
            // For NOW, we'll convert new format to old format for existing backend
            // TODO: Update backend to accept new format with Lexical JSON
            const contentText = extractTextFromContent(content);

            const postData: CreatePostInput = {
                title: title.trim() || 'Untitled Post',
                description: contentText, // Convert Lexical to plain text for now
                labels: [], // Empty for now - will use categories after backend update
                links: linkPreview ? [linkPreview] : [],
                photos: images,
            };

            await createPostMutation.mutateAsync(postData);

            toast.success('Post created successfully! 🎉');

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
        setTags([]);
        setImages([]);
        setLinkPreview('');
    };

    const handleRestoreDraft = (draft: any) => {
        setTitle(draft.title || '');
        setContent(draft.content);
        setSelectedCategories(draft.categoryIds || []);
        setTags(draft.tags || []);
        toast.info('Draft restored! Continue editing...');
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

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />
                            Create Post
                        </DialogTitle>

                        {/* Draft Auto-save Indicator */}
                        {content && (
                            <DraftRecovery
                                content={content}
                                title={title}
                                categoryIds={selectedCategories}
                                tags={tags}
                                onRestore={handleRestoreDraft}
                            />
                        )}
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Title (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            Title <span className="text-neutral-400">(Optional)</span>
                        </Label>
                        <Input
                            id="title"
                            placeholder="Give your post a catchy title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                            className="text-lg font-semibold border-2 focus:border-primary transition-colors"
                        />
                        {title && (
                            <p className="text-xs text-neutral-500 text-right">
                                {title.length}/100
                            </p>
                        )}
                    </div>

                    {/* Content Editor */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            Content <span className="text-red-500">*</span>
                        </Label>
                        <LexicalEditor
                            onChange={setContent}
                            initialContent={content}
                            placeholder="What's on your mind? Use #hashtags to tag topics..."
                        />
                    </div>

                    {/* Categories */}
                    {categoriesLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : (
                        <CategorySelector
                            categories={categories}
                            selectedCategories={selectedCategories}
                            onChange={setSelectedCategories}
                            maxSelection={2}
                        />
                    )}

                    {/* Tags */}
                    <TagInput
                        tags={tags}
                        onChange={setTags}
                        maxTags={10}
                    />

                    {/* Images */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            Images <span className="text-neutral-400">(Max 5)</span>
                        </Label>
                        <ImageUploadPlugin onImagesChange={setImages} maxImages={5} />
                    </div>

                    {/* Link Preview */}
                    <LinkPreviewPlugin onLinkAdd={setLinkPreview} existingLink={linkPreview} />

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-neutral-200 dark:border-neutral-800">
                        <p className="text-xs text-neutral-500">
                            💡 Your post will be visible to all users
                        </p>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={createPostMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={createPostMutation.isPending || !content}
                                className="min-w-[120px]"
                            >
                                {createPostMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Publish Post
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
