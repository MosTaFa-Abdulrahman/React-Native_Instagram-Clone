export interface Story {
  id: number;
  mediaUrl: string;
  expiredAt: string;
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
}

// Grouped Stories by User
export interface UserStories {
  userId: number;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    imgUrl: string | null;
  };
  stories: Story[];
  hasUnseenStories?: boolean;
}

// API Response Types
export interface CreateStoryResponse {
  message: string;
  story: Story;
}

export interface DeleteStoryResponse {
  message: string;
}

export interface GetFollowingStoriesResponse {
  stories: UserStories[];
  totalUsers: number;
}

export interface GetUserStoriesResponse {
  stories: Story[];
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    imgUrl: string | null;
  };
}

// Request Types
export interface CreateStoryRequest {
  mediaUrl: string;
}

// Query Key Types
export type FollowingStoriesQueryKey = ["stories", "following"];
export type UserStoriesQueryKey = ["stories", "user", number];
export type StoryQueryKey = ["story", number];
