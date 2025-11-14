import { styles } from "../../styles/Replies.styles";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Components
import Reply from "./Reply";

// React-Query
import {
  useInfiniteCommentReplies,
  useCreateReply,
} from "../../store/replies.slice";

interface RepliesSectionProps {
  commentId: number;
}

const Replies: React.FC<RepliesSectionProps> = ({ commentId }) => {
  const [replyText, setReplyText] = useState("");
  const [showInput, setShowInput] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteCommentReplies(commentId, true);

  const createReplyMutation = useCreateReply();

  const replies = data?.pages.flatMap((page) => page.content) || [];

  // Handle Create Reply
  const handleAddReply = async () => {
    if (!replyText.trim()) return;

    try {
      await createReplyMutation.mutateAsync({
        text: replyText,
        commentId,
      });
      setReplyText("");
      setShowInput(false);
    } catch (error) {
      console.error("Failed to add reply:", error);
    }
  };

  // Handle Load More Replies
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Add Reply Button */}
      {!showInput && (
        <TouchableOpacity
          onPress={() => setShowInput(true)}
          style={styles.addReplyButton}
        >
          <Ionicons name="return-down-forward" size={16} color="#007AFF" />
          <Text style={styles.addReplyText}>Reply</Text>
        </TouchableOpacity>
      )}

      {/* Reply Input */}
      {showInput && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Write a reply..."
            placeholderTextColor="#999"
            value={replyText}
            onChangeText={setReplyText}
            multiline
            maxLength={500}
            autoFocus
          />
          <View style={styles.inputActions}>
            <TouchableOpacity
              onPress={() => {
                setShowInput(false);
                setReplyText("");
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddReply}
              disabled={!replyText.trim() || createReplyMutation.isPending}
              style={[
                styles.sendButton,
                (!replyText.trim() || createReplyMutation.isPending) &&
                  styles.sendButtonDisabled,
              ]}
            >
              {createReplyMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>Reply</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Replies List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      ) : replies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No replies yet</Text>
        </View>
      ) : (
        <FlatList
          data={replies}
          keyExtractor={(item) => `reply-${item.id}`}
          renderItem={({ item }) => <Reply reply={item} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

export default Replies;
