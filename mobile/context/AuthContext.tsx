import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "@/requestMethod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator, Text } from "react-native";

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imgUrl?: string | null;
  coverImgUrl?: string | null;
  city?: string | null;
  createdDate: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (data: { token: string; user: User }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ LOGIN
  const login = async ({ token, user }: { token: string; user: User }) => {
    try {
      await AsyncStorage.setItem("token", token);
      setCurrentUser(user);
    } catch (err) {
      await AsyncStorage.removeItem("token");
      setCurrentUser(null);
      throw err;
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    try {
      await makeRequest.post("/auth/logout");
    } catch {}
    await AsyncStorage.removeItem("token");
    setCurrentUser(null);
    queryClient.clear();
  };

  // ✅ CHECK AUTH ON APP START
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          setCurrentUser(null);
          return;
        }

        const response = await makeRequest.get("/auth/profile");

        if (response.data?.user) {
          setCurrentUser(response.data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.log("Auth check failed:", err);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const refreshUser = async (): Promise<User | null> => {
    try {
      const response = await makeRequest.get("/auth/profile");
      if (response.data?.user) {
        setCurrentUser(response.data.user);
        return response.data.user;
      }
      return null;
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 16 }}>Loading User...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, login, logout, refreshUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthContextProvider");
  return ctx;
};
