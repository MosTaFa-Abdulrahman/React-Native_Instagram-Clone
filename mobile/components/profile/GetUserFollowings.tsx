import { styles } from "@/styles/GetUserFollowings.styles";
import { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

// Context & React-Query
import { useAuth } from "@/context/AuthContext";
import { useUserFollowing, useToggleFollowUser } from "@/store/users.slice";

// Types
import { FollowRelation } from "@/types/users.types";

interface GetUserFollowingProps {
  visible: boolean;
  onClose: () => void;
  userId: number;
  username: string;
}

function GetUserFollowings({
  visible,
  onClose,
  userId,
  username,
}: GetUserFollowingProps) {
  const { currentUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch following
  const {
    data: followingData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useUserFollowing(userId, visible);

  const toggleFollowMutation = useToggleFollowUser();

  const following = followingData?.pages.flatMap((page) => page.content) || [];

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Handle follow/unfollow
  const handleToggleFollow = async (followingId: number) => {
    try {
      await toggleFollowMutation.mutateAsync(followingId);
      refetch();
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  };

  // Render following item
  const renderFollowingItem = ({ item }: { item: FollowRelation }) => {
    const followingUser = item.following;
    if (!followingUser) return null;

    const isCurrentUser = followingUser.id === currentUser?.id;

    return (
      <Pressable style={styles.followingItem}>
        <View style={styles.followingInfo}>
          <Image
            source={followingUser.imgUrl || "https://via.placeholder.com/50"}
            style={styles.followingImage}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.followingDetails}>
            <Text style={styles.followingName}>
              {followingUser.firstName && followingUser.lastName
                ? `${followingUser.firstName} ${followingUser.lastName}`
                : followingUser.username}
            </Text>
            <Text style={styles.followingUsername}>
              @{followingUser.username}
            </Text>
            {followingUser.city && (
              <Text style={styles.followingCity}>{followingUser.city}</Text>
            )}
          </View>
        </View>

        {!isCurrentUser && (
          <TouchableOpacity
            style={
              followingUser.isFollowing
                ? styles.unfollowButton
                : styles.followButton
            }
            onPress={(e) => {
              e.stopPropagation();
              handleToggleFollow(followingUser.id);
            }}
            disabled={toggleFollowMutation.isPending}
          >
            {toggleFollowMutation.isPending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>
                {followingUser.isFollowing ? "Unfollow" : "Follow"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </Pressable>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-outline" size={64} color={COLORS.grey} />
        <Text style={styles.emptyText}>Not following anyone yet</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{username}'s Following</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Following List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={following}
            renderItem={renderFollowingItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
          />
        )}
      </View>
    </Modal>
  );
}

export default GetUserFollowings;
