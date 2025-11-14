import { styles } from "@/styles/GetUserFollowers.styles";
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

// Styles
import { COLORS } from "@/constants/theme";

// Context & React-Query
import { useAuth } from "@/context/AuthContext";
import { useUserFollowers, useToggleFollowUser } from "@/store/users.slice";

// Types
import { FollowRelation } from "@/types/users.types";

interface GetUserFollowersProps {
  visible: boolean;
  onClose: () => void;
  userId: number;
  username: string;
}

function GetUserFollowers({
  visible,
  onClose,
  userId,
  username,
}: GetUserFollowersProps) {
  const { currentUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch followers
  const {
    data: followersData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useUserFollowers(userId, visible);

  const toggleFollowMutation = useToggleFollowUser();

  const followers = followersData?.pages.flatMap((page) => page.content) || [];

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
  const handleToggleFollow = async (followerId: number) => {
    try {
      await toggleFollowMutation.mutateAsync(followerId);
      refetch();
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  };

  // Render follower item
  const renderFollowerItem = ({ item }: { item: FollowRelation }) => {
    const follower = item.follower;
    if (!follower) return null;

    const isCurrentUser = follower.id === currentUser?.id;

    return (
      <Pressable style={styles.followerItem}>
        <View style={styles.followerInfo}>
          <Image
            source={follower.imgUrl || "https://via.placeholder.com/50"}
            style={styles.followerImage}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.followerDetails}>
            <Text style={styles.followerName}>
              {follower.firstName && follower.lastName
                ? `${follower.firstName} ${follower.lastName}`
                : follower.username}
            </Text>
            <Text style={styles.followerUsername}>@{follower.username}</Text>
            {follower.city && (
              <Text style={styles.followerCity}>{follower.city}</Text>
            )}
          </View>
        </View>

        {!isCurrentUser && (
          <TouchableOpacity
            style={
              follower.isFollowing ? styles.unfollowButton : styles.followButton
            }
            onPress={(e) => {
              e.stopPropagation();
              handleToggleFollow(follower.id);
            }}
            disabled={toggleFollowMutation.isPending}
          >
            {toggleFollowMutation.isPending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>
                {follower.isFollowing ? "Unfollow" : "Follow"}
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
        <Ionicons name="people-outline" size={64} color={COLORS.grey} />
        <Text style={styles.emptyText}>No followers yet</Text>
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
          <Text style={styles.headerTitle}>{username}'s Followers</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Followers List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={followers}
            renderItem={renderFollowerItem}
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

export default GetUserFollowers;
