import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#262626",
  },
  listContainer: {
    paddingHorizontal: 8,
    gap: 12,
  },
  loaderContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  storyContainer: {
    alignItems: "center",
    marginHorizontal: 4,
    width: 70,
  },
  storyImageContainer: {
    position: "relative",
    marginBottom: 6,
  },
  storyBorder: {
    position: "absolute",
    width: 74,
    height: 74,
    borderRadius: 37,
    top: -3,
    left: -3,
    zIndex: 0,
  },
  storyImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: COLORS.background,
    zIndex: 1,
  },
  defaultAvatar: {
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  defaultAvatarText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
  },
  addIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.background,
    zIndex: 2,
  },
  storyUsername: {
    color: COLORS.white,
    fontSize: 12,
    textAlign: "center",
    maxWidth: 70,
  },
  uploadingContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingContent: {
    backgroundColor: COLORS.background,
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  uploadingText: {
    color: COLORS.white,
    fontSize: 16,
    marginTop: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.6,
  },
});
