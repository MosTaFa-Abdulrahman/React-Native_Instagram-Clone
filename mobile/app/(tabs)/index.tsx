import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../styles/home.styles";

// Icons & Constants
import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

// Components
import { Loader } from "@/components/global/Loader";
import Posts from "@/components/posts/Posts";
import Stories from "@/components/stories/Stories";

// Context & React-Query
import { useAuth } from "@/context/AuthContext";
import { useInfinitePosts } from "@/store/posts.slice";

export default function Home() {
  const { logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Handle Logout
  const handleLogout = async () => {
    try {
      logout();
      router.push("/(auth)/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // React-Query
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfinitePosts();

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

  // Flatten paginated data
  const posts = data?.pages.flatMap((page) => page.content) ?? [];

  // Loading state
  if (isLoading) return <Loader />;

  // Error state
  if (isError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Instagram</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)")}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.background,
          }}
        >
          <Text style={{ fontSize: 16, color: COLORS.error }}>
            Failed to load posts
          </Text>
        </View>
      </View>
    );
  }

  // Empty state
  if (posts.length === 0) return <NoPostsFound logout={logout} />;

  // Footer loading indicator
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
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Instagram</Text>
        <TouchableOpacity onPress={() => handleLogout()}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={({ item }) => <Posts post={item} />}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        ListHeaderComponent={<Stories />}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}

const NoPostsFound = ({ logout }: { logout: () => void }) => (
  <View style={{ flex: 1, backgroundColor: COLORS.background }}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>spotlight</Text>
      <TouchableOpacity onPress={() => logout()}>
        <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 20, color: COLORS.primary }}>No posts yet</Text>
    </View>
  </View>
);
