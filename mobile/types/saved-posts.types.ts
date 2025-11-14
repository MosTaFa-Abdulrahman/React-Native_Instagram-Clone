export interface SavedPost {
  id: number;
  createdDate: string;
  lastModifiedDate: string | null;
  userId: number;
  postId: number;
  post?: {
    id: number;
    title: string;
    description: string | null;
    imageUrl: string | null;
    createdDate: string;
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
export interface SavePostResponse {
  message: string;
  isSaved: boolean;
  savedPost?: SavedPost;
}

export interface UnsavePostResponse {
  message: string;
  isSaved: boolean;
}

export interface GetSavedPostsResponse extends PaginatedResponse<SavedPost> {}

// Request Types
export interface GetSavedPostsParams {
  userId: number;
  page?: number;
  size?: number;
}

// Query Key Types
export type SavedPostsQueryKey = ["saved-posts", number];
export type SavedPostQueryKey = ["saved-post", number, number]; // [userId, postId]
