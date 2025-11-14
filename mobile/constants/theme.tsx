export const COLORS = {
  primary: "#4ADE80",
  secondary: "#2DD4BF",
  background: "#000000",
  surface: "#1A1A1A",
  surfaceLight: "#2A2A2A",
  darkGrey: "#1F1F1F",
  lightGrey: "#D1D5DB",
  white: "#FFFFFF",
  grey: "#9CA3AF",
  error: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
} as const;

export const SIZES = {
  // Base sizes
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,

  // Padding & Margin
  padding: 16,
  margin: 16,

  // Border Radius
  radius: 8,
  radiusSmall: 4,
  radiusMedium: 12,
  radiusLarge: 16,
  radiusCircle: 9999,

  // Icon sizes
  icon: 24,
  iconSmall: 16,
  iconMedium: 20,
  iconLarge: 32,
  iconExtraLarge: 48,

  // Avatar sizes
  avatarSmall: 32,
  avatarMedium: 48,
  avatarLarge: 64,
  avatarExtraLarge: 100,

  // Button sizes
  buttonHeight: 48,
  buttonHeightSmall: 36,
  buttonHeightLarge: 56,

  // Input sizes
  inputHeight: 48,
  inputHeightSmall: 40,

  // Font sizes
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  body: 14,
  caption: 12,
  tiny: 10,
} as const;

export const FONTS = {
  regular: "System",
  medium: "System",
  bold: "System",
  semiBold: "System",
  light: "System",
} as const;

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export default {
  COLORS,
  SIZES,
  FONTS,
  SHADOWS,
  SPACING,
};
