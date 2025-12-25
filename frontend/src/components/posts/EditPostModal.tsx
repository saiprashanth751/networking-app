import { useState, useEffect } from 'react';
import { Loader2, Pencil } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LexicalEditor } from '../editor/LexicalEditor';
import { CategorySelector } from './CategorySelector';
import { useCategories } from '@/hooks/queries/category';
import { useUpdatePost } from '@/hooks/mutations/engagement';
import { Post } from '@/types/types';
import { toast } from 'react-toastify';

interface EditPostModalProps {
    post: Post;
    isOpen: boolean;
    onClose: () => void;
}

export function EditPostModal({ post, isOpen, onClose }: EditPostModalProps) {
    const [content, setContent] = useState<any>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [initialContent, setInitialContent] = useState<string | null>(null);

    const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
    const categories = categoriesData?.categories || [];
    const updatePostMutation = useUpdatePost();

    // Pre-fill form with existing post data
    useEffect(() => {
        if (post && isOpen) {
            // Set initial content for editor
            const contentString = post.content as string;
            setInitialContent(contentString);

            // CRITICAL: Also parse and set content state so we have it even if user doesn't type
            try {
                const parsedContent = JSON.parse(contentString);
                setContent(parsedContent);
            } catch (error) {
                console.error('Failed to parse initial content:', error);
                setContent(null);
            }

            // Set selected categories
            const categoryIds = post.categories?.map((cat: any) => cat.category.id) || [];
            setSelectedCategories(categoryIds);
        }
    }, [post, isOpen]);

    const handleSubmit = async () => {
        if (!content) {
            toast.error('Please add content to your post');
            return;
        }

        try {
            await updatePostMutation.mutateAsync({
                postId: post.id,
                data: {
                    content: JSON.stringify(content),
                    categoryIds: selectedCategories,
                },
            });

            // Success - close modal
            onClose();
        } catch (error: any) {
            console.error('❌ Failed to update post:', error);
            // Error toast handled by mutation
        }
    };

    const handleContentChange = (contentJSON: any) => {
        // OnChangePlugin already calls editorState.toJSON() before passing here
        console.log('Editor changed, new content:', contentJSON);
        setContent(contentJSON);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Pencil className="h-5 w-5" />
                        Edit Post
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Lexical Editor */}
                    <div>
                        <LexicalEditor
                            initialContent={initialContent}
                            onChange={handleContentChange}
                            placeholder="What's on your mind?"
                        />
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Categories
                        </label>
                        {categoriesLoading ? (
                            <div className="text-sm text-muted-foreground">Loading categories...</div>
                        ) : (
                            <CategorySelector
                                categories={categories}
                                selectedCategories={selectedCategories}
                                onChange={setSelectedCategories}
                            />
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={updatePostMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={updatePostMutation.isPending || !content}
                        >
                            {updatePostMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Update Post
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
