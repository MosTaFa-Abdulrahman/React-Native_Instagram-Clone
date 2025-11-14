import { styles } from "./auth.styles";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { makeRequest } from "@/requestMethod";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const { login } = useAuth();

  const handleLogin = async () => {
    // Clear previous errors
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please fill all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await makeRequest.post("/auth/login", {
        email,
        password,
      });

      await login({
        token: response.data.token,
        user: response.data.user,
      });

      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);

      let message = "An unexpected error occurred";

      if (error.response) {
        message =
          error.response.data?.error ||
          error.response.data?.message ||
          `Error ${error.response.status}`;
      } else if (error.request) {
        message = "Cannot connect to server. Please check your connection.";
      } else {
        message = error.message;
      }

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        {/* ✅ Error Message Display */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrorMessage(""); // Clear error on input
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrorMessage(""); // Clear error on input
          }}
          secureTextEntry
          autoCapitalize="none"
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
