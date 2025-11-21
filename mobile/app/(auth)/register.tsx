import { makeRequest } from "@/requestMethod";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./auth.styles";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // ✅ Error state
  const [successMessage, setSuccessMessage] = useState(""); // ✅ Success state
  const router = useRouter();

  const handleRegister = async () => {
    // Clear previous messages
    setErrorMessage("");
    setSuccessMessage("");

    if (!username || !email || !password) {
      setErrorMessage("Please fill all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    // Password validation
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);

      await makeRequest.post("/auth/register", {
        username,
        email,
        password,
      });

      // ✅ Show success message
      setSuccessMessage("Registration successful! Redirecting to login...");

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/(auth)/login");
      }, 1500);
    } catch (error: any) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );

      let message = "An unexpected error occurred";

      if (error.response) {
        // Extract error message from backend
        message =
          error.response.data?.error ||
          error.response.data?.message ||
          error.response.data?.details ||
          `Error ${error.response.status}`;
      } else if (error.request) {
        message = "Cannot connect to server. Please check your connection.";
      } else {
        message = error.message;
      }

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        {/* ✅ Error Message Display */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {errorMessage}</Text>
          </View>
        ) : null}

        {/* ✅ Success Message Display */}
        {successMessage ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>✅ {successMessage}</Text>
          </View>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#666"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setErrorMessage(""); // Clear error on input
          }}
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrorMessage(""); // Clear error on input
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password (min 6 characters)"
          placeholderTextColor="#666"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrorMessage(""); // Clear error on input
          }}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            disabled={loading}
          >
            <Text style={styles.link}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

export default Register;
