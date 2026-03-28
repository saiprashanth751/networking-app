import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostMediaCarouselProps {
    media: Array<{
        id: string;
        url: string;
        fileName: string;
    }>;
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

export function PostMediaCarousel({ media, initialIndex, isOpen, onClose }: PostMediaCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Reset current index when initialIndex changes
    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                goToPrevious();
            } else if (e.key === 'ArrowRight') {
                goToNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex]);

    const goToPrevious = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => Math.min(media.length - 1, prev + 1));
    };

    if (!isOpen) return null;

    const currentMedia = media[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === media.length - 1;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
            onClick={onClose}
        >
            {/* Close Button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
                onClick={onClose}
            >
                <X className="h-6 w-6" />
            </Button>

            {/* Image Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                {currentIndex + 1} / {media.length}
            </div>

            {/* Previous Arrow */}
            {!isFirst && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-12 w-12 z-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        goToPrevious();
                    }}
                >
                    <ChevronLeft className="h-8 w-8" />
                </Button>
            )}

            {/* Next Arrow */}
            {!isLast && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-12 w-12 z-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        goToNext();
                    }}
                >
                    <ChevronRight className="h-8 w-8" />
                </Button>
            )}

            {/* Image */}
            <div
                className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={currentMedia.url}
                    alt={currentMedia.fileName}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                />
            </div>
        </div>
    );
}
