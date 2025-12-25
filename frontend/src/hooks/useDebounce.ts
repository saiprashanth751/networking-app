import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * 
 * Delays updating a value until after a specified delay has passed since the last change.
 * Perfect for search inputs - prevents API calls on every keystroke.
 * 
 * @param value - The value to debounce (e.g., search query)
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 * 
 * @example
 * const [searchQuery, setSearchQuery] = useState('');
 * const debouncedQuery = useDebounce(searchQuery, 300);
 * 
 * // API call only happens after user stops typing for 300ms
 * useEffect(() => {
 *   if (debouncedQuery) {
 *     fetchSearchResults(debouncedQuery);
 *   }
 * }, [debouncedQuery]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set up the timeout to update debounced value after delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup: Cancel the timeout if value changes before delay is up
        // This ensures we only debounce after the user stops changing the value
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
