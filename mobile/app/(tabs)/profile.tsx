import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";

// Styles & Constants & Utils
import { styles } from "@/styles/Profile.styles";
import { COLORS } from "@/constants/theme";
import upload from "@/upload";

// Components
import GetUserFollowers from "@/components/profile/GetUserFollowers";
import GetUserFollowings from "@/components/profile/GetUserFollowings";

// Context & React-Query
import { useAuth } from "@/context/AuthContext";
import { useInfiniteUserPosts } from "@/store/posts.slice";
import {
  useUserProfile,
  useUpdateUserProfile,
  useToggleFollowUser,
} from "@/store/users.slice";

// Types
interface UpdateData {
  firstName?: string;
  lastName?: string;
  imgUrl?: string;
  city?: string;
}

function Profile() {
  const { currentUser } = useAuth();
  const params = useLocalSearchParams();

  // If userId param exists, use it; otherwise use currentUser's id
  const userId = params.userId ? Number(params.userId) : currentUser?.id || 0;
  const isOwnProfile = userId === currentUser?.id;

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [formData, setFormData] = useState<UpdateData>({
    firstName: "",
    lastName: "",
    imgUrl: "",
    city: "",
  });

  // React-Query - Fetch user profile (works for any user)
  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useUserProfile(userId);

  const updateProfileMutation = useUpdateUserProfile();
  const toggleFollowMutation = useToggleFollowUser();

  // Fetch posts for the specific user (always fetch user's posts, not all posts)
  const {
    data: postsData,
    isLoading: postsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchPosts,
  } = useInfiniteUserPosts(userId, !!userId);

  const user = profileData?.user;
  const posts = postsData?.pages.flatMap((page) => page.content) || [];

  // Initialize form data when user data loads
  useEffect(() => {
    if (user && isOwnProfile) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        imgUrl: user.imgUrl || "",
        city: user.city || "",
      });
    }
  }, [user, isOwnProfile]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchPosts()]);
    setRefreshing(false);
  };

  // Handle load more posts
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Handle image selection
  const handleSelectImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera roll permissions"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        try {
          const uri = result.assets[0].uri;
          const file = {
            uri,
            type: "image/jpeg",
            name: "profile.jpg",
          };

          const uploadedUrl = await upload(file);
          if (uploadedUrl) {
            setFormData((prev) => ({ ...prev, imgUrl: uploadedUrl }));
          }
        } catch (error) {
          Alert.alert("Upload failed", "Failed to upload image");
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync(formData);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
      refetchProfile();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    }
  };

  // Handle follow/unfollow
  const handleToggleFollow = async () => {
    try {
      await toggleFollowMutation.mutateAsync(userId);
      refetchProfile();
    } catch (error) {
      Alert.alert("Error", "Failed to update follow status");
    }
  };

  // Loading state
  if (profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Error state
  if (profileError || !user) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetchProfile()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render post item
  const renderPostItem = ({ item }: any) => (
    <View style={styles.postItem}>
      <Image
        source={item.imageUrl || "https://via.placeholder.com/300"}
        style={styles.postImage}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
    </View>
  );

  // Render footer
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.scrollContent}
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
        ListHeaderComponent={
          <>
            {/* Profile Header */}
            <View style={styles.header}>
              {/* Profile Image */}
              <View style={styles.profileImageContainer}>
                <Image
                  source={
                    isEditing && formData.imgUrl
                      ? formData.imgUrl
                      : user.imgUrl || "https://via.placeholder.com/100"
                  }
                  style={styles.profileImage}
                  contentFit="cover"
                  transition={200}
                />
                {isEditing && (
                  <TouchableOpacity
                    style={styles.editImageButton}
                    onPress={handleSelectImage}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Ionicons name="camera" size={16} color={COLORS.white} />
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Username */}
              <Text style={styles.username}>@{user.username}</Text>

              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {user._count?.posts || 0}
                  </Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>

                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => setShowFollowersModal(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.statNumber}>
                    {user._count?.followers || 0}
                  </Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => setShowFollowingModal(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.statNumber}>
                    {user._count?.following || 0}
                  </Text>
                  <Text style={styles.statLabel}>Following</Text>
                </TouchableOpacity>
              </View>

              {/* User Info */}
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>First Name:</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.infoInput}
                      value={formData.firstName}
                      onChangeText={(text) =>
                        setFormData((prev) => ({ ...prev, firstName: text }))
                      }
                      placeholder="Enter first name"
                      placeholderTextColor={COLORS.grey}
                    />
                  ) : (
                    <Text style={styles.infoValue}>
                      {user.firstName || "Not set"}
                    </Text>
                  )}
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Last Name:</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.infoInput}
                      value={formData.lastName}
                      onChangeText={(text) =>
                        setFormData((prev) => ({ ...prev, lastName: text }))
                      }
                      placeholder="Enter last name"
                      placeholderTextColor={COLORS.grey}
                    />
                  ) : (
                    <Text style={styles.infoValue}>
                      {user.lastName || "Not set"}
                    </Text>
                  )}
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>City:</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.infoInput}
                      value={formData.city}
                      onChangeText={(text) =>
                        setFormData((prev) => ({ ...prev, city: text }))
                      }
                      placeholder="Enter city"
                      placeholderTextColor={COLORS.grey}
                    />
                  ) : (
                    <Text style={styles.infoValue}>
                      {user.city || "Not set"}
                    </Text>
                  )}
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              {isOwnProfile ? (
                <View style={styles.actionButtons}>
                  {isEditing ? (
                    <>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                          setIsEditing(false);
                          setFormData({
                            firstName: user.firstName || "",
                            lastName: user.lastName || "",
                            imgUrl: user.imgUrl || "",
                            city: user.city || "",
                          });
                        }}
                      >
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <ActivityIndicator
                            size="small"
                            color={COLORS.white}
                          />
                        ) : (
                          <Text style={styles.buttonText}>Save</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => setIsEditing(true)}
                    >
                      <Text style={styles.buttonText}>Edit Profile</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  style={
                    user.isFollowing
                      ? styles.unfollowButton
                      : styles.followButton
                  }
                  onPress={handleToggleFollow}
                  disabled={toggleFollowMutation.isPending}
                >
                  {toggleFollowMutation.isPending ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.buttonText}>
                      {user.isFollowing ? "Unfollow" : "Follow"}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Posts Section Header */}
            <View style={styles.postsSectionHeader}>
              <Text style={styles.postsSectionTitle}>
                {isOwnProfile ? "My Posts" : `${user.username}'s Posts`}
              </Text>
              <Ionicons name="grid-outline" size={24} color={COLORS.white} />
            </View>

            {/* Empty Posts State */}
            {posts.length === 0 && !postsLoading && (
              <View style={styles.emptyPostsContainer}>
                <Ionicons name="images-outline" size={64} color={COLORS.grey} />
                <Text style={styles.emptyPostsText}>
                  {isOwnProfile ? "No posts yet" : "This user has no posts"}
                </Text>
              </View>
            )}
          </>
        }
      />

      {/* Followers Modal */}
      <GetUserFollowers
        visible={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        userId={userId}
        username={user?.username || ""}
      />

      {/* Followings Modal */}
      <GetUserFollowings
        visible={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        userId={userId}
        username={user?.username || ""}
      />
    </View>
  );
}

export default Profile;
