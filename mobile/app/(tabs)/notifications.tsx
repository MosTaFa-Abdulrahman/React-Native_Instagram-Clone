import { styles } from "@/styles/Notifications.styles";
import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { COLORS } from "@/constants/theme";

// React-Query
import {
  useInfiniteNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
  useUnreadCount,
} from "@/store/notifications.slice";

// Types
import { Notification, NotificationType } from "@/types/notifications.types";

function Notifications() {
  const [refreshing, setRefreshing] = useState(false);

  // React Query Hooks
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteNotifications();

  const { data: unreadCountData } = useUnreadCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const deleteAllNotificationsMutation = useDeleteAllNotifications();

  // Flatten paginated data
  const notifications = data?.pages.flatMap((page) => page.content) ?? [];
  const unreadCount = unreadCountData?.unreadCount ?? 0;

  // Handle Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Handle Load More
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Handle Mark as Read
  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  // Handle Mark All as Read
  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      Alert.alert("Info", "No unread notifications");
      return;
    }

    Alert.alert(
      "Mark All as Read",
      `Mark all ${unreadCount} notifications as read?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark All",
          onPress: () => markAllAsReadMutation.mutate(),
        },
      ]
    );
  };

  // Handle Delete Notification
  const handleDeleteNotification = (notificationId: number) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteNotificationMutation.mutate(notificationId),
        },
      ]
    );
  };

  // Handle Delete All Notifications
  const handleDeleteAllNotifications = () => {
    if (notifications.length === 0) {
      Alert.alert("Info", "No notifications to delete");
      return;
    }

    Alert.alert(
      "Delete All Notifications",
      `Are you sure you want to delete all ${notifications.length} notifications? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => deleteAllNotificationsMutation.mutate(),
        },
      ]
    );
  };

  // Handle Notification Press
  const handleNotificationPress = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  // Get Icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.LIKE:
        return <Ionicons name="heart" size={16} color={COLORS.error} />;
      case NotificationType.COMMENT:
        return <Ionicons name="chatbubble" size={16} color={COLORS.primary} />;
      case NotificationType.REPLY:
        return <Ionicons name="chatbubbles" size={16} color="blue" />;
      case NotificationType.FOLLOW:
        return <Ionicons name="person-add" size={16} color={COLORS.success} />;
    }
  };

  // Format time ago
  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Render Notification Item
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const user = item.triggeredByUser;
    const avatarSource = user?.imgUrl
      ? { uri: user.imgUrl }
      : "https://www.freepik.com/free-psd/red-button-with-white-silhouette-user-profile-icon_420561657.htm#fromView=keyword&page=1&position=5&uuid=de4ee625-b369-43fe-ac9b-0512ed2b20db&query=User";

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.isRead && { backgroundColor: COLORS.surface + "20" },
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          {/* Avatar with Icon Badge */}
          <View style={styles.avatarContainer}>
            <Image source={avatarSource} style={styles.avatar} />
            <View style={styles.iconBadge}>
              {getNotificationIcon(item.type)}
            </View>
          </View>

          {/* Notification Info */}
          <View style={styles.notificationInfo}>
            <Text style={styles.username} numberOfLines={1}>
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.username}
            </Text>
            <Text style={styles.action} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.timeAgo}>
              {formatTimeAgo(item.createdDate)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {/* Unread Indicator */}
          {!item.isRead && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: COLORS.primary,
              }}
            />
          )}

          {/* Delete Button */}
          <TouchableOpacity
            onPress={() => handleDeleteNotification(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={20} color={COLORS.grey} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Render Footer
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  // Render Empty State
  const renderEmptyState = () => {
    if (isLoading) return null;

    return (
      <View style={[styles.centered, { flex: 1, paddingTop: 100 }]}>
        <Ionicons
          name="notifications-off-outline"
          size={64}
          color={COLORS.grey}
        />
        <Text style={{ color: COLORS.grey, marginTop: 16, fontSize: 16 }}>
          No notifications yet
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View
                style={{
                  backgroundColor: COLORS.error,
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  minWidth: 24,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 16 }}>
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              <Ionicons
                name="checkmark-done"
                size={24}
                color={unreadCount > 0 ? COLORS.primary : COLORS.grey}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteAllNotifications}
              disabled={deleteAllNotificationsMutation.isPending}
            >
              <Ionicons name="trash-outline" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          notifications.length === 0 && { flex: 1 },
        ]}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

export default Notifications;
