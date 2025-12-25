import { useState, useRef, useEffect } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadPluginProps {
    onImagesChange: (files: File[]) => void;
    maxImages?: number;
    existingImages?: string[];
}

export function ImageUploadPlugin({
    onImagesChange,
    maxImages = 5,
    existingImages = []
}: ImageUploadPluginProps) {
    const [previews, setPreviews] = useState<string[]>(existingImages);
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // File validation constants
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    // Cleanup object URLs on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            previews.forEach(preview => {
                // Only revoke URLs we created, not existing image URLs
                if (!existingImages.includes(preview)) {
                    URL.revokeObjectURL(preview);
                }
            });
        };
    }, [previews, existingImages]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);

        // Check if adding these files exceeds max
        if (files.length + selectedFiles.length > maxImages) {
            alert(`Maximum ${maxImages} images allowed`);
            return;
        }

        // Validate each file
        const validFiles: File[] = [];
        for (const file of selectedFiles) {
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                alert(`File "${file.name}" exceeds 10MB limit. Please choose a smaller image.`);
                continue;
            }

            // Check MIME type
            if (!ALLOWED_MIME_TYPES.includes(file.type)) {
                alert(`File "${file.name}" is not a supported image format. Please use JPEG, PNG, WebP, or GIF.`);
                continue;
            }

            validFiles.push(file);
        }

        // Only proceed if we have valid files
        if (validFiles.length === 0) {
            return;
        }

        // Create previews for valid files
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        const updatedPreviews = [...previews, ...newPreviews];
        const updatedFiles = [...files, ...validFiles];

        setPreviews(updatedPreviews);
        setFiles(updatedFiles);
        onImagesChange(updatedFiles);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        // Revoke object URL to prevent memory leak
        if (!existingImages.includes(previews[index])) {
            URL.revokeObjectURL(previews[index]);
        }

        const updatedPreviews = previews.filter((_, i) => i !== index);
        const updatedFiles = files.filter((_, i) => i !== index);

        setPreviews(updatedPreviews);
        setFiles(updatedFiles);
        onImagesChange(updatedFiles);
    };

    return (
        <div className="space-y-3">
            {/* Image Previews */}
            {previews.length > 0 && (
                <div className={cn(
                    "grid gap-2",
                    previews.length === 1 && "grid-cols-1",
                    previews.length === 2 && "grid-cols-2",
                    previews.length >= 3 && "grid-cols-3"
                )}>
                    {previews.map((preview, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                            <img
                                src={preview}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {previews.length < maxImages && (
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-background border-border hover:bg-muted text-foreground"
                    >
                        <ImagePlus className="h-4 w-4 mr-2" />
                        Add Images ({previews.length}/{maxImages})
                    </Button>
                </div>
            )}
        </div>
    );
}
