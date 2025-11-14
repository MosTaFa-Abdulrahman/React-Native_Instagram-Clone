import { styles } from "../../styles/Comment.styles";
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
import moment from "moment";

// Components
import EditCommentInput from "./EditCommentInput";
import Replies from "../replies/Replies";
import UsersLikedComment from "./UsersLikedComment";

// Types
import { Comment as CommentType } from "@/types/comments.types";

// React-Query && Context
import { useAuth } from "@/context/AuthContext";
import {
  useUpdateComment,
  useDeleteComment,
  useToggleLikeComment,
  useCommentLikes,
} from "../../store/comments.slice";

interface CommentItemProps {
  comment: CommentType;
}

const Comment: React.FC<CommentItemProps> = ({ comment }) => {
  const { currentUser } = useAuth();

  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);

  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const toggleLikeMutation = useToggleLikeComment();

  // Fetch likes when modal opens
  const {
    data: likesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingLikes,
  } = useCommentLikes(comment.id, showLikesModal);

  const likes = likesData?.pages.flatMap((page) => page.content) || [];

  //   Handle Like/disLike Comment
  const handleLike = async () => {
    try {
      await toggleLikeMutation.mutateAsync(comment.id);
    } catch (error) {
      console.error("Failed to like comment:", error);
    }
  };

  //   Handle Delete Comment
  const handleDelete = () => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCommentMutation.mutateAsync(comment.id);
            } catch (error) {
              console.error("Failed to delete comment:", error);
            }
          },
        },
      ]
    );
  };

  //   Handle Update Comment
  const handleUpdate = async (text: string) => {
    try {
      await updateCommentMutation.mutateAsync({
        commentId: comment.id,
        text,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.commentContent}>
        {/* User Avatar */}
        <Image
          source={{
            uri:
              comment.user?.imgUrl ||
              "https://img.icons8.com/?size=60&id=98957&format=png",
          }}
          style={styles.avatar}
        />

        <View style={styles.contentRight}>
          {/* User Info & Text */}
          <View style={styles.textContainer}>
            <View style={styles.userInfo}>
              <Text style={styles.username}>
                {comment.user?.firstName} {comment.user?.lastName}
              </Text>
              <Text style={styles.timeAgo}>
                {moment(comment.createdDate).fromNow()}
              </Text>
            </View>

            {isEditing ? (
              <EditCommentInput
                initialText={comment.text}
                onSave={handleUpdate}
                onCancel={() => setIsEditing(false)}
                isLoading={updateCommentMutation.isPending}
              />
            ) : (
              <Text style={styles.commentText}>{comment.text}</Text>
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
                name={comment.isLiked ? "heart" : "heart-outline"}
                size={18}
                color={comment.isLiked ? "#FF3B30" : "#666"}
              />
              {comment._count && comment._count.likes > 0 && (
                <TouchableOpacity onPress={() => setShowLikesModal(true)}>
                  <Text style={styles.actionText}>{comment._count.likes}</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowReplies(!showReplies)}
              style={styles.actionButton}
            >
              <Ionicons name="chatbubble-outline" size={16} color="#666" />
              {comment._count && comment._count.replies > 0 && (
                <Text style={styles.actionText}>{comment._count.replies}</Text>
              )}
            </TouchableOpacity>

            {currentUser.id === comment.userId && (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={styles.actionButton}
              >
                <Ionicons name="create-outline" size={16} color="#666" />
              </TouchableOpacity>
            )}

            {currentUser.id === comment.userId && (
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.actionButton}
                disabled={deleteCommentMutation.isPending}
              >
                {deleteCommentMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FF3B30" />
                ) : (
                  <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Replies Section */}
      {showReplies && <Replies commentId={comment.id} />}

      {/* Users Liked Modal */}
      <UsersLikedComment
        commentId={comment.id}
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

export default Comment;
