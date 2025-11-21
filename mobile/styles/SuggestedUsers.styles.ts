import { StyleSheet } from "react-native";
import { COLORS, SIZES, SPACING, SHADOWS } from "@/constants/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: SIZES.body,
    color: COLORS.grey,
  },

  // List
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  // User Card
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMedium,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },

  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.md,
  },

  // Avatar
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: SIZES.avatarLarge,
    height: SIZES.avatarLarge,
    borderRadius: SIZES.avatarLarge / 2,
    backgroundColor: COLORS.surfaceLight,
  },
  avatarPlaceholder: {
    width: SIZES.avatarLarge,
    height: SIZES.avatarLarge,
    borderRadius: SIZES.avatarLarge / 2,
    backgroundColor: COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },

  // User Details
  userDetails: {
    flex: 1,
  },
  name: {
    fontSize: SIZES.medium,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 2,
  },
  username: {
    fontSize: SIZES.body,
    color: COLORS.grey,
    marginBottom: SPACING.xs,
  },
  bio: {
    fontSize: SIZES.caption,
    color: COLORS.lightGrey,
    marginBottom: SPACING.xs,
    lineHeight: 16,
  },
  followers: {
    fontSize: SIZES.caption,
    color: COLORS.grey,
  },

  // Follow Button
  followButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.primary,
    minWidth: 100,
    alignItems: "center",
  },
  followingButton: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  followButtonText: {
    fontSize: SIZES.body,
    fontWeight: "600",
    color: COLORS.background,
  },
  followingButtonText: {
    color: COLORS.primary,
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: SIZES.medium,
    color: COLORS.grey,
  },
  footerLoader: {
    paddingVertical: SPACING.lg,
    alignItems: "center",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: SPACING.xxl * 2,
  },
  emptyTitle: {
    fontSize: SIZES.h4,
    fontWeight: "700",
    color: COLORS.white,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: SIZES.body,
    color: COLORS.grey,
    textAlign: "center",
    paddingHorizontal: SPACING.xl,
  },
});
