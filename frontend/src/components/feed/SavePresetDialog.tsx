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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save } from 'lucide-react';
import { FeedFilters } from '@/types/feed';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { filterPresetService } from '@/api/filterPreset';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SavePresetDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentFilters: FeedFilters;
}

export function SavePresetDialog({ isOpen, onClose, currentFilters }: SavePresetDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isDefault, setIsDefault] = useState(false);
    const queryClient = useQueryClient();

    const savePresetMutation = useMutation({
        mutationFn: ({ name, description, filters, isDefault }: {
            name: string;
            description?: string;
            filters: FeedFilters;
            isDefault: boolean;
        }) => filterPresetService.savePreset(name, filters, description, isDefault),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['filterPresets'] });
            handleClose();
        },
    });

    const handleClose = () => {
        setName('');
        setDescription('');
        setIsDefault(false);
        savePresetMutation.reset();
        onClose();
    };

    const handleSave = () => {
        if (!name.trim()) return;

        savePresetMutation.mutate({
            name: name.trim(),
            description: description.trim() || undefined,
            filters: currentFilters,
            isDefault,
        });
    };

    // Check if there are any active filters worth saving
    const hasFilters = !!(
        currentFilters.categorySlugs?.length ||
        currentFilters.sort !== 'recent'
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Save className="h-5 w-5 text-blue-500" />
                        <DialogTitle>Save Filter Preset</DialogTitle>
                    </div>
                    <DialogDescription>
                        Save your current filter settings to quickly access them later.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Preset Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Preset Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Tech Posts, My Favorites"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={50}
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="What kind of posts does this preset show?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            maxLength={200}
                            className="resize-none"
                        />
                    </div>

                    {/* Current Filter Summary */}
                    <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg text-sm">
                        <div className="font-medium mb-1">Current Filters:</div>
                        <ul className="text-muted-foreground space-y-0.5">
                            <li>• Sort: {currentFilters.sort || 'recent'}</li>
                            {currentFilters.categorySlugs && currentFilters.categorySlugs.length > 0 && (
                                <li>• Categories: {currentFilters.categorySlugs.length} selected</li>
                            )}
                            {!hasFilters && (
                                <li className="text-amber-600">⚠️ No filters active</li>
                            )}
                        </ul>
                    </div>

                    {/* Set as Default */}
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="default"
                            checked={isDefault}
                            onCheckedChange={(checked) => setIsDefault(checked as boolean)}
                        />
                        <Label htmlFor="default" className="text-sm cursor-pointer">
                            Set as default (applied when you open the feed)
                        </Label>
                    </div>

                    {/* Error State */}
                    {savePresetMutation.isError && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {(savePresetMutation.error as any)?.response?.data?.message ||
                                    'Failed to save preset. Please try again.'}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={savePresetMutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!name.trim() || savePresetMutation.isPending}
                    >
                        {savePresetMutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Preset
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
