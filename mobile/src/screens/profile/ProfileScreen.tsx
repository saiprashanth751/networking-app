import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../lib/AuthContext';
import { useCurrentUser } from '../../hooks/queries/user';

export default function ProfileScreen({ navigation }: any) {
    const { logout } = useAuth();
    const { data: user, isLoading, isError } = useCurrentUser();

    const handleLogout = async () => {
        await logout();
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (isError || !user) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Failed to load profile</Text>
            </View>
        );
    }

    const profile = user.profile;
    const fullName = `${user.firstName} ${user.lastName || ''}`.trim();
    const initials = `${user.firstName[0]}${user.lastName?.[0] || ''}`.toUpperCase();

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {/* Profile Picture */}
                <View style={styles.avatarContainer}>
                    {profile?.profilePic ? (
                        <Image
                            source={{ uri: profile.profilePic }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                    )}
                </View>

                {/* User Info */}
                <Text style={styles.name}>{fullName}</Text>
                <Text style={styles.email}>{user.email}</Text>

                {profile?.bio && (
                    <Text style={styles.bio}>{profile.bio}</Text>
                )}

                {/* Stats */}
                <View style={styles.stats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </View>
                </View>

                {/* Edit Profile Button */}
                <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            {/* Profile Details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Details</Text>

                {profile?.department && (
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Department</Text>
                        <Text style={styles.detailValue}>{profile.department}</Text>
                    </View>
                )}

                {profile?.graduationYear && (
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Graduation Year</Text>
                        <Text style={styles.detailValue}>{profile.graduationYear}</Text>
                    </View>
                )}

                {profile?.minor && (
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Minor</Text>
                        <Text style={styles.detailValue}>{profile.minor}</Text>
                    </View>
                )}
            </View>

            {/* Social Links */}
            {(profile?.linkedin || profile?.github || profile?.leetcode) && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Links</Text>

                    {profile.linkedin && (
                        <View style={styles.linkItem}>
                            <Text style={styles.linkIcon}>🔗</Text>
                            <Text style={styles.linkText}>LinkedIn</Text>
                        </View>
                    )}

                    {profile.github && (
                        <View style={styles.linkItem}>
                            <Text style={styles.linkIcon}>💻</Text>
                            <Text style={styles.linkText}>GitHub</Text>
                        </View>
                    )}

                    {profile.leetcode && (
                        <View style={styles.linkItem}>
                            <Text style={styles.linkIcon}>📊</Text>
                            <Text style={styles.linkText}>LeetCode</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            <View style={styles.bottomSpacer} />
        </ScrollView>
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
    errorText: {
        fontSize: 16,
        color: '#FF3B30',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 36,
        fontWeight: '600',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    bio: {
        fontSize: 15,
        color: '#333',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#e0e0e0',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#666',
    },
    editButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    editButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    section: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 16,
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 15,
        color: '#666',
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    linkIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    linkText: {
        fontSize: 15,
        color: '#007AFF',
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        marginHorizontal: 20,
        marginTop: 20,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomSpacer: {
        height: 30,
    },
});
