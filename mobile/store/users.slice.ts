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
  GetAllUsersResponse,
  GetUserProfileResponse,
  UpdateUserResponse,
  DeleteUserResponse,
  FollowUserResponse,
  GetUserFollowersResponse,
  GetUserFollowingResponse,
  UpdateUserRequest,
  GetAllUsersParams,
  GetFollowersParams,
  GetFollowingParams,
  GetSuggestedUsersParams,
  GetSuggestedUsersResponse,
} from "../types/users.types";

// *********************************** ((API Functions)) **************************************** //

// Get All Users
const fetchAllUsers = async (
  params?: GetAllUsersParams
): Promise<GetAllUsersResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.size) queryParams.append("size", params.size.toString());
  if (params?.search) queryParams.append("search", params.search);

  const response = await makeRequest.get(`/users?${queryParams.toString()}`);
  return response.data;
};

// Get Current Profile
const fetchCurrentProfile = async (): Promise<GetUserProfileResponse> => {
  const response = await makeRequest.get(`/users/me`);
  return response.data;
};

// Get User Profile by ID
const fetchUserProfile = async (
  userId: number
): Promise<GetUserProfileResponse> => {
  const response = await makeRequest.get(`/users/${userId}`);
  return response.data;
};

// Update User Profile
const updateUserProfile = async (
  data: UpdateUserRequest
): Promise<UpdateUserResponse> => {
  const response = await makeRequest.patch("/users/me", data);
  return response.data;
};

// Delete User Account
const deleteUserAccount = async (): Promise<DeleteUserResponse> => {
  const response = await makeRequest.delete("/users/me");
  return response.data;
};

// Follow/Unfollow User (Toggle)
const toggleFollowUser = async (
  userId: number
): Promise<FollowUserResponse> => {
  const response = await makeRequest.post(`/users/${userId}/follow`);
  return response.data;
};

// Get User Followers
const fetchUserFollowers = async (
  params: GetFollowersParams
): Promise<GetUserFollowersResponse> => {
  const { userId, page = 1, size = 10 } = params;
  const response = await makeRequest.get(
    `/users/${userId}/followers?page=${page}&size=${size}`
  );
  return response.data;
};

// Get User Following
const fetchUserFollowing = async (
  params: GetFollowingParams
): Promise<GetUserFollowingResponse> => {
  const { userId, page = 1, size = 10 } = params;
  const response = await makeRequest.get(
    `/users/${userId}/following?page=${page}&size=${size}`
  );
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

// Get All Users
export const useAllUsers = (params?: GetAllUsersParams) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => fetchAllUsers(params),
  });
};

// Get Current Profile
export const useCurrentProfile = (
  options?: Omit<
    UseQueryOptions<GetUserProfileResponse>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => fetchCurrentProfile(),
    ...options,
  });
};

// Get User Profile by ID
export const useUserProfile = (
  userId: number,
  options?: Omit<
    UseQueryOptions<GetUserProfileResponse>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId,
    ...options,
  });
};

// Update User Profile
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

// Delete User Account
export const useDeleteUserAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserAccount,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

// Toggle Follow User
export const useToggleFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFollowUser,
    onMutate: async (userId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["comment-likes"] });
      await queryClient.cancelQueries({ queryKey: ["reply-likes"] });
      await queryClient.cancelQueries({ queryKey: ["post-likes"] });

      // Snapshot previous values
      const previousCommentLikes = queryClient.getQueriesData({
        queryKey: ["comment-likes"],
      });

      // Optimistically update comment likes
      queryClient.setQueriesData(
        { queryKey: ["comment-likes"] },
        (old: any) => {
          if (!old || !old.pages || !Array.isArray(old.pages)) return old;

          return {
            ...old,
            pages: old.pages.map((page: any) => {
              if (!page || !page.likes || !Array.isArray(page.likes))
                return page;

              return {
                ...page,
                likes: page.likes.map((like: any) => {
                  if (like?.user?.id === userId) {
                    return {
                      ...like,
                      user: {
                        ...like.user,
                        isFollowing: !like.user.isFollowing,
                      },
                    };
                  }
                  return like;
                }),
              };
            }),
          };
        }
      );

      // Return context for rollback
      return { previousCommentLikes };
    },
    onError: (err, userId, context) => {
      // Rollback on error
      if (context?.previousCommentLikes) {
        context.previousCommentLikes.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["comment-likes"] });
      queryClient.invalidateQueries({ queryKey: ["reply-likes"] });
      queryClient.invalidateQueries({ queryKey: ["post-likes"] });
    },
  });
};

// Get User Followers with Infinite Scroll
export const useUserFollowers = (userId: number, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["followers", userId],
    queryFn: ({ pageParam = 1 }) =>
      fetchUserFollowers({ userId, page: pageParam as number }),
    enabled: !!userId && enabled,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// Get User Following with Infinite Scroll
export const useUserFollowing = (userId: number, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["following", userId],
    queryFn: ({ pageParam = 1 }) =>
      fetchUserFollowing({ userId, page: pageParam as number }),
    enabled: !!userId && enabled,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// Get All Users with Infinite Scroll
export const useInfiniteUsers = (params?: Omit<GetAllUsersParams, "page">) => {
  return useInfiniteQuery({
    queryKey: ["users", "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      fetchAllUsers({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// *************************************************** //
// Get Suggested Users
const fetchSuggestedUsers = async (
  params?: GetSuggestedUsersParams
): Promise<GetSuggestedUsersResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.size) queryParams.append("size", params.size.toString());

  const response = await makeRequest.get(
    `/users/suggested?${queryParams.toString()}`
  );
  return response.data;
};
// Hook with Infinite Scroll
export const useInfiniteSuggestedUsers = (
  params?: Omit<GetSuggestedUsersParams, "page">
) => {
  return useInfiniteQuery({
    queryKey: ["users", "suggested", params],
    queryFn: ({ pageParam = 1 }) =>
      fetchSuggestedUsers({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};
