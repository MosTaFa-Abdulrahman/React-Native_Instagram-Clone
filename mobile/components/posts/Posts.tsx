import { styles } from "@/styles/home.styles";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

// Icons & Constants
import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";

// Components
import CommentsModal from "../comments/CommentsModal";

// Types
import { Post as PostType } from "@/types/posts.types";

// Context & React-Query
import { useAuth } from "@/context/AuthContext";
import { useDeletePost, useToggleLikePost } from "@/store/posts.slice";
import { useToggleSavePost } from "@/store/saved-posts.slice";

interface PostProps {
  post: PostType;
}

// From (index.tsx) tab
function Posts({ post }: PostProps) {
  const { currentUser } = useAuth();
  const [showComments, setShowComments] = useState(false);

  // React-Query
  const deletePostMutation = useDeletePost();
  const likePostMutation = useToggleLikePost();
  const { toggleSave } = useToggleSavePost();

  // Local state for optimistic UI
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [isBookmarked, setIsBookmarked] = useState(post.isSaved ?? false);
  const [likesCount, setLikesCount] = useState(post._count?.likes ?? 0);

  // Handle Like
  const handleLike = () => {
    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    likePostMutation.mutate(post.id, {
      onError: () => {
        // Revert on error
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
      },
    });
  };

  // Handle Bookmark/Save
  const handleBookmark = () => {
    // Optimistic update
    setIsBookmarked(!isBookmarked);

    // API call
    toggleSave(post.id, isBookmarked);
  };

  // Handle Delete
  const handleDelete = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deletePostMutation.mutate(post.id);
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.post}>
      {/* POST HEADER */}
      <View style={styles.postHeader}>
        <Link
          href={
            currentUser?.id === post.userId
              ? "/(tabs)/profile"
              : `/user/${post.userId}`
          }
          asChild
        >
          <TouchableOpacity style={styles.postHeaderLeft}>
            <Image
              source={post.user?.imgUrl || "https://via.placeholder.com/150"}
              style={styles.postAvatar}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
            <Text style={styles.postUsername}>
              {post.user?.username || "Unknown User"}
            </Text>
          </TouchableOpacity>
        </Link>

        {/* If I'm the owner of the post, show the delete button */}
        {post.userId === currentUser?.id ? (
          <TouchableOpacity
            onPress={handleDelete}
            disabled={deletePostMutation.isPending}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={COLORS.white}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* IMAGE */}
      {post.imageUrl && (
        <Image
          source={post.imageUrl}
          style={styles.postImage}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
      )}

      {/* POST ACTIONS */}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity
            onPress={handleLike}
            disabled={likePostMutation.isPending}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? COLORS.primary : COLORS.white}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Ionicons
              name="chatbubble-outline"
              size={22}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleBookmark}>
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={22}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>

      {/* POST INFO */}
      <View style={styles.postInfo}>
        <Text style={styles.likesText}>
          {likesCount > 0
            ? `${likesCount.toLocaleString()} likes`
            : "Be the first to like"}
        </Text>

        {post.description && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>
              {post.user?.username || "Unknown"}
            </Text>
            <Text style={styles.captionText}>{post.description}</Text>
          </View>
        )}

        {(post._count?.comments ?? 0) > 0 && (
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Text style={styles.commentsText}>
              View all {post._count?.comments} comments
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.timeAgo}>{moment(post.createdDate).fromNow()}</Text>
      </View>

      <CommentsModal
        postId={post.id}
        visible={showComments}
        onClose={() => setShowComments(false)}
      />
    </View>
  );
}

export default Posts;
