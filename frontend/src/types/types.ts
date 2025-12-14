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
  isOnline: boolean;
  lastSeen: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserWithStatus extends User {
  isOnline: boolean;
  lastSeen: string;
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
  following: User[];
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
  read: boolean;
  readAt?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document';
  fileName?: string;
  fileSize?: number;
  deleted: boolean;
  editedAt?: string;
}

export interface SendMessageInput {
  receiverId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  fileName?: string;
  fileSize?: number;
}

// Conversation Types
export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string | null;
    isOnline: boolean;
    lastSeen: string;
    profile: {
      profilePic: string | null;
    } | null;
  };
  lastMessage: {
    content: string | null;
    timestamp: string;
  };
  unreadCount: number;
  lastMessageAt: string;
}

export interface ConversationResponse {
  conversations: Conversation[];
}

export interface UnreadCountResponse {
  unreadCount: number;
}

// RENAMED: For messaging search (includes online status)
export interface MessageSearchUsersResponse {
  users: {
    id: string;
    firstName: string;
    lastName: string | null;
    isOnline: boolean;
    profile: {
      profilePic: string | null;
      department: string;
    } | null;
  }[];
}

// WebSocket Events
export interface SocketMessage extends Message {
  // Same as Message but for real-time
}

export interface TypingEvent {
  userId: string;
  isTyping: boolean;
}

export interface UserStatusEvent {
  userId: string;
  isOnline: boolean;
}

// Pagination
export interface PaginatedMessages {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
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

// For general user search (basic User type)
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

export interface Project {
  id: string;
  title: string;
  description: string;
  tagline?: string;
  coverImage?: string;
  images: string[];
  techStack: string[];
  category?: string;
  repositoryUrl?: string;
  liveUrl?: string;
  demoVideoUrl?: string;
  featured: boolean;
  status: string;
  startDate?: string;
  endDate?: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profile?: {
      profilePic?: string;
      department?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  tagline?: string;
  coverImage?: File;
  images?: File[];
  techStack: string[];
  category?: string;
  repositoryUrl?: string;
  liveUrl?: string;
  demoVideoUrl?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> { }

// ============================================================================
// CALL TYPES
// ============================================================================

export type CallType = 'audio' | 'video';
export type CallStatus = 'completed' | 'missed' | 'declined' | 'no-answer' | 'failed';

export interface CallHistory {
  id: string;
  type: CallType;
  status: CallStatus;
  duration: number | null;
  startedAt: string;
  endedAt: string | null;
  isIncoming: boolean;
  otherUser: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface CallHistoryResponse {
  success: boolean;
  calls: CallHistory[];
}

// WebRTC Call Events
export interface IncomingCallEvent {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar: string | null;
  callType: CallType;
  room: string;
}

export interface CallAcceptedEvent {
  callId: string;
  room: string;
  receiverId: string;
}

export interface CallRingingEvent {
  callId: string;
  room: string;
}

export interface WebRTCOfferEvent {
  offer: any; // RTCSessionDescriptionInit
  senderId: string;
}

export interface WebRTCAnswerEvent {
  answer: any; // RTCSessionDescriptionInit
  senderId: string;
}

export interface WebRTCIceCandidateEvent {
  candidate: any; // RTCIceCandidate
  senderId: string;
}

// Call State Management
export type CallState = 
  | 'idle'           // No active call
  | 'initiating'     // User clicked call button
  | 'ringing'        // Calling other user
  | 'incoming'       // Receiving incoming call
  | 'connecting'     // WebRTC connection establishing
  | 'active'         // Call is active
  | 'ending';        // Call is ending

export interface ActiveCall {
  callId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  callType: CallType;
  state: CallState;
  startTime: number | null; // timestamp
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
}