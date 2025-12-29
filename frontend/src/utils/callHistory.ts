// Call History Utility Functions
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

/**
 * Format call duration from seconds to human-readable string
 */
export const formatCallDuration = (seconds: number | null): string => {
    if (!seconds || seconds === 0) return 'Not answered';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
};

/**
 * Format call timestamp to relative or absolute time
 */
export const formatCallTime = (date: string | Date): string => {
    const callDate = new Date(date);

    if (isToday(callDate)) {
        return `Today at ${format(callDate, 'h:mm a')}`;
    } else if (isYesterday(callDate)) {
        return `Yesterday at ${format(callDate, 'h:mm a')}`;
    } else if (isThisWeek(callDate)) {
        return format(callDate, 'EEEE \'at\' h:mm a');
    } else {
        return format(callDate, 'MMM d \'at\' h:mm a');
    }
};

/**
 * Get color classes for call status badge
 */
export const getCallStatusColor = (status: string): string => {
    switch (status) {
        case 'completed':
            return 'text-green-700 bg-green-100 border-green-200';
        case 'missed':
            return 'text-red-700 bg-red-100 border-red-200';
        case 'declined':
            return 'text-orange-700 bg-orange-100 border-orange-200';
        case 'no-answer':
            return 'text-gray-700 bg-gray-100 border-gray-200';
        case 'failed':
            return 'text-yellow-700 bg-yellow-100 border-yellow-200';
        default:
            return 'text-gray-700 bg-gray-100 border-gray-200';
    }
};

/**
 * Get readable status text
 */
export const getCallStatusText = (status: string): string => {
    switch (status) {
        case 'completed':
            return 'Completed';
        case 'missed':
            return 'Missed';
        case 'declined':
            return 'Declined';
        case 'no-answer':
            return 'No Answer';
        case 'failed':
            return 'Failed';
        default:
            return status;
    }
};
