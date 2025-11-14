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
  CreateCommentResponse,
  GetCommentResponse,
  GetPostCommentsResponse,
  UpdateCommentResponse,
  DeleteCommentResponse,
  LikeCommentResponse,
  GetCommentLikesResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
  GetPostCommentsParams,
  GetCommentLikesParams,
} from "../types/comments.types";

// *********************************** ((API Functions)) **************************************** //

// Create Comment
const createComment = async (
  data: CreateCommentRequest
): Promise<CreateCommentResponse> => {
  const response = await makeRequest.post("/comments", data);
  return response.data;
};

// Get Single Comment
const fetchComment = async (commentId: number): Promise<GetCommentResponse> => {
  const response = await makeRequest.get(`/comments/${commentId}`);
  return response.data;
};

// Update Comment
const updateComment = async ({
  commentId,
  ...data
}: UpdateCommentRequest & {
  commentId: number;
}): Promise<UpdateCommentResponse> => {
  const response = await makeRequest.patch(`/comments/${commentId}`, data);
  return response.data;
};

// Delete Comment
const deleteComment = async (
  commentId: number
): Promise<DeleteCommentResponse> => {
  const response = await makeRequest.delete(`/comments/${commentId}`);
  return response.data;
};

// Get Post Comments
const fetchPostComments = async (
  params: GetPostCommentsParams
): Promise<GetPostCommentsResponse> => {
  const { postId, page = 1, size = 10 } = params;
  const response = await makeRequest.get(
    `/comments/post/${postId}?page=${page}&size=${size}`
  );
  return response.data;
};

// Like/Unlike Comment (Toggle)
const toggleLikeComment = async (
  commentId: number
): Promise<LikeCommentResponse> => {
  const response = await makeRequest.post(`/comments/${commentId}/like`);
  return response.data;
};

// Get Comment Likes
const fetchCommentLikes = async (
  params: GetCommentLikesParams
): Promise<GetCommentLikesResponse> => {
  const { commentId, page = 1, size = 10 } = params;
  const response = await makeRequest.get(
    `/comments/${commentId}/likes?page=${page}&size=${size}`
  );
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

// Create Comment
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", "post", data.comment.postId],
      });
      queryClient.invalidateQueries({
        queryKey: ["post", data.comment.postId],
      });
    },
  });
};

// Get Single Comment
export const useComment = (
  commentId: number,
  options?: Omit<UseQueryOptions<GetCommentResponse>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: ["comment", commentId],
    queryFn: () => fetchComment(commentId),
    enabled: !!commentId,
    ...options,
  });
};

// Update Comment
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comment", variables.commentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["comments", "post", data.comment.postId],
      });
    },
  });
};

// Delete Comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
  });
};

// Get Post Comments
export const usePostComments = (postId: number, enabled = true) => {
  return useQuery({
    queryKey: ["comments", "post", postId],
    queryFn: () => fetchPostComments({ postId }),
    enabled: !!postId && enabled,
  });
};

// Get Post Comments with Infinite Scroll
export const useInfinitePostComments = (postId: number, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["comments", "post", postId, "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      fetchPostComments({ postId, page: pageParam as number }),
    enabled: !!postId && enabled,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// Toggle Like Comment
export const useToggleLikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleLikeComment,
    onSuccess: (data, commentId) => {
      queryClient.invalidateQueries({ queryKey: ["comment", commentId] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({
        queryKey: ["comment-likes"],
      });
    },
  });
};

// Get Comment Likes with Infinite Scroll
export const useCommentLikes = (commentId: number, enabled: boolean) => {
  return useInfiniteQuery({
    queryKey: ["comment-likes", commentId],
    queryFn: ({ pageParam = 1 }) =>
      fetchCommentLikes({ commentId, page: pageParam }),
    enabled: !!commentId && enabled,
    refetchOnMount: true, // Always refetch when modal opens
    staleTime: 0, // Consider data stale immediately
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.totalPages
        ? lastPage.page + 1
        : undefined;
    },
    initialPageParam: 1,
  });
};

// Get Comment Likes with Infinite Scroll (Alternative)
export const useInfiniteCommentLikes = (commentId: number, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["comments", commentId, "likes", "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      fetchCommentLikes({ commentId, page: pageParam as number }),
    enabled: !!commentId && enabled,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};
