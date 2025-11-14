import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { makeRequest } from "../requestMethod";

// Types
import {
  CreateStoryResponse,
  DeleteStoryResponse,
  GetFollowingStoriesResponse,
  GetUserStoriesResponse,
  CreateStoryRequest,
} from "../types/stories.types";

// *********************************** ((API Functions)) **************************************** //

// Create Story
const createStory = async (
  data: CreateStoryRequest
): Promise<CreateStoryResponse> => {
  const response = await makeRequest.post("/stories", data);
  return response.data;
};

// Delete Story
const deleteStory = async (storyId: number): Promise<DeleteStoryResponse> => {
  const response = await makeRequest.delete(`/stories/${storyId}`);
  return response.data;
};

// Get Following Stories (Stories from users you follow)
const fetchFollowingStories =
  async (): Promise<GetFollowingStoriesResponse> => {
    const response = await makeRequest.get("/stories/following");
    return response.data;
  };

// Get User Stories
const fetchUserStories = async (
  userId: number
): Promise<GetUserStoriesResponse> => {
  const response = await makeRequest.get(`/stories/user/${userId}`);
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

// Create Story
export const useCreateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
};

// Delete Story
export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
};

// Get Following Stories
export const useFollowingStories = (
  options?: Omit<
    UseQueryOptions<GetFollowingStoriesResponse>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["stories", "following"],
    queryFn: fetchFollowingStories,
    // Optional: Refetch periodically to check for new stories
    refetchInterval: 60000, // 1 minute
    // Optional: Refetch when window regains focus
    refetchOnWindowFocus: true,
    ...options,
  });
};

// Get User Stories
export const useUserStories = (
  userId: number,
  options?: Omit<
    UseQueryOptions<GetUserStoriesResponse>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["stories", "user", userId],
    queryFn: () => fetchUserStories(userId),
    enabled: !!userId,
    ...options,
  });
};

// Get Current User's Own Stories
export const useMyStories = (
  currentUserId: number,
  options?: Omit<
    UseQueryOptions<GetUserStoriesResponse>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["stories", "user", currentUserId],
    queryFn: () => fetchUserStories(currentUserId),
    enabled: !!currentUserId,
    ...options,
  });
};
