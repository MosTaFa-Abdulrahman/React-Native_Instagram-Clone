import { styles as storiesStyles } from "../../styles/stories.style";
import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { COLORS } from "@/constants/theme";

// Components
import StoryViewer from "./StoryViewer";
import { Loader } from "@/components/global/Loader";

// Context & Hooks
import { useAuth } from "@/context/AuthContext";
import {
  useFollowingStories,
  useCreateStory,
  useMyStories,
} from "@/store/stories.slice";
import upload from "@/upload";

interface Story {
  id: number;
  mediaUrl: string;
  expiredAt: string;
  createdDate: string;
}

interface UserWithStories {
  user: {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
    imgUrl: string | null;
  };
  stories: Story[];
}

export default function Stories() {
  const { currentUser: user } = useAuth();

  // States
  const [selectedUserStories, setSelectedUserStories] =
    useState<UserWithStories | null>(null);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  // React Query
  const { data: followingStories, isLoading, refetch } = useFollowingStories();
  const { data: myStoriesData } = useMyStories(user?.id || 0);
  const createStoryMutation = useCreateStory();

  // Handle Add Story
  const handleAddStory = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need camera roll permissions to upload stories."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);

        // Prepare file for upload
        const asset = result.assets[0];
        const file = {
          uri: asset.uri,
          type: asset.type === "video" ? "video/mp4" : "image/jpeg",
          name: `story-${Date.now()}.${asset.type === "video" ? "mp4" : "jpg"}`,
        };

        try {
          // Upload to Cloudinary
          const mediaUrl = await upload(file);

          if (mediaUrl) {
            // Create story
            await createStoryMutation.mutateAsync({
              mediaUrl,
            });

            Alert.alert("Success", "Story uploaded successfully!");
            refetch();
          }
        } catch (error) {
          console.error("Upload error:", error);
          Alert.alert("Error", "Failed to upload story. Please try again.");
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error("Add story error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
      setUploading(false);
    }
  };

  // Handle Story Press
  const handleStoryPress = (userStories: UserWithStories) => {
    setSelectedUserStories(userStories);
    setIsViewerVisible(true);
  };

  // Close Story Viewer
  const handleCloseViewer = () => {
    setIsViewerVisible(false);
    setSelectedUserStories(null);
  };

  // Render Add Story Button
  const renderAddStory = () => {
    const hasMyStories = myStoriesData && myStoriesData?.stories?.length > 0;

    return (
      <TouchableOpacity
        style={storiesStyles.storyContainer}
        onPress={
          hasMyStories
            ? () =>
                handleStoryPress({
                  user: myStoriesData.user,
                  stories: myStoriesData.stories,
                })
            : handleAddStory
        }
        disabled={uploading}
      >
        <View style={storiesStyles.storyImageContainer}>
          {user?.imgUrl ? (
            <Image
              source={{ uri: user.imgUrl }}
              style={storiesStyles.storyImage}
            />
          ) : (
            <View
              style={[storiesStyles.storyImage, storiesStyles.defaultAvatar]}
            >
              <Text style={storiesStyles.defaultAvatarText}>
                {user?.username?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {!hasMyStories && (
            <View style={storiesStyles.addIconContainer}>
              <Ionicons name="add" size={20} color={COLORS.white} />
            </View>
          )}

          {hasMyStories && (
            <LinearGradient
              colors={["#f09433", "#e6683c", "#dc2743", "#cc2366", "#bc1888"]}
              style={storiesStyles.storyBorder}
            />
          )}
        </View>
        <Text style={storiesStyles.storyUsername} numberOfLines={1}>
          {hasMyStories ? "Your Story" : "Add Story"}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render Story Item
  const renderStoryItem = ({ item }: { item: UserWithStories }) => {
    const displayName =
      item.user.firstName && item.user.lastName
        ? `${item.user.firstName} ${item.user.lastName}`
        : item.user.username;

    return (
      <TouchableOpacity
        style={storiesStyles.storyContainer}
        onPress={() => handleStoryPress(item)}
      >
        <View style={storiesStyles.storyImageContainer}>
          <LinearGradient
            colors={["#f09433", "#e6683c", "#dc2743", "#cc2366", "#bc1888"]}
            style={storiesStyles.storyBorder}
          />
          {item.user.imgUrl ? (
            <Image
              source={{ uri: item.user.imgUrl }}
              style={storiesStyles.storyImage}
            />
          ) : (
            <View
              style={[storiesStyles.storyImage, storiesStyles.defaultAvatar]}
            >
              <Text style={storiesStyles.defaultAvatarText}>
                {item.user.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text style={storiesStyles.storyUsername} numberOfLines={1}>
          {displayName}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={storiesStyles.loaderContainer}>
        <Loader />
      </View>
    );
  }

  return (
    <>
      <View style={storiesStyles.container}>
        <FlatList
          data={followingStories || []}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.user.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListHeaderComponent={renderAddStory}
          contentContainerStyle={storiesStyles.listContainer}
        />
      </View>

      {/* Story Viewer Modal */}
      {selectedUserStories && (
        <Modal
          visible={isViewerVisible}
          animationType="slide"
          onRequestClose={handleCloseViewer}
        >
          <StoryViewer
            userStories={selectedUserStories}
            allUserStories={followingStories || []}
            onClose={handleCloseViewer}
            currentUserId={user?.id || 0}
          />
        </Modal>
      )}

      {/* Uploading Indicator */}
      {uploading && (
        <Modal transparent visible={uploading}>
          <View style={storiesStyles.uploadingContainer}>
            <View style={storiesStyles.uploadingContent}>
              <Loader />
              <Text style={storiesStyles.uploadingText}>
                Uploading story...
              </Text>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}
