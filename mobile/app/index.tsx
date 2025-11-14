import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";

// Context
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (currentUser) return <Redirect href="/(tabs)" />;

  return <Redirect href="/(auth)/login" />;
}
