import { useState } from 'react';
import { Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface LinkPreviewPluginProps {
    onLinkAdd: (url: string) => void;
    existingLink?: string;
}

// Validate URL to prevent XSS and invalid URLs
const isValidUrl = (urlString: string): boolean => {
    try {
        const url = new URL(urlString);
        // Only allow http and https protocols
        return ['http:', 'https:'].includes(url.protocol);
    } catch {
        return false;
    }
};

export function LinkPreviewPlugin({ onLinkAdd, existingLink }: LinkPreviewPluginProps) {
    const [url, setUrl] = useState(existingLink || '');
    const [showInput, setShowInput] = useState(!!existingLink);
    const [error, setError] = useState('');

    const handleAddLink = () => {
        const trimmedUrl = url.trim();

        if (!trimmedUrl) {
            setError('Please enter a URL');
            return;
        }

        if (!isValidUrl(trimmedUrl)) {
            setError('Please enter a valid HTTP or HTTPS URL');
            return;
        }

        setError('');
        onLinkAdd(trimmedUrl);
        setShowInput(false);
    };

    const handleRemoveLink = () => {
        setUrl('');
        onLinkAdd('');
        setShowInput(false);
    };

    if (!showInput && !existingLink) {
        return (
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowInput(true)}
                className="w-full"
            >
                <LinkIcon className="h-4 w-4 mr-2" />
                Add Link Preview (Optional)
            </Button>
        );
    }

    return (
        <div className="space-y-2 p-3 border rounded-lg bg-neutral-50 dark:bg-neutral-900">
            <Label className="text-sm font-medium flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Link Preview
            </Label>

            <div className="space-y-2">
                <div className="flex gap-2">
                    <Input
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value);
                            setError(''); // Clear error on change
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddLink();
                            }
                        }}
                        className={`flex-1 ${error ? 'border-red-500' : ''}`}
                    />
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleAddLink}
                        disabled={!url.trim()}
                    >
                        Add
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveLink}
                    >
                        Remove
                    </Button>
                </div>
                {error && (
                    <p className="text-xs text-red-500">{error}</p>
                )}
            </div>

            {url && (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                >
                    <ExternalLink className="h-3 w-3" />
                    {url}
                </a>
            )}
        </div>
    );
}
