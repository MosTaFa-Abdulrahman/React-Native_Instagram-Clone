import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

export const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  input: {
    minHeight: 60,
    maxHeight: 120,
    fontSize: 14,
    color: COLORS.white,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: COLORS.grey,
    fontWeight: "500",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.surfaceLight,
  },
  saveButtonText: {
    fontSize: 14,
    color: COLORS.background,
    fontWeight: "600",
  },
});
