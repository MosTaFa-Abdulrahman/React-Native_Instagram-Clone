export interface Comment {
  id: number;
  text: string;
  createdDate: string;
  lastModifiedDate: string | null;
  userId: number;
  postId: number;
  user?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    imgUrl: string | null;
  };
  _count?: {
    replies: number;
    likes: number;
  };
  isLiked?: boolean;
}

// CommentLike Types
export interface CommentLike {
  id: number;
  userId: number;
  commentId: number;
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
export interface CreateCommentResponse {
  message: string;
  comment: Comment;
}

export interface GetCommentResponse {
  comment: Comment;
}

export interface GetPostCommentsResponse extends PaginatedResponse<Comment> {}

export interface UpdateCommentResponse {
  message: string;
  comment: Comment;
}

export interface DeleteCommentResponse {
  message: string;
}

export interface LikeCommentResponse {
  message: string;
  isLiked: boolean;
  likesCount: number;
}

export interface GetCommentLikesResponse
  extends PaginatedResponse<CommentLike> {}

// Request Types
export interface CreateCommentRequest {
  text: string;
  postId: number;
}

export interface UpdateCommentRequest {
  text: string;
}

export interface GetPostCommentsParams {
  postId: number;
  page?: number;
  size?: number;
}

export interface GetCommentLikesParams {
  commentId: number;
  page?: number;
  size?: number;
}

// Query Key Types
export type CommentQueryKey = ["comment", number];
export type PostCommentsQueryKey = ["comments", "post", number];
export type CommentLikesQueryKey = ["comments", number, "likes"];
