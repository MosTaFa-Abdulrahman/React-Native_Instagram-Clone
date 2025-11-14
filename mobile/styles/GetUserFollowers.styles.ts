import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "@/constants/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 2,
    paddingBottom: SIZES.padding,
    backgroundColor: COLORS.darkGrey,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey + "30",
  },
  closeButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.white,
  },
  placeholder: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingVertical: SIZES.padding,
  },
  followerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey + "20",
  },
  followerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  followerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.grey,
  },
  followerDetails: {
    marginLeft: SIZES.padding,
    flex: 1,
  },
  followerName: {
    fontSize: SIZES.medium,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 2,
  },
  followerUsername: {
    fontSize: SIZES.small,
    color: COLORS.grey,
    marginBottom: 2,
  },
  followerCity: {
    fontSize: SIZES.small,
    color: COLORS.lightGrey,
  },
  followButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 1.5,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    minWidth: 90,
    alignItems: "center",
  },
  unfollowButton: {
    backgroundColor: COLORS.grey,
    paddingHorizontal: SIZES.padding * 1.5,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    minWidth: 90,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: "600",
  },
  loadingFooter: {
    paddingVertical: SIZES.padding,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SIZES.padding * 4,
  },
  emptyText: {
    fontSize: SIZES.medium,
    color: COLORS.grey,
    marginTop: SIZES.padding,
  },
});
