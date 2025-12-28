import { useState, useEffect } from 'react';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/queries/notification';
import { Bell, Volume2, Monitor, Mail, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function NotificationSettings() {
    const { data: preferences, isLoading } = useNotificationPreferences();
    const updatePreferencesMutation = useUpdateNotificationPreferences();

    // Local state for form
    const [formData, setFormData] = useState({
        // Notification Types
        newFollower: true,
        postLike: true,
        postComment: true,
        commentReply: true,
        postShare: false,
        mention: true,
        message: true,
        callMissed: true,

        // Delivery Channels
        emailEnabled: false,
        soundEnabled: true,
        desktopEnabled: false,
    });

    // Update form when preferences load
    useEffect(() => {
        if (preferences) {
            setFormData({
                newFollower: preferences.newFollower,
                postLike: preferences.postLike,
                postComment: preferences.postComment,
                commentReply: preferences.commentReply,
                postShare: preferences.postShare,
                mention: preferences.mention,
                message: preferences.message,
                callMissed: preferences.callMissed,
                emailEnabled: preferences.emailEnabled,
                soundEnabled: preferences.soundEnabled,
                desktopEnabled: preferences.desktopEnabled,
            });
        }
    }, [preferences]);

    const handleToggle = (key: keyof typeof formData) => {
        setFormData(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = () => {
        updatePreferencesMutation.mutate(formData);
    };

    const handleRequestDesktopPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                toast.success('Desktop notifications enabled!');
                setFormData(prev => ({ ...prev, desktopEnabled: true }));
            } else {
                toast.error('Desktop notification permission denied');
            }
        } else {
            toast.error('Desktop notifications not supported in this browser');
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto p-8">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 p-6">
                <div className="flex items-center gap-3 mb-2">
                    <Bell className="w-6 h-6 text-blue-600" />
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        Notification Preferences
                    </h1>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Customize which notifications you receive and how you're notified
                </p>
            </div>

            <div className="p-6 space-y-8">
                {/* Notification Types Section */}
                <section>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                        Notification Types
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                        Choose which activities you want to be notified about
                    </p>

                    <div className="space-y-3">
                        <ToggleRow
                            label="New Followers"
                            description="When someone follows you"
                            checked={formData.newFollower}
                            onChange={() => handleToggle('newFollower')}
                        />

                        <ToggleRow
                            label="Post Likes"
                            description="When someone likes your post"
                            checked={formData.postLike}
                            onChange={() => handleToggle('postLike')}
                        />

                        <ToggleRow
                            label="Post Comments"
                            description="When someone comments on your post"
                            checked={formData.postComment}
                            onChange={() => handleToggle('postComment')}
                        />

                        <ToggleRow
                            label="Comment Replies"
                            description="When someone replies to your comment"
                            checked={formData.commentReply}
                            onChange={() => handleToggle('commentReply')}
                        />

                        <ToggleRow
                            label="Post Shares"
                            description="When someone shares your post"
                            checked={formData.postShare}
                            onChange={() => handleToggle('postShare')}
                        />

                        <ToggleRow
                            label="Mentions"
                            description="When someone mentions you in a post or comment"
                            checked={formData.mention}
                            onChange={() => handleToggle('mention')}
                        />

                        <ToggleRow
                            label="Messages"
                            description="When you receive a new message"
                            checked={formData.message}
                            onChange={() => handleToggle('message')}
                        />

                        <ToggleRow
                            label="Missed Calls"
                            description="When you miss a call"
                            checked={formData.callMissed}
                            onChange={() => handleToggle('callMissed')}
                        />
                    </div>
                </section>

                {/* Delivery Channels Section */}
                <section className="border-t border-neutral-200 dark:border-neutral-800 pt-8">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                        Delivery Channels
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                        Control how you receive notifications
                    </p>

                    <div className="space-y-3">
                        <ToggleRow
                            icon={<Volume2 className="w-5 h-5 text-blue-600" />}
                            label="Sound Notifications"
                            description="Play a sound when you receive a notification"
                            checked={formData.soundEnabled}
                            onChange={() => handleToggle('soundEnabled')}
                        />

                        <div className="flex items-start justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                            <div className="flex gap-3 flex-1">
                                <Monitor className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-medium text-neutral-900 dark:text-white">
                                        Desktop Notifications
                                    </h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Show browser notifications even when tab is inactive
                                    </p>
                                    {!formData.desktopEnabled && (
                                        <button
                                            onClick={handleRequestDesktopPermission}
                                            className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            Request Permission
                                        </button>
                                    )}
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.desktopEnabled}
                                    onChange={() => handleToggle('desktopEnabled')}
                                    className="sr-only peer"
                                    disabled={!formData.desktopEnabled}
                                />
                                <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <ToggleRow
                            icon={<Mail className="w-5 h-5 text-blue-600" />}
                            label="Email Notifications"
                            description="Receive notification summaries via email"
                            checked={formData.emailEnabled}
                            onChange={() => handleToggle('emailEnabled')}
                        />
                    </div>
                </section>

                {/* Save Button */}
                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
                    <button
                        onClick={handleSave}
                        disabled={updatePreferencesMutation.isPending}
                        className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {updatePreferencesMutation.isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Preferences
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Toggle Row Component
interface ToggleRowProps {
    icon?: React.ReactNode;
    label: string;
    description: string;
    checked: boolean;
    onChange: () => void;
}

function ToggleRow({ icon, label, description, checked, onChange }: ToggleRowProps) {
    return (
        <div className="flex items-start justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
            <div className="flex gap-3 flex-1">
                {icon}
                <div>
                    <h3 className="font-medium text-neutral-900 dark:text-white">
                        {label}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {description}
                    </p>
                </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
            </label>
        </div>
    );
}
