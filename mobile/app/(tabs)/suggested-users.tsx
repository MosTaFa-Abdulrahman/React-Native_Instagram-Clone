import { styles } from "@/styles/SuggestedUsers.styles";
import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import * as Haptics from "expo-haptics";

// React-Query
import {
  useInfiniteSuggestedUsers,
  useToggleFollowUser,
} from "@/store/users.slice";

// Types
import { User } from "@/types/users.types";

export default function SuggestedUsers() {
  const [followingStates, setFollowingStates] = useState<{
    [key: number]: boolean;
  }>({});

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteSuggestedUsers({ size: 15 });

  const toggleFollowMutation = useToggleFollowUser();

  // Flatten paginated data
  const suggestedUsers =
    data?.pages.flatMap((page) => page.content || []) || [];

  const handleFollow = async (userId: number, currentFollowState: boolean) => {
    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Optimistic UI update
      setFollowingStates((prev) => ({
        ...prev,
        [userId]: !currentFollowState,
      }));

      await toggleFollowMutation.mutateAsync(userId);
    } catch (error) {
      // Revert on error
      setFollowingStates((prev) => ({
        ...prev,
        [userId]: currentFollowState,
      }));
      console.error("Follow toggle error:", error);
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderUser = ({ item }: { item: User }) => {
    const isFollowing = followingStates[item.id] ?? item.isFollowing;

    return (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {item.imgUrl ? (
              <Image
                source={{ uri: item.imgUrl }}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={28} color={COLORS.grey} />
              </View>
            )}
          </View>

          {/* User Details */}
          <View style={styles.userDetails}>
            <Text style={styles.name} numberOfLines={1}>
              {item.firstName}
            </Text>
            <Text style={styles.username} numberOfLines={1}>
              @{item.username}
            </Text>
            {item?._count?.followers !== undefined && (
              <Text style={styles.followers}>
                {item?._count?.followers} followers
              </Text>
            )}
          </View>
        </View>

        {/* Follow Button */}
        <TouchableOpacity
          style={[styles.followButton, isFollowing && styles.followingButton]}
          onPress={() => handleFollow(item.id, isFollowing)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.followButtonText,
              isFollowing && styles.followingButtonText,
            ]}
          >
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color={COLORS.grey} />
        <Text style={styles.emptyTitle}>No Suggestions</Text>
        <Text style={styles.emptySubtitle}>
          Check back later for new users to follow
        </Text>
      </View>
    );
  };

  if (isLoading && !suggestedUsers.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Finding amazing people...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Suggested for You</Text>
        <Text style={styles.headerSubtitle}>
          People you might want to follow
        </Text>
      </View>

      {/* Users List */}
      <FlatList
        data={suggestedUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />
    </View>
  );
}
