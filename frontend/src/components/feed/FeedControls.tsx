import { Filter, X, ChevronDown, Check, Save, Star, Trash2, Bookmark } from 'lucide-react';
import { useState } from 'react';
import { FeedFilters, SortOption } from '@/types/feed';
import { useCategories } from '@/hooks/queries/category';
import { SavePresetDialog } from './SavePresetDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filterPresetService } from '@/api/filterPreset';

interface FeedControlsProps {
    filters: FeedFilters;
    onFiltersChange: (filters: FeedFilters) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string; description: string }[] = [
    { value: 'recent', label: 'Recent', description: 'Newest first' },
    { value: 'popular', label: 'Popular', description: 'Most liked' },
    { value: 'trending', label: 'Trending', description: 'Hot right now' },
];

export function FeedControls({ filters, onFiltersChange }: FeedControlsProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showPresetDropdown, setShowPresetDropdown] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    const queryClient = useQueryClient();
    const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
    const { data: presetsData } = useQuery({
        queryKey: ['filterPresets'],
        queryFn: () => filterPresetService.getPresets(),
    });

    const deletePresetMutation = useMutation({
        mutationFn: (presetId: string) => filterPresetService.deletePreset(presetId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['filterPresets'] });
        },
    });

    const categories = categoriesData?.categories || [];
    const presets = presetsData?.presets || [];

    const handleSortChange = (sort: SortOption) => {
        onFiltersChange({ ...filters, sort });
        setShowSortDropdown(false);
    };

    const handleCategoryToggle = (slug: string) => {
        const current = filters.categorySlugs || [];
        const updated = current.includes(slug)
            ? current.filter((s) => s !== slug)
            : [...current, slug];
        onFiltersChange({ ...filters, categorySlugs: updated });
    };

    const handleClearFilters = () => {
        onFiltersChange({ sort: filters.sort || 'recent' });
    };

    const handleLoadPreset = (presetFilters: FeedFilters) => {
        onFiltersChange(presetFilters);
        setShowPresetDropdown(false);
    };

    const handleDeletePreset = (e: React.MouseEvent, presetId: string) => {
        e.stopPropagation();
        if (confirm('Delete this preset?')) {
            deletePresetMutation.mutate(presetId);
        }
    };

    const activeFilterCount = filters.categorySlugs?.length || 0;
    const currentSort = SORT_OPTIONS.find((opt) => opt.value === (filters.sort || 'recent'));
    const hasActiveFilters = activeFilterCount > 0 || filters.sort !== 'recent';

    return (
        <>
            <div className="border-b border-neutral-800/30 bg-background/95 backdrop-blur-md sticky top-[57px] z-10">
                {/* Sort & Filter Row */}
                <div className="px-6 py-3 flex items-center justify-between gap-3">
                    {/* Left: Sort Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-all duration-150 px-3 py-1.5 rounded-md hover:bg-neutral-800"
                        >
                            <span>{currentSort?.label}</span>
                            <ChevronDown className="h-4 w-4" />
                        </button>

                        {showSortDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                                <div className="absolute top-full left-0 mt-1 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl min-w-[200px] py-1 z-20">
                                    {SORT_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleSortChange(option.value)}
                                            className="w-full px-4 py-2.5 text-left hover:bg-neutral-800 transition-colors flex items-center justify-between gap-3"
                                        >
                                            <div>
                                                <div className="text-sm font-medium text-white">{option.label}</div>
                                                <div className="text-xs text-neutral-500">{option.description}</div>
                                            </div>
                                            {filters.sort === option.value && <Check className="h-4 w-4 text-blue-500" />}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right: Preset & Filter Buttons */}
                    <div className="flex items-center gap-2">
                        {/* Saved Presets Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors text-sm"
                            >
                                <Bookmark className="h-4 w-4" />
                                <span className="hidden sm:inline">Presets</span>
                            </button>

                            {showPresetDropdown && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowPresetDropdown(false)} />
                                    <div className="absolute top-full right-0 mt-1 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl min-w-[250px] py-1 z-20">
                                        {/* Save Current */}
                                        <button
                                            onClick={() => {
                                                setShowPresetDropdown(false);
                                                setShowSaveDialog(true);
                                            }}
                                            className="w-full px-4 py-2.5 text-left hover:bg-neutral-800 transition-colors flex items-center gap-2 border-b border-neutral-800"
                                        >
                                            <Save className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm font-medium">Save current filters</span>
                                        </button>

                                        {/* Preset List */}
                                        {presets.length === 0 ? (
                                            <div className="px-4 py-3 text-sm text-neutral-500">No saved presets</div>
                                        ) : (
                                            presets.map((preset: any) => (
                                                <div
                                                    key={preset.id}
                                                    className="group hover:bg-neutral-800 transition-colors"
                                                >
                                                    <button
                                                        onClick={() => handleLoadPreset(preset.filters)}
                                                        className="w-full px-4 py-2.5 text-left flex items-start justify-between gap-2"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium truncate">{preset.name}</span>
                                                                {preset.isDefault && (
                                                                    <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                                                                )}
                                                            </div>
                                                            {preset.description && (
                                                                <p className="text-xs text-neutral-500 truncate">{preset.description}</p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={(e) => handleDeletePreset(e, preset.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-700 rounded transition-all shrink-0"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                                        </button>
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Category Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-700 hover:border-neutral-600 transition-colors text-sm"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Categories</span>
                            {activeFilterCount > 0 && (
                                <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Expanded Category Filters */}
                {showFilters && (
                    <div className="px-4 py-4 border-t border-neutral-800">
                        <div>
                            <label className="text-sm font-medium mb-3 block">Filter by Category</label>
                            {categoriesLoading ? (
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-9 w-24 bg-neutral-800 rounded-full animate-pulse" />
                                    ))}
                                </div>
                            ) : categories.length === 0 ? (
                                <p className="text-sm text-neutral-500">No categories available</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((category: any) => {
                                        const isSelected = filters.categorySlugs?.includes(category.slug);
                                        return (
                                            <button
                                                key={category.id}
                                                onClick={() => handleCategoryToggle(category.slug)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isSelected
                                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                                                    }`}
                                            >
                                                {category.icon && <span className="mr-1.5">{category.icon}</span>}
                                                {category.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Clear Filters */}
                        {activeFilterCount > 0 && (
                            <div className="pt-4 mt-4 border-t border-neutral-800">
                                <button
                                    onClick={handleClearFilters}
                                    className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors font-medium"
                                >
                                    <X className="h-4 w-4" />
                                    Clear category filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Save Preset Dialog */}
            <SavePresetDialog
                isOpen={showSaveDialog}
                onClose={() => setShowSaveDialog(false)}
                currentFilters={filters}
            />
        </>
    );
}
