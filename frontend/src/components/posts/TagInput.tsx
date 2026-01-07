import { useState, useRef, useEffect } from 'react';
import { X, Hash, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTagSearch, useTrendingTags } from '@/hooks/queries/tag';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    maxTags?: number;
}

export function TagInput({ tags, onChange, maxTags = 10 }: TagInputProps) {
    const [input, setInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: searchData } = useTagSearch(input.trim());
    const { data: tagsData } = useTrendingTags();

    // Safely extract arrays from API responses
    const searchResults = searchData?.tags || [];
    const trendingTags = tagsData?.tags || [];

    // Filter out already selected tags and limit to 10
    const availableTrendingTags = trendingTags
        .filter((tag: any) => !tags.includes(tag.name))
        .slice(0, 10);

    const suggestions = input.trim()
        ? searchResults.filter((tag: any) => !tags.includes(tag.name))
        : availableTrendingTags;

    const handleAddTag = (tagName: string) => {
        const normalized = tagName.trim().toLowerCase().replace(/^#/, '');

        if (!normalized) return;
        if (tags.includes(normalized)) {
            setInput('');
            return;
        }
        if (tags.length >= maxTags) {
            alert(`Maximum ${maxTags} tags allowed`);
            return;
        }

        onChange([...tags, normalized]);
        setInput('');
        setShowSuggestions(false);
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onChange(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (input.trim()) {
                handleAddTag(input);
            }
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            // Remove last tag on backspace when input is empty
            handleRemoveTag(tags[tags.length - 1]);
        }
    };

    useEffect(() => {
        if (input.trim()) {
            setShowSuggestions(true);
        }
    }, [input]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Tags
                    <span className="text-neutral-500 font-normal">
                        (Optional, max {maxTags})
                    </span>
                </Label>
                <span className="text-xs text-neutral-500">
                    {tags.length}/{maxTags}
                </span>
            </div>

            {/* Tag Pills */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                                'bg-primary/10 text-primary',
                                'transition-all hover:bg-primary/20'
                            )}
                        >
                            #{tag}
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:text-primary/70 transition-colors"
                                aria-label={`Remove ${tag} tag`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="relative">
                <Input
                    ref={inputRef}
                    placeholder="Type a tag and press Enter..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    disabled={tags.length >= maxTags}
                    className="pl-9"
                />
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        {!input.trim() && (
                            <div className="px-3 py-2 text-xs font-semibold text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                                <TrendingUp className="h-3 w-3" />
                                Trending Tags
                            </div>
                        )}
                        {suggestions.map((tag: any) => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleAddTag(tag.name)}
                                className="w-full px-4 py-2.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between group"
                            >
                                <span className="text-sm font-medium">#{tag.name}</span>
                                <span className="text-xs text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-400">
                                    {tag.usageCount} posts
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <p className="text-xs text-neutral-500">
                💡 Tags are automatically extracted from #hashtags in your content
            </p>
        </div>
    );
}
