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
  CreatePostResponse,
  GetPostResponse,
  GetAllPostsResponse,
  GetUserPostsResponse,
  UpdatePostResponse,
  DeletePostResponse,
  LikePostResponse,
  GetPostLikesResponse,
  CreatePostRequest,
  UpdatePostRequest,
  GetAllPostsParams,
  GetUserPostsParams,
  GetPostLikesParams,
} from "../types/posts.types";

// *********************************** ((API Functions)) **************************************** //

// Create Post
const createPost = async (
  data: CreatePostRequest
): Promise<CreatePostResponse> => {
  const response = await makeRequest.post("/posts", data);
  return response.data;
};

// Get All Posts
const fetchAllPosts = async (
  params?: GetAllPostsParams
): Promise<GetAllPostsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.size) queryParams.append("size", params.size.toString());
  if (params?.search) queryParams.append("search", params.search);

  const response = await makeRequest.get(`/posts?${queryParams.toString()}`);
  return response.data;
};

// Get Single Post
const fetchPost = async (postId: number): Promise<GetPostResponse> => {
  const response = await makeRequest.get(`/posts/${postId}`);
  return response.data;
};

// Update Post
const updatePost = async ({
  postId,
  ...data
}: UpdatePostRequest & { postId: number }): Promise<UpdatePostResponse> => {
  const response = await makeRequest.patch(`/posts/${postId}`, data);
  return response.data;
};

// Delete Post
const deletePost = async (postId: number): Promise<DeletePostResponse> => {
  const response = await makeRequest.delete(`/posts/${postId}`);
  return response.data;
};

// Get User Posts
const fetchUserPosts = async (
  params: GetUserPostsParams
): Promise<GetUserPostsResponse> => {
  const { userId, page = 1, size = 10 } = params;
  const response = await makeRequest.get(
    `/posts/user/${userId}?page=${page}&size=${size}`
  );
  return response.data;
};

// Like/Unlike Post (Toggle)
const toggleLikePost = async (postId: number): Promise<LikePostResponse> => {
  const response = await makeRequest.post(`/posts/${postId}/like`);
  return response.data;
};

// Get Post Likes
const fetchPostLikes = async (
  params: GetPostLikesParams
): Promise<GetPostLikesResponse> => {
  const { postId, page = 1, size = 10 } = params;
  const response = await makeRequest.get(
    `/posts/${postId}/likes?page=${page}&size=${size}`
  );
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

// Create Post
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// Get All Posts
export const useAllPosts = (params?: GetAllPostsParams) => {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => fetchAllPosts(params),
  });
};

// Get All Posts with Infinite Scroll
export const useInfinitePosts = (params?: Omit<GetAllPostsParams, "page">) => {
  return useInfiniteQuery({
    queryKey: ["posts", "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      fetchAllPosts({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// Get Single Post
export const usePost = (
  postId: number,
  options?: Omit<UseQueryOptions<GetPostResponse>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId),
    enabled: !!postId,
    ...options,
  });
};

// Update Post
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePost,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["post", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// Delete Post
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// Get User Posts
export const useUserPosts = (userId: number, enabled = true) => {
  return useQuery({
    queryKey: ["posts", "user", userId],
    queryFn: () => fetchUserPosts({ userId }),
    enabled: !!userId && enabled,
  });
};

// Get User Posts with Infinite Scroll
export const useInfiniteUserPosts = (userId: number, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["posts", "user", userId, "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      fetchUserPosts({ userId, page: pageParam as number }),
    enabled: !!userId && enabled,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// Toggle Like Post
export const useToggleLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleLikePost,
    onSuccess: (data, postId) => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", postId, "likes"] });
    },
  });
};

// Get Post Likes
export const usePostLikes = (postId: number, enabled = true) => {
  return useQuery({
    queryKey: ["posts", postId, "likes"],
    queryFn: () => fetchPostLikes({ postId }),
    enabled: !!postId && enabled,
  });
};

// Get Post Likes with Infinite Scroll
export const useInfinitePostLikes = (postId: number, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["posts", postId, "likes", "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      fetchPostLikes({ postId, page: pageParam as number }),
    enabled: !!postId && enabled,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};
