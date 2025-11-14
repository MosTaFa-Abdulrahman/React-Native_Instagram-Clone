import { styles } from "../../styles/EditCommentInput.styles";
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";

interface EditCommentInputProps {
  initialText: string;
  onSave: (text: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const EditCommentInput: React.FC<EditCommentInputProps> = ({
  initialText,
  onSave,
  onCancel,
  isLoading,
}) => {
  const [text, setText] = useState(initialText);

  const handleSave = () => {
    if (text.trim()) {
      onSave(text);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        multiline
        maxLength={500}
        autoFocus
      />
      <View style={styles.actions}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!text.trim() || isLoading}
          style={[
            styles.saveButton,
            (!text.trim() || isLoading) && styles.saveButtonDisabled,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditCommentInput;
