export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  imgUrl: string | null;
  coverImgUrl: string | null;
  city: string | null;
  createdDate: string;
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
}

export interface UserProfile extends User {
  isFollowing: boolean;
}

// Pagination Response Types
export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Follow Types
export interface FollowRelation {
  id: number;
  followerId: number;
  followingId: number;
  createdDate: string;
  follower?: User;
  following?: User;
}

// API Response Types
export interface GetAllUsersResponse extends PaginatedResponse<User> {}

export interface GetUserProfileResponse {
  user: UserProfile;
}

export interface UpdateUserResponse {
  message: string;
  user: User;
}

export interface DeleteUserResponse {
  message: string;
}

export interface FollowUserResponse {
  message: string;
  isFollowing: boolean;
}

export interface GetUserFollowersResponse
  extends PaginatedResponse<FollowRelation> {}

export interface GetUserFollowingResponse
  extends PaginatedResponse<FollowRelation> {}

// Request Types
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  imgUrl?: string;
  coverImgUrl?: string;
  city?: string;
}

export interface GetAllUsersParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface GetFollowersParams {
  userId: number;
  page?: number;
  size?: number;
}

export interface GetFollowingParams {
  userId: number;
  page?: number;
  size?: number;
}

// Query Key Types
export type UserQueryKey = ["user", number];
export type AllUsersQueryKey = ["users", GetAllUsersParams?];
export type FollowersQueryKey = ["followers", number];
export type FollowingQueryKey = ["following", number];
