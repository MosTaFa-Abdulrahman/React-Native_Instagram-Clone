import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { makeRequest } from "../requestMethod";

// Types
import {
  SavePostResponse,
  UnsavePostResponse,
  GetSavedPostsResponse,
  GetSavedPostsParams,
} from "../types/saved-posts.types";

// *********************************** ((API Functions)) **************************************** //

// Save Post
const savePost = async (postId: number): Promise<SavePostResponse> => {
  const response = await makeRequest.post(`/saved-posts/${postId}`);
  return response.data;
};

// Unsave Post
const unsavePost = async (postId: number): Promise<UnsavePostResponse> => {
  const response = await makeRequest.delete(`/saved-posts/${postId}`);
  return response.data;
};

// Get Saved Posts
const fetchSavedPosts = async (
  params: GetSavedPostsParams
): Promise<GetSavedPostsResponse> => {
  const { userId, page = 1, size = 10 } = params;
  const response = await makeRequest.get(
    `/saved-posts/user/${userId}?page=${page}&size=${size}`
  );
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

// Save Post
export const useSavePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: savePost,
    onSuccess: (data, postId) => {
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// Unsave Post
export const useUnsavePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unsavePost,
    onSuccess: (data, postId) => {
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// Toggle Save Post (Save/Unsave based on current state)
export const useToggleSavePost = () => {
  const savePostMutation = useSavePost();
  const unsavePostMutation = useUnsavePost();

  return {
    toggleSave: (postId: number, isSaved: boolean) => {
      if (isSaved) {
        return unsavePostMutation.mutate(postId);
      } else {
        return savePostMutation.mutate(postId);
      }
    },
    isLoading: savePostMutation.isPending || unsavePostMutation.isPending,
    error: savePostMutation.error || unsavePostMutation.error,
  };
};

// Get Saved Posts
export const useSavedPosts = (
  userId: number,
  options?: Omit<UseQueryOptions<GetSavedPostsResponse>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: ["saved-posts", userId],
    queryFn: () => fetchSavedPosts({ userId }),
    enabled: !!userId,
    ...options,
  });
};

// Get Saved Posts with Infinite Scroll
export const useInfiniteSavedPosts = (userId: number, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["saved-posts", userId, "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      fetchSavedPosts({ userId, page: pageParam as number }),
    enabled: !!userId && enabled,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// Get Current User's Saved Posts
export const useMySavedPosts = (
  currentUserId: number,
  options?: Omit<UseQueryOptions<GetSavedPostsResponse>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: ["saved-posts", currentUserId],
    queryFn: () => fetchSavedPosts({ userId: currentUserId }),
    enabled: !!currentUserId,
    ...options,
  });
};

// Get Current User's Saved Posts with Infinite Scroll
export const useInfiniteMySavedPosts = (
  currentUserId: number,
  enabled = true
) => {
  return useInfiniteQuery({
    queryKey: ["saved-posts", currentUserId, "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      fetchSavedPosts({ userId: currentUserId, page: pageParam as number }),
    enabled: !!currentUserId && enabled,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};
