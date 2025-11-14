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

// Styles & Constants
import { styles } from "@/styles/BookMarks.styles";
import { COLORS } from "@/constants/theme";

// Context & React-Query
import { useAuth } from "@/context/AuthContext";
import { useInfiniteMySavedPosts } from "@/store/saved-posts.slice";
import { useToggleSavePost } from "@/store/saved-posts.slice";

// Types
import { SavedPost } from "@/types/saved-posts.types";

function BookMarks() {
  const { currentUser } = useAuth();
  const { toggleSave } = useToggleSavePost();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch saved posts with infinite scroll
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteMySavedPosts(currentUser?.id || 0, !!currentUser);

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

  // Handle unsave post
  const handleUnsavePost = (postId: number) => {
    toggleSave(postId, true);
  };

  // Flatten paginated data
  const savedPosts = data?.pages.flatMap((page) => page.content) || [];

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.emptyText}>Loading saved posts...</Text>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>
          {error?.message || "Failed to load saved posts"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state
  if (savedPosts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bookmark-outline" size={64} color={COLORS.grey} />
        <Text style={styles.emptyText}>
          No saved posts yet. Start bookmarking posts you love!
        </Text>
      </View>
    );
  }

  // Render saved post item
  const renderItem = ({ item }: { item: SavedPost }) => {
    // Handle both data structures: nested post or flattened
    const post = item.post || item;
    const postId = post.id || item.id;
    const imageUrl = post.imageUrl || item.imageUrl;

    if (!imageUrl) return null;

    return (
      <View style={styles.gridItem}>
        <Image
          source={imageUrl || "https://via.placeholder.com/300"}
          style={styles.postImage}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={() => handleUnsavePost(postId)}
        >
          <Ionicons name="bookmark" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  // Footer component for loading more
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={savedPosts}
        renderItem={renderItem}
        keyExtractor={(item) => (item.savedPostId || item.id).toString()}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />
    </View>
  );
}

export default BookMarks;
