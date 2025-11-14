import { styles } from "@/styles/create-post.styles";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Constants && File
import { COLORS } from "@/constants/theme";
import upload from "@/upload";

// Image
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

// Context & React-Query
import { useAuth } from "@/context/AuthContext";
import { useCreatePost } from "@/store/posts.slice";

export default function CreatePost() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { mutate: createPost, isPending } = useCreatePost();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleShare = async () => {
    if (!selectedImage) {
      Alert.alert("Error", "Please select an image");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Please write a description");
      return;
    }

    if (!currentUser?.id) {
      Alert.alert("Error", "You must be logged in to create a post");
      return;
    }

    try {
      setIsUploading(true);

      // Create a File-like object for React Native
      const fileToUpload = {
        uri: selectedImage,
        type: "image/jpeg",
        name: "post-image.jpg",
      };

      // Upload to Cloudinary using your upload function
      const imageUrl = await upload(fileToUpload as any);

      if (!imageUrl) {
        throw new Error("Failed to upload image");
      }

      // Create post with React Query
      createPost(
        {
          title: description.trim().substring(0, 100), // Use first 100 chars as title
          description: description.trim(),
          imageUrl,
        },
        {
          onSuccess: () => {
            // Reset form
            setSelectedImage(null);
            setDescription("");

            Alert.alert("Success", "Post created successfully!");

            // Navigate back to feed
            router.push("/(tabs)");
          },
          onError: (error: any) => {
            console.error("Error creating post:", error);
            Alert.alert("Error", "Failed to create post. Please try again.");
          },
        }
      );
    } catch (error) {
      console.log("Error sharing post:", error);
      Alert.alert("Error", "Failed to share post. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = isUploading || isPending;
  const canShare = selectedImage && description.trim().length > 0 && !isLoading;

  // Show image picker screen
  if (!selectedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <View style={{ width: 28 }} />
        </View>

        <TouchableOpacity
          style={styles.emptyImageContainer}
          onPress={pickImage}
        >
          <Ionicons name="image-outline" size={48} color={COLORS.grey} />
          <Text style={styles.emptyImageText}>Tap to select an image</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show preview and caption screen
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.contentContainer}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setSelectedImage(null);
              setDescription("");
            }}
            disabled={isLoading}
          >
            <Ionicons
              name="close-outline"
              size={28}
              color={isLoading ? COLORS.grey : COLORS.white}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <TouchableOpacity
            style={[
              styles.shareButton,
              !canShare && styles.shareButtonDisabled,
            ]}
            disabled={!canShare}
            onPress={handleShare}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text
                style={[
                  styles.shareText,
                  !canShare && styles.shareTextDisabled,
                ]}
              >
                Share
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>
                {isUploading ? "Uploading image..." : "Creating post..."}
              </Text>
            </View>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isLoading}
        >
          <View style={[styles.content, isLoading && styles.contentDisabled]}>
            {/* IMAGE SECTION */}
            <View style={styles.imageSection}>
              <Image
                source={selectedImage}
                style={styles.previewImage}
                contentFit="cover"
                transition={200}
              />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={pickImage}
                disabled={isLoading}
              >
                <Ionicons name="image-outline" size={20} color={COLORS.white} />
                <Text style={styles.changeImageText}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* INPUT SECTION */}
            <View style={styles.inputSection}>
              <View style={styles.captionContainer}>
                <Image
                  source={
                    currentUser?.imgUrl || "https://via.placeholder.com/40"
                  }
                  style={styles.userAvatar}
                  contentFit="cover"
                  transition={200}
                />
                <TextInput
                  style={styles.captionInput}
                  placeholder="Write a description..."
                  placeholderTextColor={COLORS.grey}
                  multiline
                  value={description}
                  onChangeText={setDescription}
                  editable={!isLoading}
                  maxLength={2200}
                />
              </View>
              <View style={styles.charCountContainer}>
                {description.length > 0 && (
                  <Text style={styles.charCount}>
                    {description.length}/2200
                  </Text>
                )}
                {description.trim().length === 0 && selectedImage && (
                  <Text style={styles.validationText}>
                    * Description is required
                  </Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
