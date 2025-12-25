import { useState } from 'react';
import { Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
    description?: string;
}

interface CategorySelectorProps {
    categories: Category[];
    selectedCategories: string[];
    onChange: (categoryIds: string[]) => void;
    maxSelection?: number;
}

export function CategorySelector({
    categories,
    selectedCategories,
    onChange,
    maxSelection = 2,
}: CategorySelectorProps) {
    const handleToggle = (categoryId: string) => {
        if (selectedCategories.includes(categoryId)) {
            onChange(selectedCategories.filter(id => id !== categoryId));
        } else {
            if (selectedCategories.length < maxSelection) {
                onChange([...selectedCategories, categoryId]);
            }
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                    Categories
                    <span className="text-neutral-500 font-normal ml-2">
                        (Select {maxSelection === 1 ? '1' : `up to ${maxSelection}`})
                    </span>
                </Label>
                <span className="text-xs text-neutral-500">
                    {selectedCategories.length}/{maxSelection}
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {categories.map((category) => {
                    const isSelected = selectedCategories.includes(category.id);
                    const isDisabled = !isSelected && selectedCategories.length >= maxSelection;

                    return (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => handleToggle(category.id)}
                            disabled={isDisabled}
                            aria-pressed={isSelected}
                            aria-label={`${isSelected ? 'Deselect' : 'Select'} ${category.name} category`}
                            className={cn(
                                'group relative p-4 rounded-xl border-2 transition-all duration-200',
                                'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
                                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                                isSelected
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                            )}
                            style={{
                                borderColor: isSelected ? category.color : undefined,
                                backgroundColor: isSelected ? `${category.color}10` : undefined,
                            }}
                        >
                            {/* Selection Indicator */}
                            {isSelected && (
                                <div
                                    className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center text-white"
                                    style={{ backgroundColor: category.color }}
                                >
                                    <Check className="h-3 w-3" />
                                </div>
                            )}

                            {/* Icon */}
                            <div className="text-3xl mb-2 transition-transform group-hover:scale-110">
                                {category.icon}
                            </div>

                            {/* Name */}
                            <div className="text-sm font-semibold text-left line-clamp-2">
                                {category.name}
                            </div>

                            {/* Description (on hover) */}
                            {category.description && (
                                <div className="absolute inset-x-0 bottom-0 p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                                        {category.description}
                                    </p>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected Categories Display */}
            {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {selectedCategories.map((catId) => {
                        const category = categories.find(c => c.id === catId);
                        if (!category) return null;

                        return (
                            <div
                                key={catId}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                                style={{
                                    backgroundColor: `${category.color}20`,
                                    color: category.color,
                                }}
                            >
                                <span>{category.icon}</span>
                                <span>{category.name}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
