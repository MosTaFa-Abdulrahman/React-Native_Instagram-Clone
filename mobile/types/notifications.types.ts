export enum NotificationType {
  LIKE = "LIKE",
  COMMENT = "COMMENT",
  REPLY = "REPLY",
  FOLLOW = "FOLLOW",
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  type: NotificationType;
  referenceId: number | null;
  createdDate: string;
  lastModifiedDate: string | null;
  userId: number;
  triggeredByUserId: number;
  triggeredByUser?: {
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
export interface GetUserNotificationsResponse
  extends PaginatedResponse<Notification> {}

export interface GetUnreadCountResponse {
  unreadCount: number;
}

export interface MarkAsReadResponse {
  message: string;
  notification: Notification;
}

export interface MarkAllAsReadResponse {
  message: string;
  updatedCount: number;
}

export interface DeleteNotificationResponse {
  message: string;
}

export interface DeleteAllNotificationsResponse {
  message: string;
  deletedCount: number;
}

// Request Types
export interface GetUserNotificationsParams {
  page?: number;
  size?: number;
  type?: NotificationType;
  isRead?: boolean;
}

// Query Key Types
export type NotificationsQueryKey = [
  "notifications",
  GetUserNotificationsParams?
];
export type UnreadCountQueryKey = ["notifications", "unread-count"];
export type NotificationQueryKey = ["notification", number];
