import { styles } from "../../styles/Reply.styles";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";

// Components
import EditCommentInput from "../comments/EditCommentInput";
import UsersLikedReply from "./UsersLikedReply";

// Types
import { Reply as ReplyType } from "../../types/replies.types";

// React-Query
import {
  useUpdateReply,
  useDeleteReply,
  useToggleLikeReply,
  useReplyLikes,
} from "../../store/replies.slice";

interface ReplyItemProps {
  reply: ReplyType;
}

const Reply: React.FC<ReplyItemProps> = ({ reply }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);

  const updateReplyMutation = useUpdateReply();
  const deleteReplyMutation = useDeleteReply();
  const toggleLikeMutation = useToggleLikeReply();

  // Fetch likes when modal opens
  const {
    data: likesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingLikes,
  } = useReplyLikes(reply.id, showLikesModal);

  const likes = likesData?.pages.flatMap((page) => page.content) || [];

  const handleLike = async () => {
    try {
      await toggleLikeMutation.mutateAsync(reply.id);
    } catch (error) {
      console.error("Failed to like reply:", error);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Reply", "Are you sure you want to delete this reply?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReplyMutation.mutateAsync(reply.id);
          } catch (error) {
            console.error("Failed to delete reply:", error);
          }
        },
      },
    ]);
  };

  const handleUpdate = async (text: string) => {
    try {
      await updateReplyMutation.mutateAsync({
        replyId: reply.id,
        text,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update reply:", error);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(reply.createdDate), {
    addSuffix: true,
  });

  return (
    <View style={styles.container}>
      <View style={styles.replyContent}>
        {/* User Avatar */}
        <Image
          source={{
            uri:
              reply.user?.imgUrl ||
              "https://img.icons8.com/?size=60&id=98957&format=png",
          }}
          style={styles.avatar}
        />

        <View style={styles.contentRight}>
          {/* User Info & Text */}
          <View style={styles.textContainer}>
            <View style={styles.userInfo}>
              <Text style={styles.username}>
                {reply.user?.firstName} {reply.user?.lastName}
              </Text>
              <Text style={styles.timeAgo}>{timeAgo}</Text>
            </View>

            {isEditing ? (
              <EditCommentInput
                initialText={reply.text}
                onSave={handleUpdate}
                onCancel={() => setIsEditing(false)}
                isLoading={updateReplyMutation.isPending}
              />
            ) : (
              <Text style={styles.replyText}>{reply.text}</Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleLike}
              style={styles.actionButton}
              disabled={toggleLikeMutation.isPending}
            >
              <Ionicons
                name={reply.isLiked ? "heart" : "heart-outline"}
                size={16}
                color={reply.isLiked ? "#FF3B30" : "#666"}
              />
              {reply._count && reply._count.likes > 0 && (
                <TouchableOpacity onPress={() => setShowLikesModal(true)}>
                  <Text style={styles.actionText}>{reply._count.likes}</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={styles.actionButton}
            >
              <Ionicons name="create-outline" size={14} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              style={styles.actionButton}
              disabled={deleteReplyMutation.isPending}
            >
              {deleteReplyMutation.isPending ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <Ionicons name="trash-outline" size={14} color="#FF3B30" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Users Liked Modal */}
      <UsersLikedReply
        replyId={reply.id}
        visible={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        likes={likes}
        isLoading={isLoadingLikes}
        onLoadMore={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </View>
  );
};

export default Reply;
