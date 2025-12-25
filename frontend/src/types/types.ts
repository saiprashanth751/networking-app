// src/types/types.ts

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

export interface CreatePostInput {
  title?: string | null;
  content: any;  // Lexical JSON
  categoryIds?: string[];
  tags?: string[];
  mediaIds?: string[];  // Media uploaded first, then IDs sent
}

export interface Post {
  id: string;
  userId: string;
  title: string | null;
  content: any; // Lexical JSON
  contentText: string;
  isDraft: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // Engagement counters
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  bookmarksCount: number;
  viewsCount: number;

  // User info
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profile?: {
      profilePic?: string;
      department?: string;
    };
  };

  // Categories
  categories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
      icon: string;
      color: string;
    };
  }>;

  // Tags
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;

  // Media
  media: Array<{
    id: string;
    type: 'IMAGE' | 'VIDEO';
    url: string;
    fileName: string;
    order: number;
  }>;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  content: string;
  likesCount: number;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profile?: {
      profilePic?: string;
    };
  };
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
// CALL TYPES - UNIFIED VERSION
// ============================================================================

// Core call types
export type CallType = 'audio' | 'video';
export type CallDirection = 'incoming' | 'outgoing';
export type CallStatus = 'idle' | 'ringing' | 'connecting' | 'active' | 'ending' | 'ended';
export type CallConnectionStatus = 'completed' | 'missed' | 'declined' | 'no-answer' | 'failed';

// Call participant
export interface CallParticipant {
  id: string;
  name: string;
  avatar: string | null;
  isOnline: boolean;
}

// Call details
export interface CallDetails {
  callId: string;
  type: CallType;
  direction: CallDirection;
  participants: {
    local: CallParticipant;
    remote: CallParticipant;
  };
  startTime: number | null;
  endTime: number | null;
  duration: number;
}

// Socket events
export interface IncomingCallEvent {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar: string | null;
  callType: CallType;
  room: string; // Add this for WebRTC room
}

export interface CallHistory {
  id: string;
  type: CallType;
  status: CallConnectionStatus;
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

// WebRTC signaling
export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'candidate' | 'end';
  data: any;
  timestamp: number;
  senderId: string;
}

// State machine context
export interface CallContext {
  // Current call
  callDetails: CallDetails | null;

  // Media streams
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;

  // Connection state
  isConnected: boolean;
  connectionError: string | null;

  // Media controls
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;

  // WebRTC
  pendingSignals: WebRTCSignal[];
  peerConnection: any | null;

  // Timing
  ringingStartTime: number | null;
  callStartTime: number | null;

  // UI state
  isRinging: boolean;
}

// State machine events
export type CallEvent =
  | { type: 'CALL_INITIATE'; remoteUser: CallParticipant; callType: CallType }
  | { type: 'CALL_RECEIVED'; callId: string; callerId: string; callerName: string; callerAvatar: string | null; callType: CallType; room: string }
  | { type: 'CALL_ACCEPT' }
  | { type: 'CALL_REJECT' }
  | { type: 'CALL_END' }
  | { type: 'WEBRTC_OFFER'; offer: any; senderId: string }
  | { type: 'WEBRTC_ANSWER'; answer: any; senderId: string }
  | { type: 'WEBRTC_CANDIDATE'; candidate: any; senderId: string }
  | { type: 'WEBRTC_CONNECTED' }
  | { type: 'WEBRTC_FAILED'; error: string }
  | { type: 'MEDIA_TOGGLE_MUTE' }
  | { type: 'MEDIA_TOGGLE_VIDEO' }
  | { type: 'MEDIA_TOGGLE_SCREEN_SHARE' }
  | { type: 'SOCKET_DISCONNECTED' }
  | { type: 'TIMEOUT' };