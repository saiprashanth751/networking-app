import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Post } from '../../types/types';

interface PostCardProps {
    post: Post;
    onLike?: () => void;
    onBookmark?: () => void;
    onComment?: () => void;
    onPress?: () => void;
}

export default function PostCard({ post, onLike, onBookmark, onComment, onPress }: PostCardProps) {
    const formatDate = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString();
    };

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    {post.user.profile?.profilePic ? (
                        <Image
                            source={{ uri: post.user.profile.profilePic }}
                            style={styles.avatarImage}
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {post.user.firstName[0]}{post.user.lastName?.[0] || ''}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.headerInfo}>
                    <Text style={styles.authorName}>
                        {post.user.firstName} {post.user.lastName}
                    </Text>
                    <View style={styles.metadata}>
                        {post.user.profile?.department && (
                            <Text style={styles.department}>{post.user.profile.department}</Text>
                        )}
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
                    </View>
                </View>
            </View>

            {/* Content */}
            {post.title && <Text style={styles.title}>{post.title}</Text>}
            <Text style={styles.content} numberOfLines={5}>
                {post.contentText}
            </Text>

            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
                <View style={styles.categories}>
                    {post.categories.slice(0, 2).map(({ category }) => (
                        <View key={category.id} style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{category.name}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Media */}
            {post.media && post.media.length > 0 && (
                <Image
                    source={{ uri: post.media[0].url }}
                    style={styles.mediaImage}
                    resizeMode="cover"
                />
            )}

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        onLike?.();
                    }}
                >
                    <Text style={[styles.actionIcon, post.isLiked && styles.actionIconActive]}>
                        {post.isLiked ? '❤️' : '🤍'}
                    </Text>
                    <Text style={styles.actionText}>{post.likesCount}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        onComment?.();
                    }}
                >
                    <Text style={styles.actionIcon}>💬</Text>
                    <Text style={styles.actionText}>{post.commentsCount}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        onBookmark?.();
                    }}
                >
                    <Text style={[styles.actionIcon, post.isBookmarked && styles.actionIconActive]}>
                        {post.isBookmarked ? '🔖' : '📑'}
                    </Text>
                    <Text style={styles.actionText}>{post.bookmarksCount}</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        marginBottom: 8,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        marginRight: 12,
    },
    avatarImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    headerInfo: {
        flex: 1,
    },
    authorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 2,
    },
    metadata: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    department: {
        fontSize: 13,
        color: '#666',
    },
    dot: {
        fontSize: 13,
        color: '#999',
        marginHorizontal: 6,
    },
    timestamp: {
        fontSize: 13,
        color: '#666',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    content: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
        marginBottom: 12,
    },
    categories: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 4,
    },
    categoryText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    mediaImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 12,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
    },
    actionIcon: {
        fontSize: 20,
        marginRight: 6,
    },
    actionIconActive: {
        transform: [{ scale: 1.1 }],
    },
    actionText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
});
