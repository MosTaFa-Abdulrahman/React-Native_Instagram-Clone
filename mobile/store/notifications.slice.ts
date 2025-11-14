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
  GetUserNotificationsResponse,
  GetUnreadCountResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
  DeleteNotificationResponse,
  DeleteAllNotificationsResponse,
  GetUserNotificationsParams,
} from "../types/notifications.types";

// *********************************** ((API Functions)) **************************************** //

// Get User Notifications
const fetchUserNotifications = async (
  params?: GetUserNotificationsParams
): Promise<GetUserNotificationsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.size) queryParams.append("size", params.size.toString());
  if (params?.type) queryParams.append("type", params.type);
  if (params?.isRead !== undefined)
    queryParams.append("isRead", params.isRead.toString());

  const response = await makeRequest.get(
    `/notifications?${queryParams.toString()}`
  );
  return response.data;
};

// Get Unread Count
const fetchUnreadCount = async (): Promise<GetUnreadCountResponse> => {
  const response = await makeRequest.get("/notifications/unread-count");
  return response.data;
};

// Mark as Read
const markNotificationAsRead = async (
  notificationId: number
): Promise<MarkAsReadResponse> => {
  const response = await makeRequest.patch(
    `/notifications/${notificationId}/read`
  );
  return response.data;
};

// Mark All as Read
const markAllNotificationsAsRead = async (): Promise<MarkAllAsReadResponse> => {
  const response = await makeRequest.patch("/notifications/mark-all-read");
  return response.data;
};

// Delete Notification
const deleteNotification = async (
  notificationId: number
): Promise<DeleteNotificationResponse> => {
  const response = await makeRequest.delete(`/notifications/${notificationId}`);
  return response.data;
};

// Delete All Notifications
const deleteAllNotifications =
  async (): Promise<DeleteAllNotificationsResponse> => {
    const response = await makeRequest.delete("/notifications");
    return response.data;
  };

// *********************************** ((React-Query Hooks)) **************************************** //

// Get User Notifications
export const useNotifications = (params?: GetUserNotificationsParams) => {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => fetchUserNotifications(params),
  });
};

// Get User Notifications with Infinite Scroll
export const useInfiniteNotifications = (
  params?: Omit<GetUserNotificationsParams, "page">
) => {
  return useInfiniteQuery({
    queryKey: ["notifications", "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      fetchUserNotifications({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// Get Unread Count
export const useUnreadCount = (
  options?: Omit<
    UseQueryOptions<GetUnreadCountResponse>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: fetchUnreadCount,
    // Optional: Refetch more frequently for real-time updates
    refetchInterval: 30000, // 30 seconds
    ...options,
  });
};

// Mark as Read
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });
};

// Mark All as Read
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });
};

// Delete Notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });
};

// Delete All Notifications
export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });
};
