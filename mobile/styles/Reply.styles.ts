import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

export const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    backgroundColor: COLORS.background,
  },
  replyContent: {
    flexDirection: "row",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
  },
  contentRight: {
    flex: 1,
    marginLeft: 10,
  },
  textContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  username: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.white,
  },
  timeAgo: {
    fontSize: 11,
    color: COLORS.grey,
    marginLeft: 6,
  },
  replyText: {
    fontSize: 14,
    color: COLORS.white,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
    padding: 4,
  },
  actionText: {
    fontSize: 12,
    color: COLORS.grey,
    marginLeft: 4,
  },
});
