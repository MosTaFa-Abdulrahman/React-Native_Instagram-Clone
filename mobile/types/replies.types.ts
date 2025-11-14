export interface Reply {
  id: number;
  text: string;
  createdDate: string;
  lastModifiedDate: string | null;
  userId: number;
  commentId: number;
  user?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    imgUrl: string | null;
  };
  _count?: {
    likes: number;
  };
  isLiked?: boolean;
}

// ReplyLike Types
export interface ReplyLike {
  id: number;
  userId: number;
  replyId: number;
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
export interface CreateReplyResponse {
  message: string;
  reply: Reply;
}

export interface GetReplyResponse {
  reply: Reply;
}

export interface GetCommentRepliesResponse extends PaginatedResponse<Reply> {}

export interface UpdateReplyResponse {
  message: string;
  reply: Reply;
}

export interface DeleteReplyResponse {
  message: string;
}

export interface LikeReplyResponse {
  message: string;
  isLiked: boolean;
  likesCount: number;
}

export interface GetReplyLikesResponse extends PaginatedResponse<ReplyLike> {}

// Request Types
export interface CreateReplyRequest {
  text: string;
  commentId: number;
}

export interface UpdateReplyRequest {
  text: string;
}

export interface GetCommentRepliesParams {
  commentId: number;
  page?: number;
  size?: number;
}

export interface GetReplyLikesParams {
  replyId: number;
  page?: number;
  size?: number;
}

// Query Key Types
export type ReplyQueryKey = ["reply", number];
export type CommentRepliesQueryKey = ["replies", "comment", number];
export type ReplyLikesQueryKey = ["replies", number, "likes"];
