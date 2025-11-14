import { styles } from "../../styles/UsersLikedComment.styles";
import React, { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// React-Query && Context
import { useToggleFollowUser } from "../../store/users.slice";
import { useAuth } from "@/context/AuthContext";

// Types
interface UserLike {
  id: number;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    imgUrl: string | null;
    isFollowing: boolean;
  };
}

interface UsersLikedCommentProps {
  commentId: number;
  visible: boolean;
  onClose: () => void;
  likes: UserLike[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

const UsersLikedComment: React.FC<UsersLikedCommentProps> = ({
  commentId,
  visible,
  onClose,
  likes,
  isLoading,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
}) => {
  // React-Query && Context
  const { currentUser } = useAuth();
  const toggleFollowMutation = useToggleFollowUser();

  // Track which user button is being clicked
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null);

  // Track optimistic follow state changes
  const [optimisticFollowState, setOptimisticFollowState] = useState<
    Record<number, boolean>
  >({});

  // Merge server data with optimistic updates
  const displayLikes = useMemo(() => {
    return likes.map((like) => ({
      ...like,
      user: {
        ...like.user,
        isFollowing:
          optimisticFollowState[like.user.id] ?? like.user.isFollowing,
      },
    }));
  }, [likes, optimisticFollowState]);

  // Handle Follow/UnFollow
  const handleFollowToggle = async (
    userId: number,
    currentFollowState: boolean
  ) => {
    try {
      setLoadingUserId(userId);

      // Optimistically update UI immediately
      setOptimisticFollowState((prev) => ({
        ...prev,
        [userId]: !currentFollowState,
      }));

      // Make the API call
      await toggleFollowMutation.mutateAsync(userId);
    } catch (error) {
      console.error("Failed to toggle follow:", error);

      // Revert optimistic update on error
      setOptimisticFollowState((prev) => ({
        ...prev,
        [userId]: currentFollowState,
      }));
    } finally {
      setLoadingUserId(null);
    }
  };

  // Reset optimistic state when modal closes or likes change significantly
  React.useEffect(() => {
    if (!visible) {
      setOptimisticFollowState({});
    }
  }, [visible]);

  const renderUserItem = ({ item }: { item: UserLike }) => {
    const isCurrentUser = currentUser.id === item.user.id;
    const isLoadingThisUser = loadingUserId === item.user.id;

    return (
      <View style={styles.userItem}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri:
                item.user.imgUrl ||
                "https://img.icons8.com/?size=60&id=98957&format=png",
            }}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {item.user.firstName || "User"} {item.user.lastName || ""}
            </Text>
            <Text style={styles.username}>@{item.user.username}</Text>
          </View>
        </View>

        {/* Only show follow button if not current user */}
        {!isCurrentUser && (
          <TouchableOpacity
            onPress={() =>
              handleFollowToggle(item.user.id, item.user.isFollowing)
            }
            disabled={isLoadingThisUser}
            style={[
              styles.followButton,
              item.user.isFollowing && styles.followingButton,
            ]}
          >
            {isLoadingThisUser ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.followButtonText,
                  item.user.isFollowing && styles.followingButtonText,
                ]}
              >
                {item.user.isFollowing ? "Following" : "Follow"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4ADE80" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={64} color="#2A2A2A" />
      <Text style={styles.emptyText}>No likes yet</Text>
    </View>
  );

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage && onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Liked by</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Users List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ADE80" />
          </View>
        ) : (
          <FlatList
            data={displayLikes}
            keyExtractor={(item) => `like-${item.id}`}
            renderItem={renderUserItem}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContent}
            extraData={optimisticFollowState}
          />
        )}
      </View>
    </Modal>
  );
};

export default UsersLikedComment;
