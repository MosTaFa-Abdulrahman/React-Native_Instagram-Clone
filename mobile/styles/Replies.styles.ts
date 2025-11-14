import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

export const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginLeft: 52,
  },
  addReplyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  addReplyText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
    marginLeft: 6,
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  input: {
    minHeight: 60,
    maxHeight: 120,
    fontSize: 14,
    color: COLORS.white,
    textAlignVertical: "top",
  },
  inputActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: COLORS.grey,
    fontWeight: "500",
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.surfaceLight,
  },
  sendButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.grey,
  },
  footerLoader: {
    paddingVertical: 12,
    alignItems: "center",
  },
});
