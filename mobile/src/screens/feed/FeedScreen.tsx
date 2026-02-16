import React from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { useInfinitePosts } from '../../hooks/queries/post';
import { useToggleLike, useToggleBookmark } from '../../hooks/mutations/engagement';
import PostCard from '../../components/PostCard';
import { Post } from '../../types/types';

export default function FeedScreen({ navigation }: any) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        refetch,
        isRefetching,
    } = useInfinitePosts({});

    const likePost = useToggleLike();
    const bookmarkPost = useToggleBookmark();

    const posts = data?.pages.flatMap((page) => page.posts) || [];

    const handleLike = (postId: string) => {
        likePost.mutate(postId);
    };

    const handleBookmark = (postId: string) => {
        bookmarkPost.mutate({ postId });
    };

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const renderPost = ({ item }: { item: Post }) => (
        <PostCard
            post={item}
            onLike={() => handleLike(item.id)}
            onBookmark={() => handleBookmark(item.id)}
            onComment={() => {
                // TODO: Navigate to post detail with comments
                console.log('Comment on post:', item.id);
            }}
            onPress={() => {
                // TODO: Navigate to post detail
                console.log('View post:', item.id);
            }}
        />
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to create a post!</Text>
        </View>
    );

    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#007AFF" />
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Failed to load posts</Text>
                <Text style={styles.errorSubtext}>Pull down to retry</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor="#007AFF"
                    />
                }
                contentContainerStyle={posts.length === 0 ? styles.emptyList : undefined}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FF3B30',
        marginBottom: 8,
    },
    errorSubtext: {
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 16,
        color: '#666',
    },
    emptyList: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});
