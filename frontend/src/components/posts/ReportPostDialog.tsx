import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Flag, Loader2 } from 'lucide-react';
import { reportService } from '@/api/report';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ReportReason } from '@/types/feed';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReportPostDialogProps {
    postId: string;
    isOpen: boolean;
    onClose: () => void;
}

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
    { value: 'SPAM', label: 'Spam', description: 'Repetitive or promotional content' },
    { value: 'HARASSMENT', label: 'Harassment', description: 'Bullying or targeted attacks' },
    { value: 'INAPPROPRIATE', label: 'Inappropriate', description: 'Adult or offensive content' },
    { value: 'MISINFORMATION', label: 'Misinformation', description: 'False or misleading information' },
    { value: 'OTHER', label: 'Other', description: 'Something else' },
];

export function ReportPostDialog({ postId, isOpen, onClose }: ReportPostDialogProps) {
    const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
    const [description, setDescription] = useState('');
    const queryClient = useQueryClient();

    const reportMutation = useMutation({
        mutationFn: ({ postId, reason, description }: { postId: string; reason: ReportReason; description?: string }) =>
            reportService.reportPost(postId, reason, description),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            handleClose();
        },
    });

    const handleClose = () => {
        setSelectedReason(null);
        setDescription('');
        reportMutation.reset();
        onClose();
    };

    const handleSubmit = () => {
        if (!selectedReason) return;
        reportMutation.mutate({ postId, reason: selectedReason, description: description || undefined });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Flag className="h-5 w-5 text-red-500" />
                        <DialogTitle>Report Post</DialogTitle>
                    </div>
                    <DialogDescription>
                        Help us understand what's happening. Your report is anonymous and helps keep our community safe.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Reason Selection */}
                    <div className="space-y-2">
                        <Label>Why are you reporting this post?</Label>
                        <div className="space-y-2">
                            {REPORT_REASONS.map((reason) => (
                                <button
                                    key={reason.value}
                                    onClick={() => setSelectedReason(reason.value)}
                                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${selectedReason === reason.value
                                            ? 'border-red-500 bg-red-500/10'
                                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                                        }`}
                                >
                                    <div className="font-medium text-sm">{reason.label}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">{reason.description}< /div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Optional Description */}
                    {selectedReason && (
                        <div className="space-y-2">
                            <Label htmlFor="description">Additional details (optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Provide more context about why you're reporting this..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                maxLength={500}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">{description.length}/500 characters</p>
                        </div>
                    )}

                    {/* Error State */}
                    {reportMutation.isError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {(reportMutation.error as any)?.response?.data?.message ||
                                    'Failed to submit report. Please try again.'}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Success State */}
                    {reportMutation.isSuccess && (
                        <Alert className="border-green-500 text-green-600 bg-green-50 dark:bg-green-950">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>Report submitted successfully. Thank you for helping keep our community safe.</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={reportMutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={!selectedReason || reportMutation.isPending || reportMutation.isSuccess}
                    >
                        {reportMutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Report'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
