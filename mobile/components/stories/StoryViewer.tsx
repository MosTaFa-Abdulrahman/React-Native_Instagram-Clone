import { styles as storyViewerStyles } from "../../styles/storyViewer.styles";
import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

// Conditional imports
let Video: any;
let ResizeMode: any;
let AVPlaybackStatus: any;

if (Platform.OS !== "web") {
  const ExpoAV = require("expo-av");
  Video = ExpoAV.Video;
  ResizeMode = ExpoAV.ResizeMode;
  AVPlaybackStatus = ExpoAV.AVPlaybackStatus;
}

// Types
import { UserStories } from "@/types/stories.types";

// React-Query
import { useDeleteStory } from "@/store/stories.slice";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const STORY_DURATION = 5000; // 5 seconds per story

interface StoryViewerProps {
  userStories: UserStories;
  allUserStories: UserStories[];
  onClose: () => void;
  currentUserId: number;
}

export default function StoryViewer({
  userStories: initialUserStories,
  allUserStories,
  onClose,
  currentUserId,
}: StoryViewerProps) {
  const [currentUserIndex, setCurrentUserIndex] = useState(
    allUserStories.findIndex((u) => u.user.id === initialUserStories.user.id)
  );
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress] = useState(new Animated.Value(0));

  const deleteStoryMutation = useDeleteStory();
  const videoRef = useRef<any>(null);

  const currentUserStories = allUserStories[currentUserIndex];
  const currentStory = currentUserStories.stories[currentStoryIndex];
  const isMyStory = currentUserStories.user.id === currentUserId;

  // Check if media is video
  const isVideo =
    currentStory.mediaUrl.includes("video") ||
    currentStory.mediaUrl.endsWith(".mp4") ||
    currentStory.mediaUrl.endsWith(".mov");

  // Pan Responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        } else if (gestureState.dx > 100) {
          handlePreviousUser();
        } else if (gestureState.dx < -100) {
          handleNextUser();
        }
      },
    })
  ).current;

  // Progress Animation
  useEffect(() => {
    if (isPaused || isLoading || isVideo) return;

    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished) {
        handleNext();
      }
    });

    return () => {
      animation.stop();
    };
  }, [currentUserIndex, currentStoryIndex, isPaused, isLoading, isVideo]);

  // Handle Next Story
  const handleNext = () => {
    if (currentStoryIndex < currentUserStories.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setIsLoading(true);
    } else {
      handleNextUser();
    }
  };

  // Handle Previous Story
  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setIsLoading(true);
    } else {
      handlePreviousUser();
    }
  };

  // Handle Next User
  const handleNextUser = () => {
    if (currentUserIndex < allUserStories.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
      setCurrentStoryIndex(0);
      setIsLoading(true);
    } else {
      onClose();
    }
  };

  // Handle Previous User
  const handlePreviousUser = () => {
    if (currentUserIndex > 0) {
      setCurrentUserIndex(currentUserIndex - 1);
      setCurrentStoryIndex(0);
      setIsLoading(true);
    }
  };

  // Handle Delete Story
  const handleDeleteStory = () => {
    Alert.alert("Delete Story", "Are you sure you want to delete this story?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteStoryMutation.mutateAsync(currentStory.id);

            if (currentUserStories.stories.length === 1) {
              onClose();
            } else {
              if (currentStoryIndex === currentUserStories.stories.length - 1) {
                setCurrentStoryIndex(Math.max(0, currentStoryIndex - 1));
              } else {
                handleNext();
              }
            }
          } catch (error) {
            Alert.alert("Error", "Failed to delete story");
          }
        },
      },
    ]);
  };

  // Handle Video Status Update
  const handleVideoStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setIsLoading(false);
      if (status.didJustFinish) {
        handleNext();
      }
    }
  };

  // Handle Image Load
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Format time ago
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const storyDate = new Date(date);
    const diffInMs = now.getTime() - storyDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    }
    return `${diffInHours}h ago`;
  };

  // Get display name
  const displayName =
    currentUserStories.user.firstName && currentUserStories.user.lastName
      ? `${currentUserStories.user.firstName} ${currentUserStories.user.lastName}`
      : currentUserStories.user.username;

  // Render Video for Native
  const renderVideo = () => {
    if (Platform.OS === "web") {
      return (
        <video
          src={currentStory.mediaUrl}
          style={{
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            objectFit: "contain",
          }}
          autoPlay
          onLoadedData={() => setIsLoading(false)}
          onEnded={handleNext}
        />
      );
    }

    return (
      <Video
        ref={videoRef}
        source={{ uri: currentStory.mediaUrl }}
        style={storyViewerStyles.media}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={!isPaused}
        isLooping={false}
        onPlaybackStatusUpdate={handleVideoStatusUpdate}
      />
    );
  };

  return (
    <View style={storyViewerStyles.container} {...panResponder.panHandlers}>
      {/* Story Media */}
      {isVideo ? (
        renderVideo()
      ) : (
        <Image
          source={{ uri: currentStory.mediaUrl }}
          style={storyViewerStyles.media}
          resizeMode="contain"
          onLoad={handleImageLoad}
        />
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={storyViewerStyles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.white} />
        </View>
      )}

      {/* Progress Bars */}
      <View style={storyViewerStyles.progressContainer}>
        {currentUserStories.stories.map((_, index) => (
          <View key={index} style={storyViewerStyles.progressBarBackground}>
            <Animated.View
              style={[
                storyViewerStyles.progressBarFill,
                {
                  width:
                    index < currentStoryIndex
                      ? "100%"
                      : index === currentStoryIndex
                      ? progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"],
                        })
                      : "0%",
                },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Header */}
      <View style={storyViewerStyles.header}>
        <View style={storyViewerStyles.userInfo}>
          {currentUserStories.user.imgUrl ? (
            <Image
              source={{ uri: currentUserStories.user.imgUrl }}
              style={storyViewerStyles.avatar}
            />
          ) : (
            <View style={storyViewerStyles.defaultAvatar}>
              <Text style={storyViewerStyles.defaultAvatarText}>
                {currentUserStories.user.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <Text style={storyViewerStyles.username}>{displayName}</Text>
            <Text style={storyViewerStyles.timeAgo}>
              {formatTimeAgo(currentStory.createdDate)}
            </Text>
          </View>
        </View>

        <View style={storyViewerStyles.headerActions}>
          {isMyStory && (
            <TouchableOpacity
              onPress={handleDeleteStory}
              style={storyViewerStyles.iconButton}
            >
              <Ionicons name="trash-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onClose}
            style={storyViewerStyles.iconButton}
          >
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tap Areas for Navigation */}
      <View style={storyViewerStyles.tapAreaContainer}>
        <TouchableOpacity
          style={storyViewerStyles.tapAreaLeft}
          onPress={handlePrevious}
          onLongPress={() => setIsPaused(true)}
          onPressOut={() => setIsPaused(false)}
          activeOpacity={1}
        />
        <TouchableOpacity
          style={storyViewerStyles.tapAreaRight}
          onPress={handleNext}
          onLongPress={() => setIsPaused(true)}
          onPressOut={() => setIsPaused(false)}
          activeOpacity={1}
        />
      </View>
    </View>
  );
}
