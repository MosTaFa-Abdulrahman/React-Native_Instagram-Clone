export interface Post {
  id: number;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  createdDate: string;
  lastModifiedDate: string | null;
  userId: number;
  user?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    imgUrl: string | null;
  };
  _count?: {
    comments: number;
    likes: number;
    savedBy: number;
  };
  isLiked?: boolean;
  isSaved?: boolean;
}

// PostLike Types
export interface PostLike {
  id: number;
  userId: number;
  postId: number;
  createdDate: string;
  user?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    imgUrl: string | null;
  };
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

// API Response Types
export interface CreatePostResponse {
  message: string;
  post: Post;
}

export interface GetPostResponse {
  post: Post;
}

export interface GetAllPostsResponse extends PaginatedResponse<Post> {}

export interface GetUserPostsResponse extends PaginatedResponse<Post> {}

export interface UpdatePostResponse {
  message: string;
  post: Post;
}

export interface DeletePostResponse {
  message: string;
}

export interface LikePostResponse {
  message: string;
  isLiked: boolean;
  likesCount: number;
}

export interface GetPostLikesResponse extends PaginatedResponse<PostLike> {}

// Request Types
export interface CreatePostRequest {
  title: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdatePostRequest {
  title?: string;
  description?: string;
  imageUrl?: string;
}

export interface GetAllPostsParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface GetUserPostsParams {
  userId: number;
  page?: number;
  size?: number;
}

export interface GetPostLikesParams {
  postId: number;
  page?: number;
  size?: number;
}

// Query Key Types
export type PostQueryKey = ["post", number];
export type AllPostsQueryKey = ["posts", GetAllPostsParams?];
export type UserPostsQueryKey = ["posts", "user", number];
export type PostLikesQueryKey = ["posts", number, "likes"];
