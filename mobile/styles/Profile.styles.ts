import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "@/constants/theme";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    padding: 16,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: 6,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    color: COLORS.grey,
    fontSize: 14,
    marginTop: 4,
  },
  infoContainer: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    color: COLORS.grey,
    fontSize: 14,
    width: 100,
  },
  infoValue: {
    color: COLORS.white,
    fontSize: 16,
    flex: 1,
  },
  infoInput: {
    color: COLORS.white,
    fontSize: 16,
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingVertical: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  postsSection: {
    marginTop: 8,
  },
  postsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
  postsSectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  postsGrid: {
    padding: 4,
  },
  postItem: {
    width: (width - 16) / 3,
    aspectRatio: 1,
    padding: 2,
  },
  postImage: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  emptyPostsContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyPostsText: {
    color: COLORS.grey,
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  followButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  unfollowButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  username: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
});
