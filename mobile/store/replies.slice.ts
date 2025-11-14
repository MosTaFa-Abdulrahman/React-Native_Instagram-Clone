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
  CreateReplyResponse,
  GetReplyResponse,
  GetCommentRepliesResponse,
  UpdateReplyResponse,
  DeleteReplyResponse,
  LikeReplyResponse,
  GetReplyLikesResponse,
  CreateReplyRequest,
  UpdateReplyRequest,
  GetCommentRepliesParams,
  GetReplyLikesParams,
} from "../types/replies.types";

// *********************************** ((API Functions)) **************************************** //

// Create Reply
const createReply = async (
  data: CreateReplyRequest
): Promise<CreateReplyResponse> => {
  const response = await makeRequest.post("/replies", data);
  return response.data;
};

// Get Single Reply
const fetchReply = async (replyId: number): Promise<GetReplyResponse> => {
  const response = await makeRequest.get(`/replies/${replyId}`);
  return response.data;
};

// Update Reply
const updateReply = async ({
  replyId,
  ...data
}: UpdateReplyRequest & { replyId: number }): Promise<UpdateReplyResponse> => {
  const response = await makeRequest.patch(`/replies/${replyId}`, data);
  return response.data;
};

// Delete Reply
const deleteReply = async (replyId: number): Promise<DeleteReplyResponse> => {
  const response = await makeRequest.delete(`/replies/${replyId}`);
  return response.data;
};

// Get Comment Replies
const fetchCommentReplies = async (
  params: GetCommentRepliesParams
): Promise<GetCommentRepliesResponse> => {
  const { commentId, page = 1, size = 10 } = params;
  const response = await makeRequest.get(
    `/replies/comment/${commentId}?page=${page}&size=${size}`
  );
  return response.data;
};

// Like/Unlike Reply (Toggle)
const toggleLikeReply = async (replyId: number): Promise<LikeReplyResponse> => {
  const response = await makeRequest.post(`/replies/${replyId}/like`);
  return response.data;
};

// Get Reply Likes
const fetchReplyLikes = async (
  params: GetReplyLikesParams
): Promise<GetReplyLikesResponse> => {
  const { replyId, page = 1, size = 10 } = params;
  const response = await makeRequest.get(
    `/replies/${replyId}/likes?page=${page}&size=${size}`
  );
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

// Create Reply
export const useCreateReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReply,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["replies", "comment", data.reply.commentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["comment", data.reply.commentId],
      });
    },
  });
};

// Get Single Reply
export const useReply = (
  replyId: number,
  options?: Omit<UseQueryOptions<GetReplyResponse>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: ["reply", replyId],
    queryFn: () => fetchReply(replyId),
    enabled: !!replyId,
    ...options,
  });
};

// Update Reply
export const useUpdateReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReply,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reply", variables.replyId],
      });
      queryClient.invalidateQueries({
        queryKey: ["replies", "comment", data.reply.commentId],
      });
    },
  });
};

// Delete Reply
export const useDeleteReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReply,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["replies"] });
      queryClient.invalidateQueries({ queryKey: ["comment"] });
    },
  });
};

// Get Comment Replies
export const useCommentReplies = (commentId: number, enabled = true) => {
  return useQuery({
    queryKey: ["replies", "comment", commentId],
    queryFn: () => fetchCommentReplies({ commentId }),
    enabled: !!commentId && enabled,
  });
};

// Get Comment Replies with Infinite Scroll
export const useInfiniteCommentReplies = (
  commentId: number,
  enabled = true
) => {
  return useInfiniteQuery({
    queryKey: ["replies", "comment", commentId, "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      fetchCommentReplies({ commentId, page: pageParam as number }),
    enabled: !!commentId && enabled,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// Toggle Like Reply
export const useToggleLikeReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleLikeReply,
    onSuccess: (data, replyId) => {
      queryClient.invalidateQueries({ queryKey: ["reply", replyId] });
      queryClient.invalidateQueries({ queryKey: ["replies"] });
      queryClient.invalidateQueries({
        queryKey: ["replies", replyId, "likes"],
      });
    },
  });
};

// Get Reply Likes
export const useReplyLikes = (replyId: number, enabled: boolean) => {
  return useInfiniteQuery({
    queryKey: ["reply-likes", replyId],
    queryFn: ({ pageParam = 1 }) =>
      fetchReplyLikes({ replyId, page: pageParam }),
    enabled: !!replyId && enabled,
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.totalPages
        ? lastPage.page + 1
        : undefined;
    },
    initialPageParam: 1,
  });
};

// Get Reply Likes with Infinite Scroll
export const useInfiniteReplyLikes = (replyId: number, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["replies", replyId, "likes", "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      fetchReplyLikes({ replyId, page: pageParam as number }),
    enabled: !!replyId && enabled,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};
