import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  commentContent: {
    flexDirection: "row",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
  },
  contentRight: {
    flex: 1,
    marginLeft: 12,
  },
  textContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
  timeAgo: {
    fontSize: 12,
    color: COLORS.grey,
    marginLeft: 8,
  },
  commentText: {
    fontSize: 15,
    color: COLORS.white,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    padding: 4,
  },
  actionText: {
    fontSize: 13,
    color: COLORS.grey,
    marginLeft: 4,
  },
});
