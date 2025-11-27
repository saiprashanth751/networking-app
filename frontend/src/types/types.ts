// src/types/index.ts

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Profile {
  id: string;
  userId: string;
  bio?: string;
  graduationYear?: string;
  department?: string;
  minor?: string;
  linkedin?: string;
  github?: string;
  leetcode?: string;
  codeforces?: string;
  geekforgeeks?: string;
  profilePic?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserWithProfile extends User {
  profile?: Profile;
}

// ============================================================================
// POST TYPES
// ============================================================================

export type PostLabel =
  | "Achievements"
  | "Study Resources"
  | "Collaboration Requests"
  | "Internship/Job Openings"
  | "Coursework Discussions"
  | "Research & Innovations"
  | "Bounty"
  | "Contribution";

export interface Post {
  id: string;
  userId: string;
  title: string;
  description: string;
  labels: PostLabel[];
  links: string[];
  photos: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    department?: string;
    profile?: {
      profilePic?: string;
    };
  };
}

export interface CreatePostInput {
  title: string;
  description: string;
  labels: PostLabel[];
  links?: string[];
  photos?: File[];
}

// ============================================================================
// FOLLOW TYPES
// ============================================================================

export interface FollowRelationship {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FollowStatus {
  following: boolean;
}

export interface FollowersResponse {
  followers: User[];
  count: number;
}

export interface FollowingResponse {
  followingUsers: User[];
  count: number;
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read?: boolean;
}

export interface SendMessageInput {
  receiverId: string;
  content: string;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface SignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SigninInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
}

// ============================================================================
// PROFILE TYPES
// ============================================================================

export interface CreateProfileInput {
  bio: string;
  graduationYear: string;
  department: string;
  minor: string;
  linkedin: string;
  github?: string;
  leetcode?: string;
  codeforces?: string;
  geekforgeeks?: string;
  profilePic?: File;
}

export interface UpdateProfileInput {
  bio?: string;
  linkedin?: string;
  github?: string;
  leetcode?: string;
  codeforces?: string;
  geekforgeeks?: string;
  profilePic?: File;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// SEARCH TYPES
// ============================================================================

export interface SearchUsersParams {
  name?: string;
  department?: string;
  minor?: string;
  limit?: number;
}

export interface SearchUsersResponse {
  users: User[];
}

// ============================================================================
// DEPARTMENT & MINOR TYPES
// ============================================================================

export interface Department {
  id: number;
  name: string;
}

export interface Minor {
  id: number;
  name: string;
}

// ============================================================================
// STATS TYPES (for platform stats on profile)
// ============================================================================

export interface LeetCodeStats {
  username: string;
  svg: string; // SVG data as string
}

export interface PlatformStats {
  leetcode?: string;
  github?: string;
  codeforces?: string;
  geekforgeeks?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}